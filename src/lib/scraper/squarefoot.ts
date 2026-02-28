import { chromium } from "playwright";
import type { MarketListing, HKDistrict } from "./types";

const DISTRICT_MAP: Record<HKDistrict, string> = {
  "Kwun Tong": "kwun-tong",
  "Mong Kok": "mong-kok",
  "Sha Tin": "sha-tin",
  "Tuen Mun": "tuen-mun",
  "Sham Shui Po": "sham-shui-po",
  "Yau Tsim Mong": "yau-tsim-mong",
  "Wong Tai Sin": "wong-tai-sin",
  "Kowloon City": "kowloon-city",
};

const EXPLORE = process.env.EXPLORE_SQUAREFOOT === "1";

/** Recursively find first array that looks like listings in arbitrary API JSON */
function findListingsArray(obj: unknown): unknown[] {
  if (obj === null || typeof obj !== "object") return [];
  const o = obj as Record<string, unknown>;
  const listKeys = ["data", "results", "items", "list", "properties", "listings"];
  for (const key of listKeys) {
    const val = o[key];
    if (Array.isArray(val) && val.length > 2) return val;
  }
  for (const val of Object.values(o)) {
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      const nested = findListingsArray(val);
      if (nested.length > 0) return nested;
    }
  }
  return [];
}

function getFirstNumber(obj: Record<string, unknown>, ...keys: string[]): number | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string") {
      const n = Number.parseInt(v.replaceAll(",", ""), 10);
      if (!Number.isNaN(n)) return n;
    }
  }
  return null;
}

