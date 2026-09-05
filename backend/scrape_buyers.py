"""
NiryatAI Buyer Leads Scraper
Uses Apify Google Maps Business Leads Scraper to find importers/buyers
across all target countries for Indian export products.

Usage:
  python scrape_buyers.py                    # Scrape all countries
  python scrape_buyers.py --country UAE      # Scrape single country
  python scrape_buyers.py --country UAE --country USA  # Multiple countries
  python scrape_buyers.py --dry-run          # Show what would be scraped

Requires: APIFY_TOKEN environment variable
Output: buyer_leads_data.json
"""

import os
import json
import time
import argparse
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

APIFY_TOKEN = os.getenv("APIFY_TOKEN", "")
APIFY_API = "https://api.apify.com/v2"
GOOGLE_MAPS_ACTOR = "lurkapi~google-maps-business-leads-scraper"
IMPORTYETI_ACTOR = "khadinakbar~importyeti-scraper"

OUTPUT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "buyer_leads_data.json")

# Search queries per product category — these find IMPORTERS/BUYERS, not exporters
PRODUCT_SEARCHES = [
    "food importers",
    "spice importers",
    "rice importers wholesaler",
    "textile importers garment buyers",
    "grocery wholesaler distributor",
    "pharmaceutical importers",
    "gem diamond jewelry importers",
    "organic food importers",
    "tea coffee importers",
    "seafood importers",
]

# All 41 target countries with their search locations
COUNTRIES = {
    "USA": ["New York, USA", "Los Angeles, USA", "Houston, USA"],
    "UAE": ["Dubai, UAE", "Abu Dhabi, UAE"],
    "UK": ["London, UK", "Birmingham, UK"],
    "Germany": ["Hamburg, Germany", "Berlin, Germany"],
    "Saudi Arabia": ["Riyadh, Saudi Arabia", "Jeddah, Saudi Arabia"],
    "China": ["Shanghai, China", "Guangzhou, China"],
    "Japan": ["Tokyo, Japan", "Osaka, Japan"],
    "Singapore": ["Singapore"],
    "Australia": ["Sydney, Australia", "Melbourne, Australia"],
    "Canada": ["Toronto, Canada", "Vancouver, Canada"],
    "Netherlands": ["Rotterdam, Netherlands", "Amsterdam, Netherlands"],
    "France": ["Paris, France", "Marseille, France"],
    "Italy": ["Milan, Italy", "Rome, Italy"],
    "Spain": ["Barcelona, Spain", "Madrid, Spain"],
    "Belgium": ["Antwerp, Belgium", "Brussels, Belgium"],
    "South Korea": ["Seoul, South Korea", "Busan, South Korea"],
    "Malaysia": ["Kuala Lumpur, Malaysia"],
    "Thailand": ["Bangkok, Thailand"],
    "Vietnam": ["Ho Chi Minh City, Vietnam", "Hanoi, Vietnam"],
    "Indonesia": ["Jakarta, Indonesia", "Surabaya, Indonesia"],
    "Bangladesh": ["Dhaka, Bangladesh"],
    "Sri Lanka": ["Colombo, Sri Lanka"],
    "Nepal": ["Kathmandu, Nepal"],
    "South Africa": ["Cape Town, South Africa", "Johannesburg, South Africa"],
    "Nigeria": ["Lagos, Nigeria"],
    "Kenya": ["Nairobi, Kenya", "Mombasa, Kenya"],
    "Egypt": ["Cairo, Egypt", "Alexandria, Egypt"],
    "Turkey": ["Istanbul, Turkey", "Izmir, Turkey"],
    "Brazil": ["São Paulo, Brazil", "Rio de Janeiro, Brazil"],
    "Mexico": ["Mexico City, Mexico", "Guadalajara, Mexico"],
    "Russia": ["Moscow, Russia", "Saint Petersburg, Russia"],
    "Poland": ["Warsaw, Poland", "Gdansk, Poland"],
    "Sweden": ["Stockholm, Sweden", "Gothenburg, Sweden"],
    "Norway": ["Oslo, Norway"],
    "Denmark": ["Copenhagen, Denmark"],
    "Switzerland": ["Zurich, Switzerland", "Geneva, Switzerland"],
    "Austria": ["Vienna, Austria"],
    "New Zealand": ["Auckland, New Zealand"],
    "Israel": ["Tel Aviv, Israel", "Haifa, Israel"],
    "Qatar": ["Doha, Qatar"],
    "Kuwait": ["Kuwait City, Kuwait"],
}


