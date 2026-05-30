import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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

SYSTEM_PROMPT = """You are NiryatAI — India's most helpful export assistant. You speak like a knowledgeable, friendly mentor who explains things simply, with real examples, step by step. You help first-time exporters and occasional exporters navigate the entire export journey.

When answering, always:
- Use simple language with real examples
- Give step-by-step numbered format for processes
- Mention relevant government portals (dgft.gov.in, icegate.gov.in)
- Be encouraging — export feels overwhelming but it's learnable
- When asked for buyers in a country, respond with [BUYER_REQUEST:COUNTRY_NAME]

Key knowledge areas:
- IEC registration (dgft.gov.in, ₹500 fee, PAN+Aadhaar+cancelled cheque)
- AD Code registration on ICEGATE
- All 11 Incoterms 2020 (EXW, FCA, FAS, FOB, CFR, CIF, CPT, CIP, DAP, DPU, DDP)
- FOB/CFR/CIF costing calculation
- Payment terms (Advance, LC, DP, DA)
- Trade documents (Commercial Invoice, Packing List, BL, Certificate of Origin, Shipping Bill)
- LOI, SCO, FCO, NCNDA, IMFPA explained
- Government schemes: Drawback, RoDTEP, IGST refund, MEIS, SEIS
- MEIS Group A (USA, UK, Germany, France + 26 EU countries)
- MEIS Group B (UAE, Saudi, China, Brazil, 139 countries)
- APEDA labs for food testing
- Organic certification (NPOP, USDA NOP)
- 3-month business plan for new exporters
- Quotation 8 elements: Description, Quality, Packing, Incoterms, Price, Payment Terms, Validity, Other conditions"""


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
        rag_results = query_chromadb(req.message)
        rag_context = ""
        if rag_results and rag_results.get("documents"):
            chunks = rag_results["documents"][0]
            rag_context = "\n\n---\n\n".join(chunks)

        system = SYSTEM_PROMPT
        if rag_context:
            system += f"\n\nRelevant knowledge from export documents:\n{rag_context}"

        messages = []
        for msg in req.history[-10:]:
            messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", ""),
            })
        messages.append({"role": "user", "content": req.message})

        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2048,
            system=system,
            messages=messages,
        )

        return {"response": response.content[0].text}
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