function getFirstString(obj: Record<string, unknown>, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function normalizeApiListing(
  raw: Record<string, unknown>,
  district: HKDistrict,
  listingStatus: "for_sale" | "for_rent"
): MarketListing | null {
  const price_hkd = getFirstNumber(
    raw,
    "price",
    "asking_price",
    "list_price",
    "saleable_price",
    "price_hkd"
  );
  const monthly_rent_hkd = getFirstNumber(
    raw,
    "rent",
    "monthly_rent",
    "rental",
    "rent_price",
    "monthly_rent_hkd"
  );
  const size_sqft = getFirstNumber(
    raw,
    "saleable_area",
    "gross_area",
    "area",
    "size",
    "floor_area",
    "size_sqft"
  );
  const address = getFirstString(
    raw,
    "address",
    "name",
    "building_name",
    "property_name",
    "location"
  );
  const rooms = getFirstNumber(raw, "bedrooms", "bedroom", "rooms", "room_count", "no_of_room") ?? 1;
  const floorRaw = getFirstString(raw, "floor", "floor_num", "level");
  const floor = floorRaw !== null ? String(floorRaw) : null;

  if (listingStatus === "for_sale") {
    const p = price_hkd ?? 0;
    const size = size_sqft ?? 0;
    if (p >= 500_000 && size >= 100) {
      return {
        id: `sf-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        source: "squarefoot",
        url: getFirstString(raw, "url", "link", "detail_url") ?? "",
        scrapedAt: new Date().toISOString(),
        address: address ?? "",
        district,
        price_hkd: p,
        size_sqft: size,
        price_per_sqft_hkd: size > 0 ? Math.round(p / size) : 0,
        rooms,
        floor,
        monthly_rent_hkd: null,
        gross_yield_pct: null,
        mtr_station: null,
        mtr_distance_min: null,
        listing_date: null,
        listing_status: "for_sale",
      };
    }
    return null;
  }

  const rent = monthly_rent_hkd ?? 0;
  if (rent < 3000) return null;
  const size = size_sqft ?? 0;
  return {
    id: `sf-rent-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    source: "squarefoot",
    url: getFirstString(raw, "url", "link", "detail_url") ?? "",
    scrapedAt: new Date().toISOString(),
    address: address ?? "",
    district,
    price_hkd: 0,
    size_sqft: size,
    price_per_sqft_hkd: 0,
    rooms,
    floor,
    monthly_rent_hkd: rent,
    gross_yield_pct: null,
    mtr_station: null,
    mtr_distance_min: null,
    listing_date: null,
    listing_status: "for_rent",
  };
}

function isListingLike(obj: unknown): obj is Record<string, unknown> {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return false;
  const o = obj as Record<string, unknown>;
  const hasPrice =
    typeof o.price === "number" ||
    typeof o.asking_price === "number" ||
    typeof o.monthly_rent === "number" ||
    typeof o.rent === "number";
  const hasArea =
    typeof o.area === "number" ||
    typeof o.size === "number" ||
    typeof o.saleable_area === "number" ||
    typeof o.gross_area === "number";
  return hasPrice || hasArea || o.address !== undefined || o.name !== undefined;
}

/** Random delay 2000–4000 ms */
function randomDelay(): Promise<void> {
  const ms = 2000 + Math.random() * 2000;
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Squarefoot DOM fallback: site renders listings in HTML (class .item.property_item).
 * Parse "售 $1,180 萬元" → price HKD, "1,037 呎" → sqft. Use minimal evaluate to avoid page __name conflict.
 */
async function scrapeSquarefootDOM(
  district: HKDistrict,
  maxListings: number,
  browser: Awaited<ReturnType<typeof chromium.launch>>
): Promise<MarketListing[]> {
  const slug = DISTRICT_MAP[district];
  const saleUrl = `https://www.squarefoot.com.hk/buy?district=${slug}&sort=price_asc`;
  const listings: MarketListing[] = [];
  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      locale: "en-HK",
      viewport: { width: 1280, height: 800 },
      extraHTTPHeaders: { "Accept-Language": "en-HK,en;q=0.9" },
    });
    const page = await context.newPage();
    await page.goto(saleUrl, { waitUntil: "networkidle", timeout: 30000 });
    const raw = await page.evaluate(() => {
      const cards = document.querySelectorAll(".item.property_item");
      return Array.from(cards).slice(0, 50).map((el) => {
        const link = el.querySelector("a");
        return {
          text: (el as HTMLElement).innerText,
          url: link ? (link as HTMLAnchorElement).href : "",
        };
      });
    });
    for (const r of raw.slice(0, maxListings)) {
      const text = r.text.replaceAll(",", "");
      const saleMatch = /售\s*\$?\s*([\d]+)\s*萬元/.exec(text);
      const priceHkd = saleMatch ? Number.parseInt(saleMatch[1], 10) * 10000 : 0;
      if (priceHkd < 500_000) continue;
      const sqftMatch = /([\d]+)\s*呎/.exec(text);
      const size_sqft = sqftMatch ? Number.parseInt(sqftMatch[1], 10) : 0;
      if (size_sqft < 100) continue;
      const lines = r.text.trim().split(/\n/).map((s) => s.trim()).filter(Boolean);
      const addressLines = lines.filter((l) => !/^\d+$/.test(l));
      const address = addressLines.slice(0, 3).join(", ") || "Hong Kong";
      const roomsMatch = /呎\s*([\d]+)/.exec(text);
      const rooms = roomsMatch ? Number.parseInt(roomsMatch[1], 10) : 1;
      listings.push({
        id: `sf-dom-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        source: "squarefoot",
        url: r.url,
        scrapedAt: new Date().toISOString(),
        address: address || "Hong Kong",
        district,
        price_hkd: priceHkd,
        size_sqft,
        price_per_sqft_hkd: size_sqft > 0 ? Math.round(priceHkd / size_sqft) : 0,
        rooms,
        floor: null,
        monthly_rent_hkd: null,
        gross_yield_pct: null,
        mtr_station: null,
        mtr_distance_min: null,
        listing_date: null,
        listing_status: "for_sale",
      });
    }
  } catch {
    // return what we have
  }
  return listings;
}

/** Fallback: DOM scraping for 28hse.com (SSR, no React) */
async function scrape28hse(
  district: HKDistrict,
  maxListings: number,
  browser: Awaited<ReturnType<typeof chromium.launch>>
): Promise<MarketListing[]> {
  const slug = DISTRICT_MAP[district];
  const url = `https://www.28hse.com/en/buy/residential/region-${slug}`;
  const listings: MarketListing[] = [];
  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      locale: "en-HK",
      viewport: { width: 1280, height: 800 },
      extraHTTPHeaders: { "Accept-Language": "en-HK,en;q=0.9" },
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    const raw = await page.evaluate(() => {
      const items = document.querySelectorAll(
        "[class*='listing'], [class*='property'], .property-item, .listing-item, .search-result, [class*='card']"
      );
      return Array.from(items).slice(0, 50).map((el) => {
        const link = el.querySelector("a");
        const priceEl = el.querySelector("[class*='price'], .price, [class*='amount']");
        const areaEl = el.querySelector("[class*='area'], [class*='size'], .area, .size");
        const addrEl = el.querySelector("[class*='address'], [class*='location'], .address");
        return {
          url: (link as HTMLAnchorElement)?.href ?? "",
          price: priceEl?.textContent?.trim() ?? "",
          size: areaEl?.textContent?.trim() ?? "",
          address: addrEl?.textContent?.trim() ?? "",
        };
      });
    });
    for (const r of raw.slice(0, maxListings)) {
      const priceMatch = /\d+/.exec(r.price.replaceAll(",", ""));
      const price_hkd = priceMatch ? Number.parseInt(priceMatch[0], 10) : 0;
      if (price_hkd < 500_000) continue;
      const sizeMatch = /\d+/.exec(r.size.replaceAll(",", ""));
      const size_sqft = sizeMatch ? Number.parseInt(sizeMatch[0], 10) : 0;
      if (size_sqft < 100) continue;
      listings.push({
        id: `28hse-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        source: "squarefoot",
        url: r.url,
        scrapedAt: new Date().toISOString(),
        address: r.address,
        district,
        price_hkd,
        size_sqft,
        price_per_sqft_hkd: size_sqft > 0 ? Math.round(price_hkd / size_sqft) : 0,
        rooms: 1,
        floor: null,
        monthly_rent_hkd: null,
        gross_yield_pct: null,
        mtr_station: null,
        mtr_distance_min: null,
        listing_date: null,
        listing_status: "for_sale",
      });
    }
  } catch {
    // return whatever we have
  }
  return listings;
}

export async function scrapeSquarefoot(
  district: HKDistrict,
  maxListings = 20
): Promise<MarketListing[]> {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const listings: MarketListing[] = [];

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      locale: "en-HK",
      viewport: { width: 1280, height: 800 },
      extraHTTPHeaders: { "Accept-Language": "en-HK,en;q=0.9" },
    });

    const page = await context.newPage();

    type Intercepted = { json: unknown; isRent: boolean };
    const intercepted: Intercepted[] = [];
    let currentPageIsRent = false;

    if (EXPLORE) {
      console.log(`🔍 [EXPLORE] Intercepting all responses for ${district}...`);
      page.on("response", async (response) => {
        const url = response.url();
        const status = response.status();
        const contentType = response.headers()["content-type"] ?? "";
        try {
          const body = await response.body();
          const size = body.length;
          let preview = "";
          if (contentType.includes("application/json") && body.length > 0) {
            preview = body.subarray(0, 200).toString("utf8").replaceAll(/\s+/g, " ");
          }
          console.log(`📡 [EXPLORE] ${url} | ${status} | ${contentType} | ${size} bytes | ${preview}`);
        } catch {
          console.log(`📡 [EXPLORE] ${url} | ${status} | ${contentType} | (body failed)`);
        }
      });
    } else {
      page.on("response", async (response) => {
        const url = response.url();
        const contentType = response.headers()["content-type"] ?? "";
        const isApi =
          url.includes("squarefoot") &&
          (url.includes("/api/") ||
            url.includes("/listing") ||
            url.includes("/property") ||
            url.includes("/search") ||
            url.includes("listing") ||
            url.includes("property"));
        if (!contentType.includes("application/json") || !isApi) return;
        try {
          const json = await response.json();
          intercepted.push({ json, isRent: currentPageIsRent });
          console.log(`📡 API response caught: ${url} (${JSON.stringify(json).length} bytes)`);
        } catch {
          // ignore
        }
      });
    }

    const slug = DISTRICT_MAP[district];
    const saleUrl = `https://www.squarefoot.com.hk/en/sale/residential/?district=${slug}&sort=price_asc`;
    const rentUrl = `https://www.squarefoot.com.hk/en/rent/residential/?district=${slug}&sort=price_asc`;

    console.log(`🔍 Intercepting responses for ${district}...`);

    currentPageIsRent = false;
    try {
      await page.goto(saleUrl, { waitUntil: "networkidle", timeout: 30000 });
    } catch {
      // continue with whatever was intercepted
    }

    if (!EXPLORE) {
      await randomDelay();
      currentPageIsRent = true;
      try {
        await page.goto(rentUrl, { waitUntil: "networkidle", timeout: 30000 });
      } catch {
        // continue
      }
    }

    if (EXPLORE) {
      console.log(`🔍 [EXPLORE] Done. Set EXPLORE_SQUAREFOOT=0 and use patterns above.`);
      return [];
    }

    for (const { json, isRent } of intercepted) {
      const arr = findListingsArray(json);
      const status: "for_sale" | "for_rent" = isRent ? "for_rent" : "for_sale";
      for (const item of arr) {
        if (!isListingLike(item)) continue;
        const listing = normalizeApiListing(item, district, status);
        if (listing) listings.push(lististing);
      }
    }

    const uniqueByUrl = new Map<string, MarketListing>();
    for (const l of listings) {
      if (l.url) uniqueByUrl.set(l.url, l);
      else uniqueByUrl.set(l.id, l);
    }
    const deduped = Array.from(uniqueByUrl.values()).slice(0, maxListings);

    if (deduped.length > 0) {
      console.log(`✅ Found ${deduped.length} listings from network interception`);
      return deduped;
    }

    console.log(`⚠️ No listings intercepted, trying Squarefoot DOM...`);
    const squarefootDom = await scrapeSquarefootDOM(district, maxListings, browser);
    if (squarefootDom.length > 0) {
      console.log(`✅ Squarefoot DOM: ${squarefootDom.length} listings`);
      return squarefootDom;
    }

    console.log(`⚠️ No listings from Squarefoot DOM, trying 28hse fallback...`);
    const fallback = await scrape28hse(district, maxListings, browser);
    if (fallback.length > 0) {
      console.log(`✅ 28hse fallback: ${fallback.length} listings`);
      return fallback;
    }

    console.log(`❌ All sources failed for ${district}, returning []`);
    return [];
  } catch (error) {
    console.error(`Squarefoot scrape error for ${district}:`, error);
    return [];
  } finally {
    await browser.close();
  }
}
