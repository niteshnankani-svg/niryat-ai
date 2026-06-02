import requests
from bs4 import BeautifulSoup


def fetch_trade_data(hs_code: str, year: str = "2024-2025", trade_type: str = "export") -> list[dict]:
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    })

    if trade_type == "export":
        url = "https://tradestat.commerce.gov.in/eidb/commodity_wise_export"
    else:
        url = "https://tradestat.commerce.gov.in/eidb/commodity_wise_import"

    # Step 1: GET page to extract CSRF token
    resp = session.get(url)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    token = ""
    token_input = soup.find("input", {"name": "_token"})
    if token_input:
        token = token_input.get("value", "")

    year_val = year.split("-")[0]

    # Determine the digit level to query based on HS code length
    # We query at the same digit level as the input, so results match
    hs_digits = len(hs_code)
    if hs_digits <= 2:
        level = "2"
    elif hs_digits <= 4:
        level = "4"
    elif hs_digits <= 6:
        level = "6"
    else:
        level = "8"

    # Step 2: POST to get all commodities at that digit level
    form_data = {
        "_token": token,
        "EidbYearCwe": year_val,
        "EidbComLevelCwe": level,
        "comType": "all",
        "Eidb_ReportCwe": "2",
    }

    resp2 = session.post(url, data=form_data)
    resp2.raise_for_status()

    all_results = parse_trade_table(resp2.text)

    # Step 3: Filter results by the specific HS code prefix
    hs_prefix = hs_code.strip()
    if hs_prefix:
        filtered = [
            row for row in all_results
            if row.get("HSCode", "").startswith(hs_prefix)
        ]
        # If we got matches, return them; otherwise return all
        # (user might have entered a code that doesn't exist at that level)
        if filtered:
            return filtered

    return all_results


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