def run_google_maps_scrape(search_terms: list, location: str, max_per_search: int = 20) -> str:
    """Run Google Maps actor and return the run ID."""
    url = f"{APIFY_API}/acts/{GOOGLE_MAPS_ACTOR}/runs"
    payload = {
        "searchTerms": search_terms,
        "location": location,
        "maxPlacesPerSearch": max_per_search,
        "hasWebsite": True,
        "outputTitle": True,
        "outputPhone": True,
        "outputWebsite": True,
        "outputEmail": True,
        "outputAddress": True,
        "outputCity": True,
        "outputCountry": True,
        "outputCategory": True,
        "outputEmails": True,
        "outputPhones": True,
        "outputSocials": True,
        "outputRating": True,
        "outputReviewCount": True,
    }
    headers = {"Authorization": f"Bearer {APIFY_TOKEN}", "Content-Type": "application/json"}
    resp = requests.post(url, json=payload, headers=headers, params={"waitForFinish": 300})
    resp.raise_for_status()
    data = resp.json()["data"]
    return data["defaultDatasetId"]


def run_importyeti_scrape(queries: list, max_per_query: int = 20) -> str:
    """Run ImportYeti actor for US importers."""
    url = f"{APIFY_API}/acts/{IMPORTYETI_ACTOR}/runs"
    payload = {
        "searchQueries": queries,
        "maxResultsPerQuery": max_per_query,
        "typeFilter": "company",
        "countryCode": "US",
        "minShipments": 3,
    }
    headers = {"Authorization": f"Bearer {APIFY_TOKEN}", "Content-Type": "application/json"}
    resp = requests.post(url, json=payload, headers=headers, params={"waitForFinish": 300})
    resp.raise_for_status()
    data = resp.json()["data"]
    return data["defaultDatasetId"]


def fetch_dataset(dataset_id: str, limit: int = 1000) -> list:
    """Fetch all items from an Apify dataset."""
    url = f"{APIFY_API}/datasets/{dataset_id}/items"
    headers = {"Authorization": f"Bearer {APIFY_TOKEN}"}
    resp = requests.get(url, headers=headers, params={"limit": limit, "format": "json"})
    resp.raise_for_status()
    return resp.json()


def process_google_maps_lead(item: dict, country_name: str) -> dict | None:
    """Convert Google Maps result to our buyer lead format."""
    if item.get("status") != "Success":
        return None
    if item.get("permanentlyClosed"):
        return None

    title = item.get("title", "").strip()
    if not title:
        return None

    # Get the best email
    email = item.get("email") or ""
    if not email and item.get("emails"):
        email = item["emails"][0]

    # Get the best phone
    phone = item.get("phone") or ""
    if not phone and item.get("phones"):
        phone = item["phones"][0]

    website = item.get("website") or ""
    city = item.get("city") or item.get("state") or ""
    category = item.get("category") or ""

    # Build product from category
    product = category
    if not product:
        product = "General Trading"

    lead = {
        "company": title,
        "product": product,
        "city": city,
        "country": country_name,
        "contact_person": "Contact via company",
        "email": email if email else "See website",
        "phone": phone if phone else "See website",
        "website": website.replace("https://", "").replace("http://", "").rstrip("/"),
        "rating": item.get("rating"),
        "reviews": item.get("reviewCount"),
        "address": item.get("address", ""),
        "source": "google_maps",
        "socials": {
            k: item.get(k) for k in ["facebook", "instagram", "linkedin", "twitter"]
            if item.get(k)
        },
    }
    return lead


def process_importyeti_lead(item: dict) -> dict | None:
    """Convert ImportYeti result to our buyer lead format."""
    name = item.get("companyName", "").strip()
    if not name:
        return None

    lead = {
        "company": name,
        "product": "US Importer (Verified Customs Data)",
        "city": "",
        "country": "USA",
        "contact_person": "Contact via company",
        "email": "See website",
        "phone": "See website",
        "website": item.get("profileUrl", ""),
        "address": item.get("address", ""),
        "total_shipments": item.get("totalShipments", 0),
        "most_recent_shipment": item.get("mostRecentShipment", ""),
        "source": "importyeti",
    }

    # Extract city from address
    addr = item.get("address", "")
    if addr:
        parts = [p.strip() for p in addr.split(",")]
        if len(parts) >= 2:
            lead["city"] = parts[-3] if len(parts) >= 3 else parts[0]

    return lead


def load_existing_leads() -> dict:
    """Load existing buyer leads from JSON file."""
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, "r") as f:
            return json.load(f)
    return {}


def save_leads(leads_db: dict):
    """Save buyer leads to JSON file."""
    with open(OUTPUT_FILE, "w") as f:
        json.dump(leads_db, f, indent=2, ensure_ascii=False)
    total = sum(len(v) for v in leads_db.values())
    print(f"Saved {total} leads across {len(leads_db)} countries to {OUTPUT_FILE}")


