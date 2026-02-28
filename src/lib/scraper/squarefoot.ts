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

/** Squarefoot uses path filters: /buy/a2/dg110 = Mong Kok. ?district= slug returns global list. */
const SQUAREFOOT_PATH: Record<HKDistrict, string> = {
  "Kwun Tong": "a2/dg21",
  "Mong Kok": "a2/dg110",
  "Sha Tin": "a3/dg44",
  "Tuen Mun": "a3/dg48",
  "Sham Shui Po": "a2/dg26",
  "Yau Tsim Mong": "a2/dg30",
  "Wong Tai Sin": "a2/dg32",
  "Kowloon City": "a2/dg116",
};

const DISTRICT_KEYWORDS: Record<HKDistrict, string[]> = {
  "Kwun Tong": ["觀塘", "Kwun Tong", "kwun-tong"],
  "Mong Kok": ["旺角", "Mong Kok", "mong-kok"],
  "Sha Tin": ["沙田", "Sha Tin", "sha-tin"],
  "Tuen Mun": ["屯門", "Tuen Mun", "tuen-mun"],
  "Sham Shui Po": ["深水埗", "Sham Shui Po"],
  "Yau Tsim Mong": ["油尖旺", "Yau Tsim Mong"],
  "Wong Tai Sin": ["黃大仙", "Wong Tai Sin"],
  "Kowloon City": ["九龍城", "Kowloon City"],
};

const EXPLORE = process.env.EXPLORE_SQUAREFOOT === "1";

const IMAGE_URL_RE = /\.(jpg|jpeg|png|webp)(\?|$)/i;

function isImageUrl(url: string): boolean {
  return IMAGE_URL_RE.test(url);
}

/** Object is a photo/gallery item (only url to image), not a property listing */
function isImageOnly(obj: unknown): boolean {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return false;
  const o = obj as Record<string, unknown>;
  const url = typeof o.url === "string" ? o.url : "";
  if (!url || !isImageUrl(url)) return false;
  const priceKeys = ["price", "asking_price", "list_price", "saleable_price", "price_hkd", "rent", "monthly_rent"];
  const areaKeys = ["area", "size", "saleable_area", "gross_area", "floor_area"];
  for (const k of [...priceKeys, ...areaKeys]) {
    const v = o[k];
    if (typeof v === "number" && v > 50) return false;
    if (typeof v === "string" && /\d{2,}/.test(v)) return false;
  }
  return true;
}

/** Object has price > 100k or area > 50 (real listing, not gallery) */
function isRealListing(obj: unknown): boolean {
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return false;
  const o = obj as Record<string, unknown>;
  const priceKeys = ["price", "asking_price", "list_price", "saleable_price", "price_hkd"];
  for (const k of priceKeys) {
    const v = o[k];
    if (typeof v === "number" && v > 100_000) return true;
    if (typeof v === "string") {
      const n = Number.parseInt(v.replaceAll(",", ""), 10);
      if (!Number.isNaN(n) && n > 100_000) return true;
    }
  }
  const areaKeys = ["area", "size", "saleable_area", "gross_area", "floor_area", "size_sqft"];
  for (const k of areaKeys) {
    const v = o[k];
    if (typeof v === "number" && v > 50) return true;
    if (typeof v === "string") {
      const n = Number.parseInt(v.replaceAll(",", ""), 10);
      if (!Number.isNaN(n) && n > 50) return true;
    }
  }
  return false;
}

