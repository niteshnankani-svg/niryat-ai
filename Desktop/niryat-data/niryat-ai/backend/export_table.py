"""
NiryatAI Export Reference Table
Fetches world imports + India exports for 10 cotton/garment products from UN Comtrade.
Output: data/export_table_2023.csv

Strategy:
  - World imports: one call per reporter country with all 10 HS4 codes comma-separated
    (252 calls max, cached per country in raw/comtrade/all10_2023_{code}.json)
  - India exports: one call per product, flowCode=X, reporterCode=699
  - Clean filter before summing: customsCode=="C00" AND motCode==0
"""

import os, json, time, glob, csv, requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

KEY = os.getenv("COMTRADE_KEY")
if not KEY:
    raise SystemExit("ERROR: COMTRADE_KEY not set in .env")

HEADERS = {"Ocp-Apim-Subscription-Key": KEY}
BASE    = "https://comtradeapi.un.org/data/v1/get/C/A/HS"
RAW_DIR = os.path.join(os.path.dirname(__file__), "raw", "comtrade")
OUT_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(OUT_DIR, exist_ok=True)

PRODUCTS = [
    ("0904", "Pepper; dried/crushed Capsicum & Pimenta"),
    ("0905", "Vanilla"),
    ("0906", "Cinnamon"),
    ("0907", "Cloves"),
    ("0908", "Nutmeg, mace & cardamoms"),
    ("0909", "Anise, coriander, cumin, caraway seeds"),
    ("0910", "Ginger, turmeric, curry & other spices"),
    ("0901", "Coffee"),
    ("0902", "Tea"),
    ("0903", "Mate"),
]

HS4_CODES    = [hs for hs, _ in PRODUCTS]
CMD_PARAM    = ",".join(HS4_CODES)   # all 10 in one API param
INDIA_CODE   = 699

# Cache tag derived from the product set so different runs don't share files
CACHE_TAG    = "ch" + "_".join(sorted(set(hs[:2] for hs in HS4_CODES)))

def is_clean(row):
    return row.get("customsCode") == "C00" and row.get("motCode") == 0


def api_get(params, retries=5):
    """GET with exponential backoff on 429."""
    delay = 5
    for attempt in range(retries):
        r = requests.get(BASE, headers=HEADERS, params=params, timeout=30)
        if r.status_code == 429:
            wait = delay * (2 ** attempt)
            print(f"    429 rate-limit — waiting {wait}s...", flush=True)
            time.sleep(wait)
            continue
        r.raise_for_status()
        return r
    raise RuntimeError(f"Failed after {retries} retries: {params}")


# ---------------------------------------------------------------------------
# Reporter list
# ---------------------------------------------------------------------------

def get_reporters():
    r = requests.get(
        "https://comtradeapi.un.org/files/v1/app/reference/Reporters.json",
        headers=HEADERS, timeout=30,
    )
    r.raise_for_status()
    return [x for x in r.json()["results"] if not x.get("isGroup")]


# ---------------------------------------------------------------------------
# World imports: fetch all 10 products per country in one call
# ---------------------------------------------------------------------------

def fetch_world_imports(reporters):
    """Fetch (and cache) all-10-product import data for every reporter country."""
    fetched = skipped = errors = 0
    for i, rep in enumerate(reporters, 1):
        code = rep["reporterCode"]
        cache = os.path.join(RAW_DIR, f"{CACHE_TAG}_2023_{code}.json")
        if os.path.exists(cache):
            skipped += 1
            continue
        try:
            resp = api_get({
                "reporterCode": code,
                "flowCode":     "M",
                "period":       2023,
                "cmdCode":      CMD_PARAM,
                "partnerCode":  0,
            })
            records = resp.json().get("data", [])
            with open(cache, "w") as f:
                json.dump(records, f)
            fetched += 1
            if records:
                print(f"  [{i:3d}/{len(reporters)}] {rep['reporterDesc']:<35} {len(records):>3} rows")
            time.sleep(1)
        except Exception as e:
            errors += 1
            print(f"  [{i:3d}/{len(reporters)}] {rep['reporterDesc']:<35} ERROR: {e}")
            # do NOT write a cache file on error — let it retry on next run
            time.sleep(1)
    print(f"  World-imports fetch done: {fetched} new, {skipped} cached, {errors} errors")


