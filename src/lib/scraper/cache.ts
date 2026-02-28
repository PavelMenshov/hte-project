import fs from "fs/promises";
import path from "path";
import type { DistrictCache, HKDistrict, MarketListing } from "./types";

const CACHE_DIR = path.join(process.cwd(), "data", "market-cache");

export async function saveDistrictCache(cache: DistrictCache): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true });
  const filename = cache.district.toLowerCase().replace(/\s+/g, "-") + ".json";
  await fs.writeFile(
    path.join(CACHE_DIR, filename),
    JSON.stringify(cache, null, 2)
  );
  await updateLastUpdated(cache.district);
}

export async function loadDistrictCache(district: HKDistrict): Promise<DistrictCache | null> {
  try {
    const filename = district.toLowerCase().replace(/\s+/g, "-") + ".json";
    const content = await fs.readFile(path.join(CACHE_DIR, filename), "utf-8");
    return JSON.parse(content) as DistrictCache;
  } catch {
    return null;
  }
}

export async function isCacheStale(district: HKDistrict, maxAgeHours = 6): Promise<boolean> {
  const cache = await loadDistrictCache(district);
  if (!cache) return true;
  const age = Date.now() - new Date(cache.updatedAt).getTime();
  return age > maxAgeHours * 60 * 60 * 1000;
}

export function computeMarketStats(listings: MarketListing[]) {
  const saleListings = listings.filter((l) => l.listing_status === "for_sale" && l.price_hkd > 0);
  const rentListings = listings.filter((l) => l.listing_status === "for_rent" && l.monthly_rent_hkd);

  const prices = saleListings.map((l) => l.price_per_sqft_hkd).filter(Boolean);
  const avgPricePerSqft = prices.length
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : 0;

  const avgRent = rentListings.length
    ? rentListings.reduce((a, l) => a + (l.monthly_rent_hkd ?? 0), 0) / rentListings.length
    : 0;
  const avgPrice = saleListings.length
    ? saleListings.reduce((a, l) => a + l.price_hkd, 0) / saleListings.length
    : 0;
  const avgYield =
    avgPrice > 0 ? Math.round(((avgRent * 12) / avgPrice) * 100 * 10) / 10 : 0;

  const allPrices = saleListings.map((l) => l.price_hkd).sort((a, b) => a - b);
  const median = allPrices[Math.floor(allPrices.length / 2)] ?? 0;

  return {
    avg_price_per_sqft_hkd: avgPricePerSqft,
    avg_gross_yield_pct: avgYield,
    median_price_hkd: median,
    total_listings_scraped: listings.length,
    price_range: {
      min: allPrices[0] ?? 0,
      max: allPrices[allPrices.length - 1] ?? 0,
    },
  };
}

async function updateLastUpdated(district: HKDistrict): Promise<void> {
  const filePath = path.join(CACHE_DIR, "last-updated.json");
  let existing: Record<string, string> = {};
  try {
    existing = JSON.parse(await fs.readFile(filePath, "utf-8"));
  } catch {
    // ignore
  }
  existing[district] = new Date().toISOString();
  await fs.writeFile(filePath, JSON.stringify(existing, null, 2));
}
