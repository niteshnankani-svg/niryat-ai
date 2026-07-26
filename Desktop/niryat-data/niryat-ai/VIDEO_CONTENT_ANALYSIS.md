# Video Content Analysis — What the Course Videos Add Beyond the Study Material

**Date:** 2026-07-12
**Sources compared:**
- **Study material** (`DAYS/`, `PDF&PPTX/`, `SHEETS/` — already ingested into ChromaDB collection `niryat_exim`, 20,832 chunks): FTP 2015-20, EXIM Study Material Book 2020, EPC lists, LC formats & discrepancy guides, MEIS/SEIS scheme tables, documentation annexures, HS code lists, APEDA packhouse/lab lists, drawback rates, AD-code registration procedures, quotation/NCNDA/LOI/FCO/SCO contract formats, product data sheets, country-wise buyer lists, costing sheet, ITC Trademap tutorials, GEI topic videos.
- **Video session summaries** (10 unlisted YouTube recordings of the live course, Days 1–4 & 6, summarized in English from Hindi/Hinglish audio — now in `backend/data/video_summaries/`).

## Verdict: the videos are a genuinely unique asset

The unlisted live-session recordings contain **experiential, instructor-voiced knowledge that is not in any of the official documents and not publicly available**. The study material answers *"what are the rules and formats"*; the videos answer *"how do you actually do this, in what order, and what goes wrong."* That distinction is exactly the gap first-time exporters struggle with, and it is the content most defensible as a differentiator for NiryatAI.

## Unique knowledge found ONLY in the videos (not in the document corpus)

| # | Video-only knowledge | Session | Customer value |
|---|---|---|---|
| 1 | **Value-addition / differentiation strategy** (raw onion → onion powder/rings; turmeric blends; hair packs) as the core product-selection principle | Day 1 S1 | High — a strategy lens no format/document teaches |
| 2 | **Company naming & structure advice** (short names, domain check, proprietorship vs Pvt Ltd uniqueness rules) + live dgft.gov.in IEC walkthrough + **IEC annual-updation deactivation warning** | Day 1 S1 | High — practical setup sequence |
| 3 | **Data-driven product validation workflow** using commerce.gov.in, Export-Import Data Bank, Niryat Mitra app — with the instructor's method for reading trends | Day 1 S2 | High — complements Trademap tutorials with India-specific tools |
| 4 | **Which council/board to register with for edge cases** (tamarind kernel powder = end-use industry not raw origin; multi-product = multiple RCMCs) | Day 1 S2, Day 3 S2 | High — real Q&A rulings not printed anywhere |
| 5 | **FIEO's practical role** + Indian embassy commercial departments and foreign chambers (Indo-American Chamber) as buyer-discovery channels | Day 2 S1–S2 | Medium-high |
| 6 | **Amazon Global Selling operations**: Foreign Post Offices (FPO) city list, payment gateways & FIRC, per-market pricing, returns budgeting | Day 3 S1 | High — actionable eCommerce playbook |
| 7 | **Lead-generation tooling**: LinkedIn decision-maker targeting, Chrome contact-finder extensions, email automation, Quora positioning | Day 3 S2 | Medium — modern tactics absent from 2020-era documents |
| 8 | **Incoterms taught with worked profit examples** and the instructor's landed-cost spreadsheet method (product + margin + freight + clearance + duty) | Day 4 S1 | High — the documents have the matrix; the video has the reasoning |
| 9 | **Payments risk ladder narrative** (advance → LC → D/P → D/A → open account) + who-pays-bank-charges and **cancellation-charge negotiation** | Day 4 S2 | High |
| 10 | **CHA worked example end-to-end**: container types (FCL/LCL/reefer/open-top/flat-rack), ICD/dry ports for landlocked exporters, factory-stuffing permission, booking flow, customs self-assessment | Day 6 S1 | High — the single best process narrative in the corpus |
| 11 | **Live Q&A rulings**: jaggery labeling, Ayurvedic/Unani regulatory path, African-market agent payment risk, grey-market duty warning, sample/courier cost etiquette | All | High — long-tail questions customers actually ask |
| 12 | **Career/credibility signals**: CHA-experience→MBA→Delhi-cargo career path, govt entrepreneurship training loan subsidy | Day 6 S2 | Medium |

## Overlap with study material (both sources cover)
IEC/RCMC basics, HS-code structure, LC mechanics, Incoterms definitions, scheme names (drawback, interest subvention), quotation elements. **This overlap is a feature**: retrieving the same fact from both a formal document and a live session increases answer confidence and lets the assistant cite the official format *and* the practical advice.

## Data segregation decision (implemented)

Two separate vector collections in the same ChromaDB store:

| Collection | Content | Chunking | Metadata |
|---|---|---|---|
| `niryat_exim` (existing) | Study material documents | 400-word windows | source file, folder |
| `niryat_videos` (new) | 10 video session summaries | **one chunk per markdown section** (semantically coherent) | slug, day, session title, section heading, `source_type: course_video` |

The `/chat` endpoint now queries **both** collections and labels every context block `[COURSE VIDEO — <session>]` or `[STUDY MATERIAL — <file>]`, so the LLM can attribute its answer to the live course vs. official documents. Keeping the collections separate (rather than one collection with a metadata filter) means either source can be re-ingested, weighted, or queried independently without touching the other.

## Frontend changes (implemented + recommended)

**Implemented now:**
1. **New "Expert Insights" page** (`/insights`) — browsable cards for all 10 live sessions with day badges, topic tags, and expandable section-by-section detail. Framed as exclusive content ("From our private live-training recordings — not available anywhere else").
2. **Sidebar entry** with a session-count badge.
3. Chat answers automatically enriched with video knowledge (backend change, no UI change needed).

**Recommended next (not yet built):**
- Show a "source: Expert Session / Official Document" chip on chat answers (data is already labeled server-side).
- Deep-link chat → relevant session card ("Learn more in Day 4: Incoterms").
- Gate full session detail behind credits/login to monetize the exclusive content.
- If Day 5 and Trademap recordings are ever obtained, run the same summarize→ingest pipeline (`ingest_videos.py`) to extend the collection.
