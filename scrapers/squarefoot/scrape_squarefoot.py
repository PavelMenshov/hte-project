#!/usr/bin/env python3
"""
Squarefoot.com.hk scraper for https://www.squarefoot.com.hk/en/buy/
Uses requests + BeautifulSoup. Discovers filter codes from nav, scrapes district pages with pagination.
Output: CSV (url, district, address, building_name, price_hkd, size_sqft, price_per_sqft, rooms, floor, listed_date)
"""

import csv
import json
import re
import time
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://www.squarefoot.com.hk"
BUY_BASE = "https://www.squarefoot.com.hk/en/buy/"
DISTRICT_CODES = ["a1", "a2", "a3", "a170"]  # HK Island, Kowloon, New Territories, Outlying Islands
REQUEST_DELAY = (1.0, 2.0)  # min, max seconds between requests
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-HK,en;q=0.9",
}


def delay():
    import random
    time.sleep(random.uniform(*REQUEST_DELAY))


def discover_filter_codes(session: requests.Session) -> dict:
    """Scrape main buy page and extract all 'a' and 'dg' filter codes from nav <a class='item'>."""
    codes = {"areas": set(), "sub": []}  # areas = a1, a2, ... ; sub = (a1, dg12) etc.
    url = BUY_BASE
    resp = session.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    for a in soup.select("a.item[href]"):
        href = a.get("href") or ""
        full = urljoin(BASE_URL, href)
        if "/en/buy/" not in full:
            continue
        path = urlparse(full).path
        # e.g. /en/buy/a1 or /en/buy/a1/dg12
        parts = [p for p in path.split("/") if p and p != "en" and p != "buy"]
        if not parts:
            continue
        if parts[0].startswith("a") and parts[0][1:].isdigit():
            codes["areas"].add(parts[0])
        if len(parts) >= 2 and parts[1].startswith("dg"):
            codes["sub"].append((parts[0], parts[1]))
    codes["areas"] = sorted(codes["areas"]) or DISTRICT_CODES
    return codes


def parse_listing_card(card, page_url: str, district_label: str) -> dict | None:
    """Extract listing fields from one card. Returns dict for CSV row or None."""
    text = card.get_text(separator="\n")
    url = ""
    for a in card.select("a[href]"):
        href = (a.get("href") or "").strip()
        if not href:
            continue
        full = urljoin(BASE_URL, href)
        if re.search(r"\.(jpg|jpeg|png|webp)(\?|$)", full, re.I):
            continue
        if "property" in full or "/buy/" in full or "/apartment/" in full:
            url = full
            if "property-" in full:
                break

    # Price: English "Sell HKD$26.5 Millions @22,727" or Chinese "售 $1,180 萬元 @11,379 元"
    price_hkd = None
    price_per_sqft = None
    m = re.search(r"Sell\s+HKD\s*\$?\s*([\d.,]+)\s*Millions?\s*(?:@\s*([\d.,]+))?", text, re.I)
    if m:
        price_hkd = int(float(m.group(1).replace(",", "")) * 1_000_000)
        if m.lastindex >= 2 and m.group(2):
            price_per_sqft = int(float(m.group(2).replace(",", "")))
    if price_hkd is None:
        m2 = re.search(r"售\s*\$?\s*([\d,]+)\s*萬元\s*(?:@\s*([\d,]+)\s*元)?", text)
        if m2:
            price_hkd = int(m2.group(1).replace(",", "")) * 10000
            if m2.lastindex >= 2 and m2.group(2):
                price_per_sqft = int(m2.group(2).replace(",", ""))

    # Size: "1,166 ft²" or "1,037 呎" (Chinese)
    size_sqft = None
    m_sz = re.search(r"([\d,]+)\s*(?:ft²|sq\s*ft|ft\s*²|呎)", text, re.I)
    if m_sz:
        size_sqft = int(m_sz.group(1).replace(",", ""))

    if not price_hkd and not size_sqft:
        return None

    if price_per_sqft is None and size_sqft and price_hkd:
        price_per_sqft = round(price_hkd / size_sqft) if size_sqft else None

    # Rooms: "1,166 ft² 3 2" or "1,037 呎  3  2" (ft² or 呎 followed by digits)
    rooms = None
    m3 = re.search(r"(?:ft²|呎)\s*(\d+)\s*\d*", text) or re.search(r"(\d+)\s*\d+\s*(?:North|South|East|West|向)?", text)
    if m3:
        rooms = int(m3.group(1))

    # Floor: "Flat B, High Floor, 5" or "Room 4" / "High Floor"
    floor = None
    if re.search(r"High\s+Floor|Mid\s+Floor|Low\s+Floor|Ground\s+Floor", text, re.I):
        floor = re.search(r"(High|Mid|Low|Ground)\s+Floor", text, re.I)
        if floor:
            floor = floor.group(0)
    mf = re.search(r"Floor\s*,?\s*(\d+)|(\d+)\s*F\b", text, re.I)
    if mf:
        floor = (mf.group(1) or mf.group(2) or "").strip()

    # Address / building name: first meaningful lines (often area + building)
    lines = [ln.strip() for ln in text.splitlines() if ln.strip() and not re.match(r"^[\d\s,.$@]+$", ln)]
    building_name = lines[0] if lines else ""
    address = ", ".join(lines[:3]) if lines else ""

    # Listed date: optional, often not in card
    listed_date = ""

    return {
        "url": url,
        "district": district_label,
        "address": address,
        "building_name": building_name,
        "price_hkd": price_hkd or "",
        "size_sqft": size_sqft or "",
        "price_per_sqft": price_per_sqft or "",
        "rooms": rooms or "",
        "floor": floor or "",
        "listed_date": listed_date,
    }


