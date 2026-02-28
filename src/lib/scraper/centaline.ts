import type { MarketListing, HKDistrict } from "./types";

/**
 * Centaline (centaline.com) — исторические сделки HK.
 * Stub: в продакшене здесь парсинг страниц сделок для компараблов.
 */
export async function scrapeCentaline(
  _district: HKDistrict,
  _maxListings = 10
): Promise<MarketListing[]> {
  return [];
}
