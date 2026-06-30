"""
NiryatAI Trade Data Pipeline
Fetches India's 4-digit HS commodity export data from tradestat.commerce.gov.in,
computes monthly averages and YoY growth, outputs products.json and products.db.

Usage:
  python trade_pipeline.py              # Full run
  python trade_pipeline.py --sample     # Fetch + show one sample, no output files
"""

import os
import json
import time
import sqlite3
import argparse
import requests
from bs4 import BeautifulSoup

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DIR = os.path.join(SCRIPT_DIR, "raw")
OUTPUT_JSON = os.path.join(SCRIPT_DIR, "products.json")
OUTPUT_DB = os.path.join(SCRIPT_DIR, "products.db")

EXPORT_URL = "https://tradestat.commerce.gov.in/eidb/commodity_wise_export"

CURRENT_YEAR = "2024-2025"

REQUEST_DELAY = 2
REQUEST_TIMEOUT = 60


# ---------------------------------------------------------------------------
# Token + POST handshake (reused from scraper.py — do not change)
# ---------------------------------------------------------------------------

def _make_session():
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    })
    return session


def _get_token(session):
    resp = session.get(EXPORT_URL, timeout=REQUEST_TIMEOUT)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    token_input = soup.find("input", {"name": "_token"})
    return token_input.get("value", "") if token_input else ""


def _post_commodity_table(session, token, year_label):
    year_val = year_label.split("-")[0]
    form_data = {
        "_token": token,
        "EidbYearCwe": year_val,
        "EidbComLevelCwe": "4",
        "comType": "all",
        "Eidb_ReportCwe": "2",
    }
    resp = session.post(EXPORT_URL, data=form_data, timeout=REQUEST_TIMEOUT)
    resp.raise_for_status()
    return resp.text