def get_district_label(code: str) -> str:
    labels = {"a1": "Hong Kong Island", "a2": "Kowloon", "a3": "New Territories", "a170": "Outlying Islands"}
    return labels.get(code, code)


def scrape_page(session: requests.Session, path_or_url: str) -> tuple[list[dict], str | None]:
    """
    Fetch one listing page and parse all cards.
    path_or_url: e.g. "a1", "a1/dg12", or full URL for next page.
    Returns (list of row dicts, next_page_url or None).
    """
    if path_or_url.startswith("http"):
        url = path_or_url
    else:
        url = urljoin(BUY_BASE, path_or_url.rstrip("/") + "/" if path_or_url else BUY_BASE)
    resp = session.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    # Listing cards: same structure as main site (.item.property_item or div with price + ft²)
    cards = soup.select(".item.property_item, div[class*='property_item'], .content.sqfoot_property_card")
    if not cards:
        cards = soup.select("[class*='property'][class*='item']")
    if not cards:
        for div in soup.select("div.item, div[class*='card']"):
            t = div.get_text()
            if ("Sell HKD" in t or "HKD$" in t) and "ft²" in t:
                cards.append(div)

    first_part = path_or_url.split("/")[0].split("?")[0] if path_or_url else "a1"
    district_label = get_district_label(first_part) if first_part.startswith("a") else "Hong Kong Island"
    rows = []
    for card in cards:
        row = parse_listing_card(card, url, district_label)
        if row:
            rows.append(row)

    # Attach listing URLs from JSON-LD if row url is missing (site embeds itemListElement with url)
    try:
        ld = soup.select_one('script[type="application/ld+json"]')
        if ld and ld.string:
            data = json.loads(ld.string)
            urls = [e.get("url") for e in data.get("itemListElement", []) if e.get("url") and "property" in (e.get("url") or "")]
            for i, row in enumerate(rows):
                if not row.get("url") and i < len(urls):
                    row["url"] = urls[i]
    except Exception:
        pass

    next_path = None
    next_elem = soup.select_one("link[rel='next']")
    if next_elem and next_elem.get("href"):
        next_path = urljoin(resp.url, next_elem.get("href"))
    if not next_path:
        next_link = soup.select_one("a[href*='page']:not(.active), a.next, a[rel='next']")
        if next_link and next_link.get("href"):
            next_path = urljoin(resp.url, next_link.get("href"))
    if not next_path and rows:
        if "/page-" in resp.url:
            page_match = re.search(r"/page-(\d+)", resp.url)
            if page_match:
                next_path = re.sub(r"/page-\d+", f"/page-{int(page_match.group(1)) + 1}", resp.url)
        else:
            next_path = resp.url.rstrip("/") + "/page-2"

    return rows, next_path


def scrape_district(session: requests.Session, code: str, max_pages: int = 10) -> list[dict]:
    """Scrape all pages for one district (e.g. a1)."""
    all_rows = []
    seen = set()
    path_or_url = code
    for _ in range(max_pages):
        delay()
        rows, next_path = scrape_page(session, path_or_url)
        for r in rows:
            key = (r["url"] or "", r.get("building_name"), r.get("price_hkd"))
            if key not in seen:
                seen.add(key)
                all_rows.append(r)
        if not next_path or not rows:
            break
        path_or_url = next_path
    return all_rows


def run(output_csv: str = "squarefoot_listings.csv", discover: bool = True, max_pages_per_district: int = 5):
    session = requests.Session()
    session.headers.update(HEADERS)

    if discover:
        print("Discovering filter codes from main page...")
        codes = discover_filter_codes(session)
        print("Area codes:", codes["areas"])
        print("Sub-codes sample:", codes["sub"][:10] if codes["sub"] else "none")
        districts_to_scrape = codes["areas"]
    else:
        districts_to_scrape = DISTRICT_CODES

    all_rows = []
    for code in districts_to_scrape:
        print(f"Scraping district {code} ({get_district_label(code)})...")
        rows = scrape_district(session, code, max_pages=max_pages_per_district)
        all_rows.extend(rows)
        print(f"  Got {len(rows)} listings (total {len(all_rows)})")

    # Drop duplicates and noise (cards with "Image" as building name are usually gallery wrappers)
    seen = set()
    cleaned = []
    for r in all_rows:
        if (r.get("building_name") or "").strip().startswith("Image"):
            continue
        key = (r.get("address"), r.get("price_hkd"), r.get("size_sqft"))
        if key in seen:
            continue
        seen.add(key)
        cleaned.append(r)
    all_rows = cleaned

    cols = ["url", "district", "address", "building_name", "price_hkd", "size_sqft", "price_per_sqft", "rooms", "floor", "listed_date"]
    with open(output_csv, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(all_rows)
    print(f"Saved {len(all_rows)} rows to {output_csv}")
    return all_rows


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("-o", "--output", default="squarefoot_listings.csv", help="Output CSV path")
    parser.add_argument("--no-discover", action="store_true", help="Use fixed district codes only")
    parser.add_argument("--max-pages", type=int, default=5, help="Max pages per district")
    args = parser.parse_args()
    run(output_csv=args.output, discover=not args.no_discover, max_pages_per_district=args.max_pages)
