import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv
import anthropic

from rag import query_chromadb
from scraper import fetch_trade_data
from buyer_leads import get_buyer_leads, PREMIUM_EMAILS

_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(_env_path, override=True)

app = FastAPI(title="NiryatAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are NiryatAI — India's export mentor. Explain simply with real examples, step-by-step.

Rules:
- Numbered steps for processes
- Mention portals: dgft.gov.in, icegate.gov.in
- Be encouraging and practical
- For buyer requests respond with [BUYER_REQUEST:COUNTRY_NAME]

You know: IEC registration (₹500, PAN+Aadhaar+cheque), AD Code, Incoterms 2020, FOB/CFR/CIF costing, payment terms (Advance/LC/DP/DA), export documents, LOI/SCO/FCO/NCNDA, govt schemes (Drawback/RoDTEP/MEIS/SEIS), APEDA labs, organic certification, 3-month export business plan."""


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


@app.post("/chat")
async def chat(req: ChatRequest):
    try:
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
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/buyerleads")
async def buyer_leads(req: BuyerLeadsRequest):
    is_premium = req.user_email.lower() in PREMIUM_EMAILS
    leads = get_buyer_leads(req.country, req.product)

    if not leads:
        return {"leads": [], "message": f"No buyer leads found for {req.country}"}

    if is_premium:
        return {"leads": leads, "premium": True}

    blurred = []
    for lead in leads:
        blurred.append({
            "company": lead.get("company", ""),
            "product": lead.get("product", ""),
            "city": lead.get("city", ""),
            "contact_person": "🔒 Unlock with Premium",
            "email": "🔒 Unlock with Premium",
            "phone": "🔒 Unlock with Premium",
            "website": "🔒 Unlock with Premium",
        })
    return {"leads": blurred, "premium": False}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "NiryatAI"}
