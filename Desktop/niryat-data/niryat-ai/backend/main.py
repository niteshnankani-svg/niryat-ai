import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import anthropic

_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(_env_path, override=True)

from rag import query_chromadb
from scraper import fetch_trade_data
from buyer_leads import get_buyer_leads, PREMIUM_EMAILS
from insurance_guide import stream_insurance
from trade_intel import get_intel, build_system_prompt_snippet

# Simple keyword gate — can be replaced by an intent classifier later.
_INSURANCE_KEYWORDS = {"insurance", "ecgc", "marine cargo", "premium", "claim",
                       "policy", "cover", "underwriter", "insured", "insurer"}

app = FastAPI(title="NiryatAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

_MARKET_TABLE = build_system_prompt_snippet()

SYSTEM_PROMPT = """You are NiryatAI — India's export mentor. Explain simply with real examples, step-by-step.

Rules:
- Numbered steps for processes
- Mention portals: dgft.gov.in, icegate.gov.in
- Be encouraging and practical
- For buyer requests respond with [BUYER_REQUEST:COUNTRY_NAME]
- When quoting market sizes, cite the world imports / India exports figures from the table below

You know: IEC registration (₹500, PAN+Aadhaar+cheque), AD Code, Incoterms 2020, FOB/CFR/CIF costing, payment terms (Advance/LC/DP/DA), export documents, LOI/SCO/FCO/NCNDA, govt schemes (Drawback/RoDTEP/MEIS/SEIS), APEDA labs, organic certification, 3-month export business plan.

""" + _MARKET_TABLE


class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []


class TradeDataRequest(BaseModel):
    hs_code: str
    country: Optional[str] = None
    year: str = "2023-2024"
    trade_type: str = "export"


class BuyerLeadsRequest(BaseModel):
    country: str
    product: Optional[str] = None
    user_email: str


def _is_insurance_question(text: str) -> bool:
    # Simple keyword gate — can be replaced by an intent classifier later.
    lower = text.lower()
    return any(kw in lower for kw in _INSURANCE_KEYWORDS)


@app.post("/chat")
async def chat(req: ChatRequest):
    try:
        if _is_insurance_question(req.message):
            def generate_insurance():
                for text in stream_insurance(req.message, req.history[-6:] if req.history else None):
                    yield f"data: {json.dumps({'chunk': text})}\n\n"
                yield "data: [DONE]\n\n"

            return StreamingResponse(
                generate_insurance(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no",
                },
            )

        rag_results = query_chromadb(req.message, n_results=3)
        rag_context = ""
        if rag_results and rag_results.get("documents"):
            chunks = rag_results["documents"][0]
            rag_context = "\n---\n".join(chunks)

        system = SYSTEM_PROMPT
        if rag_context:
            system += f"\n\nRelevant context:\n{rag_context}"

        messages = []
        for msg in req.history[-6:]:
            messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", ""),
            })
        messages.append({"role": "user", "content": req.message})

        def generate():
            with client.messages.stream(
                model="claude-haiku-4-5-20251001",
                max_tokens=600,
                system=system,
                messages=messages,
            ) as stream:
                for text in stream.text_stream:
                    chunk_data = json.dumps({"chunk": text})
                    yield f"data: {chunk_data}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/tradedata")
async def trade_data(req: TradeDataRequest):
    try:
        data = fetch_trade_data(
            hs_code=req.hs_code,
            year=req.year,
            trade_type=req.trade_type,
        )
        intel = get_intel(req.hs_code[:4]) if req.hs_code else None
        return {"data": data, "intel": intel}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/intel/{hs_code}")
async def intel(hs_code: str):
    result = get_intel(hs_code[:4])
    if not result:
        raise HTTPException(status_code=404, detail=f"No intel for HS {hs_code}")
    return result


REGISTERED_EMAILS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "registered_emails.json")


def load_registered_emails() -> dict:
    try:
        with open(REGISTERED_EMAILS_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_registered_email(email: str, product: str, name: str = ""):
    emails = load_registered_emails()
    emails[email.lower()] = {
        "product": product,
        "name": name,
        "registered_at": __import__("datetime").datetime.now().isoformat(),
    }
    with open(REGISTERED_EMAILS_FILE, "w") as f:
        json.dump(emails, f, indent=2)


class RegisterRequest(BaseModel):
    email: str
    product: str = ""
    name: str = ""


@app.post("/register")
async def register(req: RegisterRequest):
    if not req.email or "@" not in req.email:
        raise HTTPException(status_code=400, detail="Valid email required")
    save_registered_email(req.email, req.product, req.name)
    return {"status": "ok", "message": "Registered successfully"}


@app.post("/buyerleads")
async def buyer_leads(req: BuyerLeadsRequest):
    registered = load_registered_emails()
    is_premium = req.user_email.lower() in PREMIUM_EMAILS
    is_registered = req.user_email.lower() in registered
    leads = get_buyer_leads(req.country, req.product)

    if not leads:
        return {"leads": [], "message": f"No buyer leads found for {req.country}"}

    if is_premium or is_registered:
        return {"leads": leads, "premium": is_premium, "registered": is_registered}

    blurred = []
    for lead in leads:
        blurred.append({
            "company": lead.get("company", ""),
            "product": lead.get("product", ""),
            "city": lead.get("city", ""),
            "contact_person": "🔒 Unlock",
            "email": "🔒 Unlock",
            "phone": "🔒 Unlock",
            "website": "🔒 Unlock",
        })
    return {"leads": blurred, "premium": False, "registered": False}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "NiryatAI"}