def deduplicate_leads(leads: list) -> list:
    """Remove duplicate leads by company name."""
    seen = set()
    unique = []
    for lead in leads:
        key = lead["company"].lower().strip()
        if key not in seen:
            seen.add(key)
            unique.append(lead)
    return unique


def scrape_country(country: str, locations: list, search_terms: list, max_per_search: int = 20) -> list:
    """Scrape all locations for a country and return processed leads."""
    all_leads = []
    for location in locations:
        print(f"  Scraping: {location} ({len(search_terms)} queries × {max_per_search} results)...")
        try:
            dataset_id = run_google_maps_scrape(search_terms, location, max_per_search)
            items = fetch_dataset(dataset_id)
            print(f"    Got {len(items)} raw results")
            for item in items:
                lead = process_google_maps_lead(item, country)
                if lead:
                    all_leads.append(lead)
            time.sleep(2)  # Rate limit between locations
        except Exception as e:
            print(f"    Error: {e}")
    return deduplicate_leads(all_leads)


def main():
    parser = argparse.ArgumentParser(description="NiryatAI Buyer Leads Scraper")
    parser.add_argument("--country", action="append", help="Country to scrape (can repeat)")
    parser.add_argument("--max-per-search", type=int, default=20, help="Max results per search term")
    parser.add_argument("--searches", type=int, default=5, help="Number of search queries per location (1-10)")
    parser.add_argument("--dry-run", action="store_true", help="Show plan without scraping")
    parser.add_argument("--importyeti", action="store_true", help="Also run ImportYeti for US data")
    args = parser.parse_args()

    if not APIFY_TOKEN:
        print("Error: Set APIFY_TOKEN in backend/.env")
        print("Get your token from: https://console.apify.com/account/integrations")
        return

    # Select countries
    target_countries = args.country if args.country else list(COUNTRIES.keys())
    search_terms = PRODUCT_SEARCHES[:args.searches]

    # Show plan
    total_searches = sum(len(COUNTRIES[c]) for c in target_countries if c in COUNTRIES)
    total_queries = total_searches * len(search_terms)
    est_results = total_queries * args.max_per_search
    est_cost = est_results * 0.002  # ~$0.002 per result

    print(f"\n{'='*60}")
    print(f"NiryatAI Buyer Leads Scraper")
    print(f"{'='*60}")
    print(f"Countries:       {len(target_countries)}")
    print(f"Locations:       {total_searches}")
    print(f"Search queries:  {len(search_terms)} per location")
    print(f"Max per search:  {args.max_per_search}")
    print(f"Est. results:    ~{est_results}")
    print(f"Est. Apify cost: ~${est_cost:.2f}")
    print(f"{'='*60}\n")

    if args.dry_run:
        for c in target_countries:
            locs = COUNTRIES.get(c, [])
            print(f"  {c}: {', '.join(locs)}")
        print(f"\nSearch queries: {search_terms}")
        return

    # Load existing
    leads_db = load_existing_leads()

    # Scrape each country
    for country in target_countries:
        if country not in COUNTRIES:
            print(f"Unknown country: {country}")
            continue

        locations = COUNTRIES[country]
        print(f"\n[{country}] ({len(locations)} locations)")

        new_leads = scrape_country(country, locations, search_terms, args.max_per_search)

        # Merge with existing
        existing = leads_db.get(country, [])
        existing_names = {l["company"].lower() for l in existing}
        added = 0
        for lead in new_leads:
            if lead["company"].lower() not in existing_names:
                existing.append(lead)
                existing_names.add(lead["company"].lower())
                added += 1

        leads_db[country] = existing
        print(f"  Total: {len(existing)} leads ({added} new)")

    # ImportYeti for USA
    if args.importyeti and "USA" in target_countries:
        print(f"\n[USA — ImportYeti US Customs Data]")
        try:
            iy_queries = ["basmati rice", "indian spices", "turmeric", "textiles cotton",
                          "gems diamonds", "pharmaceuticals india", "tea darjeeling",
                          "seafood shrimp", "organic food india", "leather goods india"]
            dataset_id = run_importyeti_scrape(iy_queries[:args.searches], args.max_per_search)
            items = fetch_dataset(dataset_id)
            print(f"  Got {len(items)} US importers from customs data")
            existing = leads_db.get("USA", [])
            existing_names = {l["company"].lower() for l in existing}
            added = 0
            for item in items:
                lead = process_importyeti_lead(item)
                if lead and lead["company"].lower() not in existing_names:
                    existing.append(lead)
                    existing_names.add(lead["company"].lower())
                    added += 1
            leads_db["USA"] = existing
            print(f"  Total USA: {len(existing)} leads ({added} from ImportYeti)")
        except Exception as e:
            print(f"  ImportYeti error: {e}")

    # Save
    save_leads(leads_db)
    print(f"\nDone!")


if __name__ == "__main__":
    main()
