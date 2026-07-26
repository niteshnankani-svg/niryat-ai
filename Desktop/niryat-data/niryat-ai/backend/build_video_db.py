"""
Build video_summaries.json — the structured database of live-course video
session summaries, parsed from the markdown files in data/video_summaries/.

Output is consumed by:
  - main.py       (GET /videos, GET /videos/{slug})
  - ingest_videos.py (embeds sections into the `niryat_videos` Chroma collection)
  - frontend      (bundled copy at src/data/videoSummaries.json)

Run:  python3 build_video_db.py
"""

import os
import re
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SUMMARIES_DIR = os.path.join(SCRIPT_DIR, "data", "video_summaries")
OUTPUT_JSON = os.path.join(SUMMARIES_DIR, "video_summaries.json")
FRONTEND_JSON = os.path.join(
    SCRIPT_DIR, "..", "frontend", "src", "data", "videoSummaries.json"
)

# Per-session metadata not derivable from the markdown itself.
SESSIONS = {
    "Day1-Company-Formation.md": {
        "slug": "day1-company-formation",
        "day": 1, "session": 1, "order": 1,
        "shortTitle": "Company Formation & Pre-requisites",
        "topics": ["Company Formation", "IEC", "RCMC", "Bank Account", "Branding"],
        "icon": "building",
    },
    "Day1-Second-Session-Market-Research.md": {
        "slug": "day1-market-research",
        "day": 1, "session": 2, "order": 2,
        "shortTitle": "Market Research & Product Selection",
        "topics": ["HS Codes", "Market Research", "Trade Data", "Certification"],
        "icon": "search",
    },
    "Day2-FIEO-Govt-Schemes.md": {
        "slug": "day2-fieo-schemes",
        "day": 2, "session": 1, "order": 3,
        "shortTitle": "FIEO & Government Schemes",
        "topics": ["FIEO", "HS Codes", "FTAs", "Duty Drawback", "Incentives"],
        "icon": "schemes",
    },
    "Day2-Second-Session-Buyer-Sources.md": {
        "slug": "day2-buyer-sources",
        "day": 2, "session": 2, "order": 4,
        "shortTitle": "Finding International Buyers",
        "topics": ["Buyers", "Embassies", "Chambers of Commerce", "B2B Platforms", "Pricing"],
        "icon": "buyers",
    },
    "Day3-Ecommerce-Small-Business.md": {
        "slug": "day3-ecommerce",
        "day": 3, "session": 1, "order": 5,
        "shortTitle": "Global eCommerce for Small Business",
        "topics": ["eCommerce", "Amazon", "Logistics", "Payments", "Pricing"],
        "icon": "boxes",
    },
    "Day3-Second-Session-Lead-Generation.md": {
        "slug": "day3-lead-generation",
        "day": 3, "session": 2, "order": 6,
        "shortTitle": "Lead Generation Tools",
        "topics": ["Lead Generation", "LinkedIn", "Social Media", "Email Outreach"],
        "icon": "target",
    },
    "Day4-Incoterms.md": {
        "slug": "day4-incoterms",
        "day": 4, "session": 1, "order": 7,
        "shortTitle": "Incoterms (International Commercial Terms)",
        "topics": ["Incoterms", "FOB", "CIF", "Landed Cost", "Shipping"],
        "icon": "ship",
    },
    "Day4-Second-Session-International-Payments.md": {
        "slug": "day4-payments",
        "day": 4, "session": 2, "order": 8,
        "shortTitle": "International Payments & Banking",
        "topics": ["Letter of Credit", "Payments", "Banking", "FEMA", "Documents"],
        "icon": "payment",
    },
    "Day6-Customs-Agent.md": {
        "slug": "day6-customs-agent",
        "day": 6, "session": 1, "order": 9,
        "shortTitle": "Role of the Customs Agent (CHA)",
        "topics": ["Customs", "CHA", "Containers", "Shipping Lines", "Dry Ports"],
        "icon": "shield",
    },
    "Day6-Connecting-Dots.md": {
        "slug": "day6-connecting-dots",
        "day": 6, "session": 2, "order": 10,
        "shortTitle": "Connecting the Dots (Wrap-Up)",
        "topics": ["Action Plan", "Q&A", "Entrepreneurship", "Networking"],
        "icon": "sparkles",
    },
    "MASTER.md": {
        "slug": "master-summary",
        "day": 0, "session": 0, "order": 0,
        "shortTitle": "Master Course Summary",
        "topics": ["Course Overview", "Key Takeaways", "Action Checklist"],
        "icon": "trophy",
    },
}


def parse_markdown(path: str) -> dict:
    """Split a summary file into its H1 title, overview, and H2 sections."""
    with open(path, encoding="utf-8") as f:
        text = f.read()

    title_match = re.match(r"^#\s+(.+)", text)
    title = title_match.group(1).strip() if title_match else os.path.basename(path)

    sections = []
    for m in re.finditer(r"^##\s+(.+?)\n(.*?)(?=^##\s|\Z)", text, re.M | re.S):
        heading = m.group(1).strip()
        content = m.group(2).strip()
        if content:
            sections.append({"heading": heading, "content": content})

    overview = next(
        (s["content"] for s in sections if s["heading"].lower() == "overview"), ""
    )
    return {"title": title, "overview": overview, "sections": sections}


def main():
    entries = []
    for filename, meta in SESSIONS.items():
        path = os.path.join(SUMMARIES_DIR, filename)
        if not os.path.exists(path):
            print(f"MISSING: {filename}")
            continue
        parsed = parse_markdown(path)
        entries.append({
            "slug": meta["slug"],
            "day": meta["day"],
            "session": meta["session"],
            "order": meta["order"],
            "title": parsed["title"],
            "shortTitle": meta["shortTitle"],
            "topics": meta["topics"],
            "icon": meta["icon"],
            "sourceFile": filename,
            "sourceType": "course_video",
            "overview": parsed["overview"],
            "sections": parsed["sections"],
        })
        print(f"OK  {meta['slug']}: {len(parsed['sections'])} sections")

    entries.sort(key=lambda e: e["order"])
    db = {"generated": True, "count": len(entries), "sessions": entries}

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
    print(f"\nWrote {OUTPUT_JSON}")

    os.makedirs(os.path.dirname(FRONTEND_JSON), exist_ok=True)
    with open(FRONTEND_JSON, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
    print(f"Wrote {FRONTEND_JSON}")


if __name__ == "__main__":
    main()
