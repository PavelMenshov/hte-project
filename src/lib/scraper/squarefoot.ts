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
    });

    const page = await context.newPage();

    const saleUrl = `https://www.squarefoot.com.hk/en/sale/residential/?district=${DISTRICT_MAP[district]}&sort=price_asc`;
    await page.goto(saleUrl, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});

    try {
      await page.click('[class*="close"], [aria-label="Close"]', { timeout: 3000 });
    } catch {
      // no popup
    }

    try {
      await page.waitForSelector('[class*="listing"], [class*="property-item"], .search-result-item, [class*="listing-item"], [class*="property-card"]', {
        timeout: 15000,
      });
    } catch {
      // continue with empty selectors
    }

    const rawListings = await page.evaluate(() => {
      const items = document.querySelectorAll(
        '[class*="listing-item"], [class*="property-card"], .search-result-item, [class*="listing"]'
      );
      return Array.from(items).map((el) => ({
        address: el.querySelector('[class*="address"], [class*="location"]')?.textContent?.trim() ?? "",
        price: el.querySelector('[class*="price"], [class*="asking-price"]')?.textContent?.trim() ?? "",
        size: el.querySelector('[class*="size"], [class*="area"]')?.textContent?.trim() ?? "",
        rooms: el.querySelector('[class*="room"], [class*="bedroom"]')?.textContent?.trim() ?? "",
        url: (el.querySelector("a") as HTMLAnchorElement)?.href ?? "",
      }));
    });

    for (const raw of rawListings.slice(0, maxListings)) {
      const listing = normalizeSquarefootListing(raw, district);
      if (listing) listings.push(listing);
    }

    const rentUrl = `https://www.squarefoot.com.hk/en/rent/residential/?district=${DISTRICT_MAP[district]}&sort=price_asc`;
    await page.goto(rentUrl, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});

    const rentListings = await page.evaluate(() => {
      const items = document.querySelectorAll(
        '[class*="listing-item"], [class*="property-card"], .search-result-item'
      );
      return Array.from(items).map((el) => ({
        address: el.querySelector('[class*="address"]')?.textContent?.trim() ?? "",
        price: el.querySelector('[class*="price"]')?.textContent?.trim() ?? "",
        size: el.querySelector('[class*="size"]')?.textContent?.trim() ?? "",
        url: (el.querySelector("a") as HTMLAnchorElement)?.href ?? "",
      }));
    });

    for (const raw of rentListings.slice(0, 10)) {
      const listing = normalizeRentListing(raw, district);
      if (listing) listings.push(listing);
    }
  } catch (error) {
    console.error(`Squarefoot scrape error for ${district}:`, error);
  } finally {
    await browser.close();
  }

  return listings;
}

function normalizeSquarefootListing(
  raw: { address: string; price: string; size: string; rooms: string; url: string },
  district: HKDistrict
): MarketListing | null {
  const priceMatch = raw.price.replace(/,/g, "").match(/[\d]+/);
  const price_hkd = priceMatch ? parseInt(priceMatch[0], 10) : 0;
  if (!price_hkd || price_hkd < 500000) return null;

  const sizeMatch = raw.size.replace(/,/g, "").match(/[\d]+/);
  const size_sqft = sizeMatch ? parseInt(sizeMatch[0], 10) : 0;
  if (!size_sqft || size_sqft < 100) return null;

  const roomsMatch = raw.rooms.match(/(\d+)/);
  const rooms = roomsMatch ? parseInt(roomsMatch[1], 10) : 1;

  return {
    id: `sf-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    source: "squarefoot",
    url: raw.url,
    scrapedAt: new Date().toISOString(),
    address: raw.address,
    district,
    price_hkd,
    size_sqft,
    price_per_sqft_hkd: Math.round(price_hkd / size_sqft),
    rooms,
    floor: null,
    monthly_rent_hkd: null,
    gross_yield_pct: null,
    mtr_station: null,
    mtr_distance_min: null,
    listing_date: null,
    listing_status: "for_sale",
  };
}

function normalizeRentListing(
  raw: { address: string; price: string; size: string; url: string },
  district: HKDistrict
): MarketListing | null {
  const priceMatch = raw.price.replace(/,/g, "").match(/[\d]+/);
  const monthly_rent_hkd = priceMatch ? parseInt(priceMatch[0], 10) : null;
  if (!monthly_rent_hkd || monthly_rent_hkd < 3000) return null;

  const sizeMatch = raw.size.replace(/,/g, "").match(/[\d]+/);
  const size_sqft = sizeMatch ? parseInt(sizeMatch[0], 10) : 0;

  return {
    id: `sf-rent-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    source: "squarefoot",
    url: raw.url,
    scrapedAt: new Date().toISOString(),
    address: raw.address,
    district,
    price_hkd: 0,
    size_sqft: size_sqft || 0,
    price_per_sqft_hkd: 0,
    rooms: 1,
    floor: null,
    monthly_rent_hkd,
    gross_yield_pct: null,
    mtr_station: null,
    mtr_distance_min: null,
    listing_date: null,
    listing_status: "for_rent",
  };
}
