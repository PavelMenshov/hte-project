/**
 * 28hse.com — primary source for HK residential listings (no Squarefoot).
 * District URLs: /buy/apartment/a2/dg21 = Kwun Tong, a2/dg110 = Mong Kok, a3/dg44 = Sha Tin, a3/dg48 = Tuen Mun.
 */
import { chromium } from "playwright";
import type { MarketListing, HKDistrict } from "./types";

const DISTRICT_PATH: Record<HKDistrict, string> = {
  "Kwun Tong": "a2/dg21",
  "Mong Kok": "a2/dg110",
  "Sha Tin": "a3/dg44",
  "Tuen Mun": "a3/dg48",
  "Sham Shui Po": "a2/dg26",
  "Yau Tsim Mong": "a2/dg30",
  "Wong Tai Sin": "a2/dg32",
  "Kowloon City": "a2/dg116",
};

function extractPropertyId(url: string): string | null {
  const m = /property-(\d+)/i.exec(url);
  return m ? m[1] : null;
}

/** Parse price from "售 $568 萬元", "$1,768萬", or "HKD$5.68 Millions" -> HKD. */
function parsePriceHkd(text: string): number {
  const cnMatch = /售\s*\$?\s*([\d,]+)\s*萬/.exec(text) || /\$?\s*([\d,]+)\s*萬/.exec(text);
  if (cnMatch) {
    const num = Number.parseInt(cnMatch[1].replace(/,/g, ""), 10);
    return num * 10000;
  }
  const enMatch = /(?:Sell\s*)?HKD\s*\$?\s*([\d,.]+)\s*Millions?/i.exec(text) || /\$\s*([\d,.]+)\s*Millions?/i.exec(text);
  if (enMatch) {
    const num = Number.parseFloat(enMatch[1].replace(/,/g, ""));
    return Number.isNaN(num) ? 0 : Math.round(num * 1_000_000);
  }
  return 0;
}

/** Parse size from "實用面積: 522 呎", "670 呎", or "522 ft²" -> sqft number. */
function parseSizeSqft(text: string): number {
  const match =
    /(?:實用|建築|Saleable|Gross)\s*Area:\s*([\d,]+)\s*(?:呎|ft²)/i.exec(text) ||
    /([\d,]+)\s*呎/.exec(text) ||
    /([\d,]+)\s*ft²/.exec(text);
  if (!match) return 0;
  return Number.parseInt(match[1].replace(/,/g, ""), 10);
}

/** Parse rooms from "X 房", "X room(s)", or "X Bedrooms"; default 1. */
function parseRooms28hse(text: string): number {
  const m = /([\d]+)\s*房/.exec(text) || /([\d]+)\s*Bedrooms?/i.exec(text) || /([\d]+)\s*room(s)?/i.exec(text);
  if (m) {
    const n = Number.parseInt(m[1], 10);
    if (n >= 1 && n <= 20) return n;
  }
  return 1;
}

/** Scrape 28hse.com only — no Squarefoot. Returns listings with source "28hse" and stable id (28hse-{propertyId}). */
export async function scrape28hse(
  district: HKDistrict,
  maxListings: number
): Promise<MarketListing[]> {
  const path = DISTRICT_PATH[district];
  const url = `https://www.28hse.com/en/buy/apartment/${path}`;
  const listings: MarketListing[] = [];
  const seenIds = new Set<string>();

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      locale: "zh-HK",
      viewport: { width: 1280, height: 900 },
      extraHTTPHeaders: { "Accept-Language": "zh-HK,zh;q=0.9,en;q=0.8" },
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });

    const raw = await page.evaluate(() => {
      const results: { url: string; cardText: string; name: string; imageUrl: string }[] = [];
      const links = document.querySelectorAll<HTMLAnchorElement>('a[href*="/property-"]');
      const seen = new Set<string>();
      links.forEach((a) => {
        const href = (a.getAttribute("href") || a.href || "").replace(/^\/\//, "https://");
        const fullUrl = href.startsWith("http") ? href : `https://www.28hse.com${href.startsWith("/") ? href : "/" + href}`;
        if (!/\/property-\d+/.test(fullUrl)) return;
        const id = fullUrl.replace(/.*property-(\d+).*/, "$1");
        if (seen.has(id)) return;
        let el: HTMLElement | null = a.closest("div[class*='item'], div[class*='card'], div[class*='listing'], article, li, [class*='property']") || a.parentElement;
        for (let i = 0; i < 10 && el; i++) {
          const text = (el as HTMLElement).innerText || (el as HTMLElement).textContent || "";
          if ((text.includes("售") || text.includes("Sell")) && (text.includes("呎") || text.includes("ft²"))) {
            seen.add(id);
            const propLinks = el.querySelectorAll('a[href*="property-"]');
            let name = "";
            propLinks.forEach((link) => {
              const t = (link.textContent || "").trim();
              if (t.length > name.length && t.length > 2) name = t;
            });
            if (!name) name = (a.textContent || "").trim() || text.slice(0, 60).trim();
            const img = el.querySelector("img[src]");
            const imageUrl = (img && (img as HTMLImageElement).src && !(img as HTMLImageElement).src.startsWith("data:"))
              ? (img as HTMLImageElement).src
              : "";
            results.push({ url: fullUrl, cardText: text.slice(0, 800), name: name.slice(0, 120), imageUrl });
            return;
          }
          el = el.parentElement;
        }
      });
      return results;
    });

    for (const r of raw) {
      const propId = extractPropertyId(r.url);
      if (!propId || seenIds.has(propId)) continue;

      const price_hkd = parsePriceHkd(r.cardText);
      if (price_hkd < 300_000) continue;

      const size_sqft = parseSizeSqft(r.cardText);
      if (size_sqft < 100) continue;

      seenIds.add(propId);
      const name = (r.name || district + " listing").trim().slice(0, 150);

      const rooms = parseRooms28hse(r.cardText);
      listings.push({
        id: `28hse-${propId}`,
        source: "28hse",
        url: r.url,
        scrapedAt: new Date().toISOString(),
        image_url: r.imageUrl?.trim() || undefined,
        address: name,
        district,
        price_hkd,
        size_sqft,
        price_per_sqft_hkd: size_sqft > 0 ? Math.round(price_hkd / size_sqft) : 0,
        rooms,
        floor: null,
        monthly_rent_hkd: null,
        gross_yield_pct: null,
        mtr_station: null,
        mtr_distance_min: null,
        listing_date: null,
        listing_status: "for_sale",
      });
      if (listings.length >= maxListings) break;
    }
  } catch (err) {
    console.error("28hse scrape error:", err);
  } finally {
    await browser.close();
  }

  return listings;
}