def sum_world_imports(hs4):
    """Sum world imports for one HS4 code across all cached country files."""
    total = 0.0
    for cache in glob.glob(os.path.join(RAW_DIR, f"{CACHE_TAG}_2023_*.json")):
        with open(cache) as f:
            rows = json.load(f)
        for r in rows:
            if str(r.get("cmdCode", ""))[:4] == hs4 and is_clean(r):
                total += r.get("primaryValue") or 0.0
    return total


# ---------------------------------------------------------------------------
# India exports: one call per product
# ---------------------------------------------------------------------------

def fetch_india_exports(hs4):
    """Fetch India's export total for one HS4 code. Returns USD or None."""
    resp = api_get({
        "reporterCode": INDIA_CODE,
        "flowCode":     "X",
        "period":       2023,
        "cmdCode":      hs4,
        "partnerCode":  0,
    })
    rows = [r for r in resp.json().get("data", []) if is_clean(r)]
    if not rows:
        return None
    return sum(r.get("primaryValue") or 0.0 for r in rows)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("=== NiryatAI Export Reference Table ===\n")

    reporters = get_reporters()
    print(f"Reporter countries: {len(reporters)}")
    print(f"Products: {len(PRODUCTS)} HS4 codes → {CMD_PARAM}\n")

    # --- Step 1: world imports (bulk fetch, cached per country) ---
    cached_count = len(glob.glob(os.path.join(RAW_DIR, f"{CACHE_TAG}_2023_*.json")))
    need = len(reporters) - cached_count
    print(f"World-import cache: {cached_count}/{len(reporters)} countries already cached "
          f"({need} to fetch, ~{need}s at 1s/call)\n")
    fetch_world_imports(reporters)

    # --- Step 2: build table ---
    print("\nBuilding table...")
    results = []
    for hs4, name in PRODUCTS:
        # World imports from cache
        w_usd  = sum_world_imports(hs4)
        w_m    = round(w_usd / 1e6) if w_usd > 0 else None

        # India exports — fresh call
        time.sleep(1)
        i_usd  = fetch_india_exports(hs4)
        i_m    = round(i_usd / 1e6) if i_usd is not None else None

        w_str  = str(w_m)  if w_m  is not None else "no data"
        i_str  = str(i_m)  if i_m  is not None else "no data"
        print(f"  {hs4}  {name:<40}  world={w_str:>7}M  india={i_str:>7}M")

        results.append({
            "hs_code":              hs4,
            "product":              name,
            "world_imports_usd_m":  w_str,
            "india_exports_usd_m":  i_str,
        })

    # --- Step 3: sanity check ---
    check = next(r for r in results if r["hs_code"] == "0904")
    w_check = check["world_imports_usd_m"]
    print(f"\nSANITY CHECK 0904 (pepper) → world_imports = {w_check}M")
    if w_check == "no data":
        print("  FAIL — no data returned for 0904")
    else:
        val = int(w_check)
        if 3000 <= val <= 7000:
            print(f"  OK — {val} is within expected range $3B–$7B")
        elif val > 20000:
            print(f"  FAIL — {val} looks like a double-count. STOP.")
            return
        else:
            print(f"  WARNING — {val} is outside expected 3000–7000, review before using.")

    # --- Step 4: write CSV ---
    out_path = os.path.join(OUT_DIR, "export_table_spices_2023.csv")
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f, fieldnames=["hs_code", "product", "world_imports_usd_m", "india_exports_usd_m"]
        )
        writer.writeheader()
        writer.writerows(results)
    print(f"\nWritten → {out_path}")
    print("Done.")


if __name__ == "__main__":
    main()