def parse_trade_table(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")
    tables = soup.find_all("table")
    results = []
    for table in tables:
        rows = table.find_all("tr")
        if len(rows) < 2:
            continue
        headers = []
        header_row = rows[0]
        for th in header_row.find_all(["th", "td"]):
            headers.append(th.get_text(strip=True))
        if not headers:
            continue
        for row in rows[1:]:
            cells = row.find_all("td")
            if len(cells) < 2:
                continue
            entry = {}
            for i, cell in enumerate(cells):
                key = headers[i] if i < len(headers) else f"col_{i}"
                entry[key] = cell.get_text(strip=True)
            if any(v for v in entry.values()):
                results.append(entry)
    return results


# ---------------------------------------------------------------------------
# Fetch with token-refresh retry
# ---------------------------------------------------------------------------

def fetch_commodity_table(session):
    """Fetch the full 4-digit table. DGFT returns both the requested year and
    the previous year in one response, so a single POST is enough.
    Retries once with a fresh token if the result is empty."""
    token = _get_token(session)
    html = _post_commodity_table(session, token, CURRENT_YEAR)

    rows = parse_trade_table(html)
    if not rows:
        print("  Empty table — refreshing token and retrying...")
        time.sleep(REQUEST_DELAY)
        token = _get_token(session)
        html = _post_commodity_table(session, token, CURRENT_YEAR)
        rows = parse_trade_table(html)

    return html, rows


# ---------------------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------------------

def _parse_number(value_str: str) -> float | None:
    if not value_str:
        return None
    cleaned = value_str.replace(",", "").replace(" ", "").strip()
    try:
        return float(cleaned)
    except ValueError:
        return None


def _find_year_columns(headers: list[str]) -> tuple[str | None, str | None]:
    """Identify the two year-value column names from the header row.
    DGFT headers look like: S.No. | HSCode | Commodity | 2023 - 2024 | %Share | 2024 - 2025 | %Share | %Growth
    We want the year columns (contain digits and a dash) but NOT %Share or %Growth."""
    year_cols = []
    for h in headers:
        stripped = h.strip()
        if any(ch.isdigit() for ch in stripped) and "-" in stripped and "%" not in stripped:
            year_cols.append(stripped)
    if len(year_cols) >= 2:
        return year_cols[0], year_cols[1]
    if len(year_cols) == 1:
        return year_cols[0], None
    return None, None


def normalize_rows(raw_rows: list[dict]) -> list[dict]:
    """Convert raw parsed rows into product records with both years."""
    if not raw_rows:
        return []

    headers = list(raw_rows[0].keys())
    prev_year_col, cur_year_col = _find_year_columns(headers)

    products = []
    for row in raw_rows:
        hs = row.get("HSCode", "").strip()
        if not hs or len(hs) != 4 or not hs.isdigit():
            continue

        commodity = row.get("Commodity", "").strip()

        usd_cur = _parse_number(row.get(cur_year_col, "")) if cur_year_col else None
        usd_prev = _parse_number(row.get(prev_year_col, "")) if prev_year_col else None
        growth = _parse_number(row.get("%Growth", ""))

        monthly_cur = round(usd_cur / 12, 2) if usd_cur and usd_cur > 0 else None
        monthly_prev = round(usd_prev / 12, 2) if usd_prev and usd_prev > 0 else None

        if growth is None and usd_cur is not None and usd_prev is not None and usd_prev > 0:
            growth = round((usd_cur - usd_prev) / usd_prev * 100, 2)

        products.append({
            "hs_code": hs,
            "commodity": commodity,
            "export_usd_2024": usd_cur,
            "export_usd_2023": usd_prev,
            "monthly_avg_2024": monthly_cur,
            "monthly_avg_2023": monthly_prev,
            "yoy_growth_pct": growth,
        })

    return products


# ---------------------------------------------------------------------------
# Output writers
# ---------------------------------------------------------------------------

def write_json(products: list[dict]):
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    print(f"Wrote {len(products)} products to {OUTPUT_JSON}")


def write_sqlite(products: list[dict]):
    if os.path.exists(OUTPUT_DB):
        os.remove(OUTPUT_DB)
    conn = sqlite3.connect(OUTPUT_DB)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE products (
            hs_code        TEXT PRIMARY KEY,
            commodity       TEXT,
            export_usd_2024 REAL,
            export_usd_2023 REAL,
            monthly_avg_2024 REAL,
            monthly_avg_2023 REAL,
            yoy_growth_pct  REAL
        )
    """)
    for p in products:
        cur.execute(
            "INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?)",
            (p["hs_code"], p["commodity"],
             p["export_usd_2024"], p["export_usd_2023"],
             p["monthly_avg_2024"], p["monthly_avg_2023"],
             p["yoy_growth_pct"]),
        )
    conn.commit()
    conn.close()
    print(f"Wrote {len(products)} products to {OUTPUT_DB}")


# ---------------------------------------------------------------------------
# Stub — to be wired up later for on-demand buyer/country breakdown
# ---------------------------------------------------------------------------

def fetch_buyers(hs_code: str) -> list[dict]:
    # TODO: Implement country-wise buyer breakdown for a given HS code.
    # Will POST with the specific hs_code to the country-wise endpoint
    # and return per-country import volumes.
    raise NotImplementedError(
        f"fetch_buyers('{hs_code}') is a stub — wire up the country-wise "
        "DGFT endpoint or Apify scraper here."
    )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="NiryatAI Trade Data Pipeline")
    parser.add_argument("--sample", action="store_true",
                        help="Fetch data and print one sample row, skip writing output files")
    args = parser.parse_args()

    os.makedirs(RAW_DIR, exist_ok=True)
    session = _make_session()

    print(f"Fetching 4-digit commodity table for {CURRENT_YEAR}...")
    print("  (DGFT returns both current and previous year in one response)")
    html, raw_rows = fetch_commodity_table(session)

    raw_path = os.path.join(RAW_DIR, f"export_{CURRENT_YEAR}.html")
    with open(raw_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"  Saved raw HTML → {raw_path}")
    print(f"  Parsed {len(raw_rows)} raw rows")

    products = normalize_rows(raw_rows)
    print(f"  Valid 4-digit products: {len(products)}")

    in_2024 = sum(1 for p in products if p["export_usd_2024"] is not None)
    in_2023 = sum(1 for p in products if p["export_usd_2023"] is not None)
    in_both = sum(1 for p in products
                  if p["export_usd_2024"] is not None and p["export_usd_2023"] is not None)

    print(f"\n{'='*50}")
    print(f"Products in 2024-2025:  {in_2024}")
    print(f"Products in 2023-2024:  {in_2023}")
    print(f"Matched across both:    {in_both}")
    print(f"Total 4-digit products: {len(products)}")
    print(f"{'='*50}")

    if products:
        sample = next((p for p in products if p["yoy_growth_pct"] is not None), products[0])
        print(f"\nSample product:")
        print(json.dumps(sample, indent=2))

    if args.sample:
        print("\n--sample mode: skipping output files.")
        return

    write_json(products)
    write_sqlite(products)
    print("\nDone!")


if __name__ == "__main__":
    main()