/** Recursively find first array that looks like property listings (not image gallery) */
function findListingsArray(obj: unknown): unknown[] {
  if (obj === null || typeof obj !== "object") return [];
  const o = obj as Record<string, unknown>;
  const listKeys = ["data", "results", "items", "list", "properties", "listings"];
  for (const key of listKeys) {
    const val = o[key];
    if (Array.isArray(val) && val.length > 2) {
      const filtered = val.filter((item) => !isImageOnly(item));
      if (filtered.some((item) => isRealListing(item))) return filtered;
    }
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

  const rawUrl = getFirstString(raw, "url", "link", "detail_url") ?? "";
  const url = rawUrl && !isImageUrl(rawUrl) ? rawUrl : "";

  if (listingStatus === "for_sale") {
    const p = price_hkd ?? 0;
    const size = size_sqft ?? 0;
    if (p >= 500_000 && size >= 100) {
      return {
        id: `sf-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        source: "squarefoot",
        url,
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
    url,
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
  if (isImageOnly(obj)) return false;
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

/** Keep only listings whose address matches the requested district */
function filterByDistrict(listings: MarketListing[], district: HKDistrict): MarketListing[] {
  const keywords = DISTRICT_KEYWORDS[district];
  return listings.filter((l) => {
    const addr = (l.address || "").toLowerCase();
    return keywords.some((kw) => {
      if (/^[\u4e00-\u9fa5]+$/.test(kw)) return l.address.includes(kw);
      return addr.includes(kw.toLowerCase());
    });
  });
}

/** Parse price from "售 $1,860 萬元" or "$1.18萬" -> HKD. Supports comma and decimal. */
function parseSquarefootPrice(text: string): number {
  const normalized = text.replaceAll(",", "");
  const match =
    /售\s*\$?\s*([\d.]+)\s*萬\s*元?/.exec(normalized) ||
    /\$?\s*([\d.]+)\s*萬\s*元?/.exec(normalized);
  if (!match) return 0;
  const num = Number.parseFloat(match[1]);
  return Number.isNaN(num) ? 0 : Math.round(num * 10000);
}

/** Parse rooms from "X 房" or "X room(s)" — NOT from 呎 (that's sqft). */
function parseSquarefootRooms(text: string): number {
  const roomMatch = /([\d]+)\s*房/.exec(text) || /([\d]+)\s*room(s)?/i.exec(text);
  if (roomMatch) {
    const n = Number.parseInt(roomMatch[1], 10);
    if (n >= 1 && n <= 20) return n;
  }
  return 1;
}

/** Strip price/rent/sqm junk from address lines. */
function cleanAddressLines(lines: string[]): string[] {
  return lines.filter((l) => {
    const t = l.trim();
    if (!t || /^\d+$/.test(t)) return false;
    if (/售\s*\$|萬元|@\s*[\d,]+|建築|實用|呎|月租|租\s*\$|\/?\s*月/.test(t)) return false;
    return true;
  });
}

/**
 * Squarefoot DOM fallback: site renders listings in HTML (class .item.property_item).
 * Sale: "售 $1,180 萬元" → price HKD, "1,037 呎" → sqft, "X 房" → rooms.
 * Rent: "租 $15,000 元" or "月租 $15000" → monthly_rent_hkd.
 * URL from first <a> that is not an image link.
 */
async function scrapeSquarefootDOM(
  district: HKDistrict,
  maxListings: number,
  browser: Awaited<ReturnType<typeof chromium.launch>>
): Promise<MarketListing[]> {
  const path = SQUAREFOOT_PATH[district];
  const saleUrl = `https://www.squarefoot.com.hk/en/buy/${path}`;
  const rentUrl = `https://www.squarefoot.com.hk/en/rent/${path}`;
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

    const extractCards = async (url: string) => {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      return page.evaluate(() => {
        const cards = document.querySelectorAll(".item.property_item");
        return Array.from(cards).slice(0, 50).map((el) => {
          const anchors = el.querySelectorAll("a[href]");
          let listingUrl = "";
          for (const a of anchors) {
            const href = (a as HTMLAnchorElement).href;
            if (href && !/\.(jpg|jpeg|png|webp)(\?|$)/i.test(href)) {
              listingUrl = href;
              break;
            }
          }
          return { text: (el as HTMLElement).innerText, url: listingUrl };
        });
      });
    };

    const saleRaw = await extractCards(saleUrl);
    const saleLimit = Math.ceil(maxListings / 2) + 5;
    for (const r of saleRaw.slice(0, saleLimit)) {
      const text = r.text.replaceAll(",", "");
      const priceHkd = parseSquarefootPrice(r.text);
      if (priceHkd < 500_000) continue;
      const sqftMatch = /([\d,]+)\s*呎/.exec(text);
      const size_sqft = sqftMatch ? Number.parseInt(sqftMatch[1].replaceAll(",", ""), 10) : 0;
      if (size_sqft < 100) continue;
      const lines = r.text.trim().split(/\n/).map((s) => s.trim()).filter(Boolean);
      const addressLines = cleanAddressLines(lines);
      const address = addressLines.slice(0, 3).join(", ").trim() || "Hong Kong";
      const rooms = parseSquarefootRooms(text);
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

    await randomDelay();
    const rentRaw = await extractCards(rentUrl);
    const rentLimit = Math.ceil(maxListings / 2) + 5;
    for (const r of rentRaw.slice(0, rentLimit)) {
      const text = r.text.replaceAll(",", "");
      const rentMatch = /(?:租|月租)\s*\$?\s*([\d,]+)\s*元/.exec(text) || /\$?\s*([\d,]+)\s*元\s*\/?\s*月/.exec(text);
      const monthlyHkd = rentMatch ? Number.parseInt(rentMatch[1].replaceAll(",", ""), 10) : 0;
      if (monthlyHkd < 3000) continue;
      const sqftMatch = /([\d,]+)\s*呎/.exec(text);
      const size_sqft = sqftMatch ? Number.parseInt(sqftMatch[1].replaceAll(",", ""), 10) : 0;
      const lines = r.text.trim().split(/\n/).map((s) => s.trim()).filter(Boolean);
      const addressLines = cleanAddressLines(lines);
      const address = addressLines.slice(0, 3).join(", ").trim() || "Hong Kong";
      const rooms = parseSquarefootRooms(text);
      listings.push({
        id: `sf-dom-rent-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        source: "squarefoot",
        url: r.url,
        scrapedAt: new Date().toISOString(),
        address: address || "Hong Kong",
        district,
        price_hkd: 0,
        size_sqft: size_sqft || 0,
        price_per_sqft_hkd: 0,
        rooms,
        floor: null,
        monthly_rent_hkd: monthlyHkd,
        gross_yield_pct: null,
        mtr_station: null,
        mtr_distance_min: null,
        listing_date: null,
        listing_status: "for_rent",
      });
    }
  } catch {
    // return what we have
  }
  return listings.slice(0, maxListings);
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

    type Intercepted = { json: unknown; isRent: boolean; requestUrl: string };
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
          intercepted.push({ json, isRent: currentPageIsRent, requestUrl: url });
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
      console.log(`🏠 Loading rent page for ${district}...`);
      currentPageIsRent = true;
      try {
        await page.goto(rentUrl, { waitUntil: "networkidle", timeout: 30000 });
        console.log(`✅ Rent page loaded, intercepted responses: ${intercepted.length}`);
      } catch {
        console.log(`✅ Rent page loaded (timeout/error), intercepted responses: ${intercepted.length}`);
      }
    }

    if (EXPLORE) {
      console.log(`🔍 [EXPLORE] Done. Set EXPLORE_SQUAREFOOT=0 and use patterns above.`);
      return [];
    }

    for (const { json, isRent, requestUrl } of intercepted) {
      const arr = findListingsArray(json);
      const status: "for_sale" | "for_rent" = isRent ? "for_rent" : "for_sale";
      const firstAddresses = arr
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .slice(0, 3)
        .map((item) => getFirstString(item, "address", "name", "building_name", "property_name", "location") ?? "");
      console.log(`📡 API request: ${requestUrl} → first 3 addresses: ${firstAddresses.join(" | ") || "(none)"}`);
      for (const item of arr) {
        if (!isListingLike(item)) continue;
        const listing = normalizeApiListing(item, district, status);
        if (listing) listings.push(listing);
      }
    }

    const uniqueByUrl = new Map<string, MarketListing>();
    for (const l of listings) {
      if (l.url) uniqueByUrl.set(l.url, l);
      else uniqueByUrl.set(l.id, l);
    }
    const deduped = Array.from(uniqueByUrl.values()).slice(0, maxListings);

    if (deduped.length > 0) {
      const filtered = filterByDistrict(deduped, district);
      if (filtered.length === 0) {
        console.log(`⚠️ All ${deduped.length} listings filtered out for ${district} — addresses don't match district.`);
        return [];
      }
      console.log(`✅ Found ${filtered.length} listings from network interception`);
      return filtered;
    }

    console.log(`⚠️ No listings intercepted, trying Squarefoot DOM...`);
    const squarefootDom = await scrapeSquarefootDOM(district, maxListings, browser);
    if (squarefootDom.length > 0) {
      const filtered = filterByDistrict(squarefootDom, district);
      if (filtered.length === 0) {
        console.log(`⚠️ All ${squarefootDom.length} listings filtered out for ${district} — addresses don't match district.`);
        return [];
      }
      console.log(`✅ Squarefoot DOM: ${filtered.length} listings`);
      return filtered;
    }

    console.log(`⚠️ No listings from Squarefoot DOM, trying 28hse fallback...`);
    const fallback = await scrape28hse(district, maxListings, browser);
    if (fallback.length > 0) {
      const filtered = filterByDistrict(fallback, district);
      if (filtered.length === 0) {
        console.log(`⚠️ All ${fallback.length} listings filtered out for ${district} — addresses don't match district.`);
        return [];
      }
      console.log(`✅ 28hse fallback: ${filtered.length} listings`);
      return filtered;
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
