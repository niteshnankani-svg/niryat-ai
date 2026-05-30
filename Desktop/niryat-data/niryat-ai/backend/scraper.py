import requests
from bs4 import BeautifulSoup


def fetch_trade_data(hs_code: str, year: str = "2023-2024", trade_type: str = "export") -> list[dict]:
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    })

    if trade_type == "export":
        base_url = "https://tradestat.commerce.gov.in/eidb/ecom.asp"
    else:
        base_url = "https://tradestat.commerce.gov.in/eidb/icom.asp"

    resp = session.get(base_url)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    token = ""
    token_input = soup.find("input", {"name": "_token"})
    if token_input:
        token = token_input.get("value", "")

    hs_2digit = hs_code[:2]

    if trade_type == "export":
        detail_url = "https://tradestat.commerce.gov.in/eidb/ecomcntq.asp"
    else:
        detail_url = "https://tradestat.commerce.gov.in/eidb/icomcntq.asp"

    form_data = {
        "hscode": hs_2digit,
        "year": year,
    }
    if token:
        form_data["_token"] = token

    resp2 = session.post(detail_url, data=form_data)
    resp2.raise_for_status()

    return parse_trade_table(resp2.text)


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

        if not any(kw in " ".join(headers).lower() for kw in ["country", "value", "quantity"]):
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
