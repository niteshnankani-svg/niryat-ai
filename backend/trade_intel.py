"""
NiryatAI Trade Intelligence
Merges Comtrade world-import data with DGFT products.json into a fast in-memory lookup.
Loaded once at startup; no DB round-trips at query time.
"""

import os
import re
import csv
import json

_DIR = os.path.dirname(os.path.abspath(__file__))

_CSV_FILES = [
    os.path.join(_DIR, "data", "export_table_2023.csv"),
    os.path.join(_DIR, "data", "export_table_spices_2023.csv"),
    os.path.join(_DIR, "data", "export_table_leather_2023.csv"),
    os.path.join(_DIR, "data", "export_table_grains_2023.csv"),
    os.path.join(_DIR, "data", "export_table_oilseeds_2023.csv"),
    os.path.join(_DIR, "data", "export_table_growth_2023.csv"),
    os.path.join(_DIR, "data", "export_table_easyentry2_2023.csv"),
]

_PRODUCTS_JSON = os.path.join(_DIR, "products.json")

# hs4 -> dict with all intel fields
_intel: dict[str, dict] = {}


def _load():
    # Load DGFT products (India domestic export trends from DGFT)
    dgft: dict[str, dict] = {}
    if os.path.exists(_PRODUCTS_JSON):
        with open(_PRODUCTS_JSON, encoding="utf-8") as f:
            for p in json.load(f):
                hs = str(p.get("hs_code", "")).zfill(4)
                dgft[hs] = p

    # Load Comtrade CSVs (world imports + India exports, USD millions)
    comtrade: dict[str, dict] = {}
    for path in _CSV_FILES:
        if not os.path.exists(path):
            continue
        with open(path, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                hs = row["hs_code"].zfill(4)
                def _num(v):
                    try:
                        return float(v) if v not in ("", "no data") else None
                    except ValueError:
                        return None
                comtrade[hs] = {
                    "product":              row["product"],
                    "world_imports_usd_m":  _num(row["world_imports_usd_m"]),
                    "india_exports_usd_m":  _num(row["india_exports_usd_m"]),
                    "india_share_pct":      _num(row.get("india_share_pct", "")),
                    "signal":               row.get("signal", ""),
                }

    # Merge
    all_hs = set(dgft) | set(comtrade)
    for hs in all_hs:
        d = dgft.get(hs, {})
        c = comtrade.get(hs, {})

        world_m  = c.get("world_imports_usd_m")
        india_m  = c.get("india_exports_usd_m")

        _intel[hs] = {
            "hs_code":              hs,
            "commodity":            c.get("product") or d.get("commodity", ""),
            # Comtrade (USD millions, 2023 calendar year)
            "world_imports_usd_m":  world_m,
            "india_exports_usd_m":  india_m,
            "india_share_pct":      c.get("india_share_pct"),
            "signal":               c.get("signal", "") or None,
            # DGFT (USD millions, fiscal years)
            "dgft_export_2024":     d.get("export_usd_2024"),
            "dgft_export_2023":     d.get("export_usd_2023"),
            "dgft_monthly_avg":     d.get("monthly_avg_2024"),
            "dgft_yoy_growth_pct":  d.get("yoy_growth_pct"),
        }


_load()


def get_intel(hs_code: str) -> dict | None:
    """Return merged intel for a 4-digit HS code, or None if unknown."""
    return _intel.get(str(hs_code).zfill(4))


_HS_SEARCH_STOPWORDS = {
    "the", "a", "an", "for", "of", "and", "or", "to", "is", "in", "my",
    "what", "which", "code", "hsn", "hs", "export", "exporting", "import",
    "importing", "product", "products", "give", "need", "find", "tell",
    "me", "please", "item", "items", "want", "under", "should", "use",
    "used", "identify", "recommend", "correct", "right", "proper",
    # Common filler words in tariff-schedule descriptions themselves —
    # excluding these avoids matching on formulaic legal boilerplate
    # instead of the actual product name.
    "made", "other", "including", "with", "without", "parts", "articles",
    "goods", "than", "not", "excluding", "except", "similar", "kind",
}


def search_hs_codes(query: str, limit: int = 6) -> list[dict]:
    """
    Keyword search over the merged commodity database — finds the closest-
    matching HS headings for a free-text product description (e.g. "cotton
    yarn" or "mouth freshener").

    This is a heading-level (4-digit) match against ~1225 known commodities,
    not a full 8-digit tariff classification — good for pointing someone at
    the right chapter/heading, not a substitute for official classification.

    Matches on whole words only (word-boundary regex, not raw substring) so
    a query word like "mouth" doesn't false-positive match inside an
    unrelated word like "VERMOUTH". Score weights by matched-word length so
    a specific word (e.g. "basmati") outranks a generic filler word that
    slipped past the stopword list.
    """
    words = [w for w in re.findall(r"[a-z]+", query.lower())
             if w not in _HS_SEARCH_STOPWORDS and len(w) > 2]
    if not words:
        return []
    patterns = [(w, re.compile(rf"\b{re.escape(w)}\b")) for w in words]

    scored = []
    for entry in _intel.values():
        commodity = (entry.get("commodity") or "").lower()
        if not commodity:
            continue
        score = sum(len(w) for w, pat in patterns if pat.search(commodity))
        if score:
            scored.append((score, entry))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [e for _, e in scored[:limit]]


def format_hs_matches(matches: list[dict]) -> str:
    """Compact table of HS code search results to inject into the chat context."""
    if not matches:
        return ""
    lines = ["HS heading | Commodity (DGFT/Comtrade description)",
             "-----------|----------------------------------------"]
    for m in matches:
        lines.append(f"{m['hs_code']}       | {m['commodity'][:60]}")
    return "\n".join(lines)


def get_all() -> list[dict]:
    return list(_intel.values())


def get_comtrade_products() -> list[dict]:
    """Return only the products that have Comtrade world-import data."""
    return [v for v in _intel.values() if v.get("world_imports_usd_m") is not None]


def build_system_prompt_snippet() -> str:
    """Compact market-size table to inject into the chat system prompt."""
    rows = sorted(get_comtrade_products(), key=lambda x: x.get("world_imports_usd_m") or 0, reverse=True)
    if not rows:
        return ""
    lines = ["## World market sizes (Comtrade 2023, USD millions)",
             "HS   | Product                                    | World imports | India exports | India share",
             "-----|--------------------------------------------|--------------:|--------------|------------"]
    for r in rows:
        w = f"{r['world_imports_usd_m']:,.0f}" if r['world_imports_usd_m'] else "—"
        i = f"{r['india_exports_usd_m']:,.0f}" if r['india_exports_usd_m'] else "—"
        s = f"{r['india_share_pct']}%" if r['india_share_pct'] else "—"
        lines.append(f"{r['hs_code']} | {r['commodity'][:42]:<42} | {w:>13} | {i:>12} | {s}")
    return "\n".join(lines)
