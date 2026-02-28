import { scrapeSquarefoot } from "./squarefoot";
import {
  saveDistrictCache,
  loadDistrictCache,
  isCacheStale,
  computeMarketStats,
} from "./cache";
import { generateMockCache } from "./mock-cache";
import type { DistrictCache, HKDistrict, ScrapeResult } from "./types";

export async function scrapeDistrict(district: HKDistrict): Promise<ScrapeResult> {
  const start = Date.now();
  try {
    console.log(`🔍 Scraping ${district}...`);
    const listings = await scrapeSquarefoot(district, 25);

    if (listings.length === 0) {
      const old = await loadDistrictCache(district);
      if (old) {
        console.log(`⚠️ No new listings, keeping cached data for ${district}`);
        return {
          success: true,
          district,
          listingsFound: old.listings.length,
          duration_ms: Date.now() - start,
        };
      }
      console.log(`⚠️ No live data for ${district}, saving mock cache for demo`);
      const mockCache = generateMockCache(district);
      await saveDistrictCache(mockCache);
      return {
        success: true,
        district,
        listingsFound: mockCache.listings.length,
        duration_ms: Date.now() - start,
      };
    }

    const cache: DistrictCache = {
      district,
      updatedAt: new Date().toISOString(),
      listings,
      market_stats: computeMarketStats(listings),
    };

    await saveDistrictCache(cache);
    console.log(`✅ ${district}: ${listings.length} listings cached`);

    return {
      success: true,
      district,
      listingsFound: listings.length,
      duration_ms: Date.now() - start,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`❌ Scrape failed for ${district}:`, msg);
    return {
      success: false,
      district,
      listingsFound: 0,
      error: msg,
      duration_ms: Date.now() - start,
    };
  }
}

export async function scrapeAllDistricts(): Promise<ScrapeResult[]> {
  const districts: HKDistrict[] = ["Kwun Tong", "Mong Kok", "Sha Tin", "Tuen Mun"];
  const results: ScrapeResult[] = [];

  for (const district of districts) {
    const result = await scrapeDistrict(district);
    results.push(result);
    await new Promise((r) => setTimeout(r, 3000));
  }

  return results;
}

export async function getMarketDataForAgent(
  district: HKDistrict
): Promise<DistrictCache | null> {
  const stale = await isCacheStale(district, 6);
  if (stale) {
    await scrapeDistrict(district);
  }
  return loadDistrictCache(district);
}

export function formatMarketDataForPrompt(cache: DistrictCache): string {
  const { market_stats, listings, district } = cache;
  const saleListings = listings
    .filter((l) => l.listing_status === "for_sale")
    .slice(0, 5);
  const rentListings = listings
    .filter((l) => l.listing_status === "for_rent")
    .slice(0, 5);

  return `
CURRENT MARKET DATA FOR ${district.toUpperCase()} (as of ${new Date(cache.updatedAt).toLocaleDateString()}):

Market Statistics:
- Average price: HKD ${market_stats.avg_price_per_sqft_hkd.toLocaleString()}/sqft
- Average gross yield: ${market_stats.avg_gross_yield_pct}%
- Median property price: HKD ${market_stats.median_price_hkd.toLocaleString()}
- Price range: HKD ${market_stats.price_range.min.toLocaleString()} – ${market_stats.price_range.max.toLocaleString()}
- Sample size: ${market_stats.total_listings_scraped} listings

Recent Sale Listings (comparables):
${saleListings
  .map(
    (l) =>
      `• ${l.address || "Address N/A"}: HKD ${l.price_hkd.toLocaleString()} | ${l.size_sqft} sqft | HKD ${l.price_per_sqft_hkd.toLocaleString()}/sqft`
  )
  .join("\n")}

Recent Rental Listings:
${rentListings
  .map(
    (l) =>
      `• ${l.address || "Address N/A"}: HKD ${l.monthly_rent_hkd?.toLocaleString()}/month | ${l.size_sqft || "?"} sqft`
  )
  .join("\n")}
`.trim();
}

export { loadDistrictCache, isCacheStale };
export type { HKDistrict, DistrictCache, MarketListing, ScrapeResult } from "./types";
