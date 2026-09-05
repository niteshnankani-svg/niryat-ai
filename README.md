# NiryatAI

An export-intelligence platform for Indian exporters: a RAG-backed chat assistant over export documentation and training videos, HS-code-level trade data (export values, growth trends), scraped buyer leads by country, and export-insurance guidance — behind a React dashboard.

## Architecture

**Backend (`backend/`)** — a FastAPI app (`main.py`) exposing:
- `POST /chat` — RAG-backed chat, grounded in ingested documents (PDFs, DOCX, XLSX, PPTX, and video transcripts) via a ChromaDB vector store (`rag.py`) queried with `sentence-transformers` embeddings, answered by Anthropic Claude.
- `GET /intel/{hs_code}`, `POST /tradedata`, `GET /comtrade`, `GET /products` — HS-code-level trade data (export value, YoY growth) served from a local SQLite table (`trade_intel.py`, `scraper.py`, `products.db`, built from the CSVs in `backend/data/`).
- `POST /buyerleads` — country-filtered buyer leads scraped from public sources (`buyer_leads.py`, `buyer_leads_data.json`).
- `stream_insurance` / insurance endpoints — export-insurance guidance (`insurance_guide.py`).
- `GET /videos`, `GET /videos/{slug}` — summaries of recorded training sessions (`backend/data/video_summaries/`).
- `POST /register`, `GET /credits/{email}`, `POST /credits/deduct`, `POST /credits/purchase`, `POST /promo/apply` — a simple email-registration + credits system gating premium features (`credits.py`).

**Ingestion (`ingest.py`)** — a standalone pipeline that extracts text from PDF/DOCX/DOC/XLSX/XLT/PPTX/PPT/MP4/MP3 source material, chunks it, embeds it with `sentence-transformers`, and stores it in the ChromaDB collection the chat endpoint queries at runtime.

**Frontend (`frontend/`)** — a React 19 + Vite + Tailwind dashboard (chat panel, buyer directory, trade-data tables/comparisons, "Getting Started" and "Expert Insights" pages), talking to the backend over a thin API client (`frontend/src/api/`).

```
Source docs / videos
        │
ingest.py → chunk → embed (sentence-transformers) → ChromaDB
        │
Question → backend/rag.py (retrieve) → Claude (answer)   ┐
                                                            ├─ POST /chat
HS code → backend/trade_intel.py → products.db (SQLite)   ┘  GET /intel, /tradedata

Country → backend/buyer_leads.py → buyer_leads_data.json  → POST /buyerleads

React dashboard (frontend/) ──────────────────────────────→ backend/main.py (FastAPI)
```

## Tech stack

FastAPI, Anthropic Claude, ChromaDB, `sentence-transformers`, `pdfplumber`/`python-docx`/`python-pptx`/`openpyxl` (document extraction), `openai-whisper` (video/audio transcription), SQLite, React 19, Vite, Tailwind CSS, Railway (`backend/.railway.json`, `Procfile`).

## Setup / run

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env   # add ANTHROPIC_API_KEY and any other required keys
python main.py         # or: uvicorn main:app --reload

# Ingest source documents into the vector store (from repo root)
python ingest.py

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env   # point at the backend URL
npm run dev
```

## Known limitations

- **Repo layout was recently flattened.** This project's files previously lived nested under `Desktop/niryat-data/niryat-ai/...` in this repo (an artifact of how it was first pushed) — they've been moved to the repo root; git history for these files is preserved through the move.
- `backend/products.db` and `backend/registered_emails.json` were previously tracked in git despite the repo's own `.gitignore` explicitly excluding them as runtime state; they've now been untracked. `products.db` needs to be rebuilt locally from the CSVs in `backend/data/` (see `export_table.py`/`build_kb*.py`-style scripts) before the trade-data endpoints will return data.
- `backend/buyer_leads_data.json` contains scraped, publicly-listed business contact information (company name, city, public phone/website) for outreach — no private individual data, but treat it as data you may need to refresh/re-scrape rather than a permanent source of truth.
- No automated test suite is currently checked into this repo.
- `frontend/README.md` is still the default Vite template README, not project-specific documentation.
