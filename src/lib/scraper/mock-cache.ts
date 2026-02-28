import type { DistrictCache, HKDistrict, MarketListing } from "./types";

/**
 * Realistic mock market data for HK districts when live scraping returns nothing.
 * Ensures prefetch and demo always have market context for the Bedrock agent.
 */
const MOCK_SALE: Record<HKDistrict, { address: string; price_hkd: number; size_sqft: number; rooms: number }[]> = {
  "Kwun Tong": [
    { address: "47 Hoi Yuen Road", price_hkd: 8200000, size_sqft: 2800, rooms: 12 },
    { address: "68 Hoi Yuen Road", price_hkd: 7500000, size_sqft: 2400, rooms: 10 },
    { address: "Ngau Tau Kok Road", price_hkd: 9100000, size_sqft: 2600, rooms: 11 },
    { address: "Lam Tin", price_hkd: 6800000, size_sqft: 2200, rooms: 8 },
    { address: "Kwun Tong Road", price_hkd: 7900000, size_sqft: 2500, rooms: 9 },
  ],
  "Mong Kok": [
    { address: "88 Portland Street", price_hkd: 11500000, size_sqft: 3200, rooms: 8 },
    { address: "Nathan Road", price_hkd: 13200000, size_sqft: 2800, rooms: 7 },
    { address: "Shanghai Street", price_hkd: 9800000, size_sqft: 2400, rooms: 6 },
    { address: "Tung Choi Street", price_hkd: 10500000, size_sqft: 2600, rooms: 7 },
    { address: "Argyle Street", price_hkd: 8900000, size_sqft: 2200, rooms: 6 },
  ],
  "Sha Tin": [
    { address: "22 Yuen Wo Road", price_hkd: 12000000, size_sqft: 2400, rooms: 8 },
    { address: "New Town Plaza area", price_hkd: 13500000, size_sqft: 2600, rooms: 9 },
    { address: "Lek Yuen", price_hkd: 9500000, size_sqft: 2000, rooms: 7 },
    { address: "Fo Tan", price_hkd: 8800000, size_sqft: 2200, rooms: 8 },
    { address: "Tai Wai", price_hkd: 10200000, size_sqft: 2300, rooms: 7 },
  ],
  "Tuen Mun": [
    { address: "Tuen Mun Town Centre", price_hkd: 6200000, size_sqft: 1400, rooms: 5 },
    { address: "Butterfly Estate area", price_hkd: 5500000, size_sqft: 1200, rooms: 4 },
    { address: "Siu Hong", price_hkd: 5800000, size_sqft: 1300, rooms: 5 },
    { address: "Prime View Estate", price_hkd: 5900000, size_sqft: 1250, rooms: 4 },
    { address: "Leung King", price_hkd: 5400000, size_sqft: 1150, rooms: 4 },
  ],
  "Sham Shui Po": [
    { address: "Yu Chau Street", price_hkd: 7200000, size_sqft: 1800, rooms: 6 },
    { address: "Cheung Sha Wan Road", price_hkd: 6800000, size_sqft: 1600, rooms: 5 },
  ],
  "Yau Tsim Mong": [
    { address: "Jordan Road", price_hkd: 12800000, size_sqft: 2400, rooms: 6 },
    { address: "Austin Road", price_hkd: 14200000, size_sqft: 2600, rooms: 7 },
  ],
  "Wong Tai Sin": [
    { address: "Lung Cheung Road", price_hkd: 7800000, size_sqft: 2000, rooms: 7 },
    { address: "Chuk Yuen", price_hkd: 7100000, size_sqft: 1800, rooms: 6 },
  ],
  "Kowloon City": [
    { address: "Prince Edward Road", price_hkd: 9500000, size_sqft: 2200, rooms: 7 },
    { address: "Kai Tak area", price_hkd: 10200000, size_sqft: 2400, rooms: 8 },
  ],
};

const MOCK_RENT: Record<HKDistrict, { address: string; monthly_rent_hkd: number; size_sqft: number }[]> = {
  "Kwun Tong": [
    { address: "Hoi Yuen Road", monthly_rent_hkd: 82000, size_sqft: 2800 },
    { address: "Ngau Tau Kok", monthly_rent_hkd: 72000, size_sqft: 2400 },
    { address: "Lam Tin", monthly_rent_hkd: 65000, size_sqft: 2200 },
  ],
  "Mong Kok": [
    { address: "Portland Street", monthly_rent_hkd: 96000, size_sqft: 3200 },
    { address: "Nathan Road", monthly_rent_hkd: 88000, size_sqft: 2800 },
    { address: "Shanghai Street", monthly_rent_hkd: 78000, size_sqft: 2400 },
  ],
  "Sha Tin": [
    { address: "Yuen Wo Road", monthly_rent_hkd: 58000, size_sqft: 2400 },
    { address: "New Town Plaza", monthly_rent_hkd: 62000, size_sqft: 2600 },
    { address: "Lek Yuen", monthly_rent_hkd: 52000, size_sqft: 2000 },
  ],
  "Tuen Mun": [
    { address: "Town Centre", monthly_rent_hkd: 26000, size_sqft: 1400 },
    { address: "Siu Hong", monthly_rent_hkd: 24000, size_sqft: 1300 },
    { address: "Butterfly", monthly_rent_hkd: 22000, size_sqft: 1200 },
  ],
  "Sham Shui Po": [
    { address: "Yu Chau Street", monthly_rent_hkd: 42000, size_sqft: 1800 },
  ],
  "Yau Tsim Mong": [
    { address: "Jordan", monthly_rent_hkd: 85000, size_sqft: 2400 },
  ],
  "Wong Tai Sin": [
    { address: "Lung Cheung Road", monthly_rent_hkd: 48000, size_sqft: 2000 },
  ],
  "Kowloon City": [
    { address: "Prince Edward", monthly_rent_hkd: 58000, size_sqft: 2200 },
  ],
};

export function generateMockCache(district: HKDistrict): DistrictCache {
  const now = new Date().toISOString();
  const sales = MOCK_SALE[district] ?? MOCK_SALE["Kwun Tong"];
  const rents = MOCK_RENT[district] ?? MOCK_RENT["Kwun Tong"];

  const listings: MarketListing[] = [];

  sales.forEach((s, i) => {
    listings.push({
      id: `mock-sale-${district.toLowerCase().replace(/\s+/g, "-")}-${i + 1}`,
      source: "mock",
      url: `https://squarefoot.com.hk/mock/${district}`,
      scrapedAt: now,
      address: s.address,
      district,
      price_hkd: s.price_hkd,
      size_sqft: s.size_sqft,
      price_per_sqft_hkd: Math.round(s.price_hkd / s.size_sqft),
      rooms: s.rooms,
      floor: null,
      monthly_rent_hkd: null,
      gross_yield_pct: null,
      mtr_station: null,
      mtr_distance_min: null,
      listing_date: null,
      listing_status: "for_sale",
    });
  });

  rents.forEach((r, i) => {
    listings.push({
      id: `mock-rent-${district.toLowerCase().replace(/\s+/g, "-")}-${i + 1}`,
      source: "mock",
      url: `https://squarefoot.com.hk/mock/${district}-rent`,
      scrapedAt: now,
      address: r.address,
      district,
      price_hkd: 0,
      size_sqft: r.size_sqft,
      price_per_sqft_hkd: 0,
      rooms: 1,
      floor: null,
      monthly_rent_hkd: r.monthly_rent_hkd,
      gross_yield_pct: null,
      mtr_station: null,
      mtr_distance_min: null,
      listing_date: null,
      listing_status: "for_rent",
    });
  });

  const saleListings = listings.filter((l) => l.listing_status === "for_sale" && l.price_hkd > 0);
  const rentListings = listings.filter((l) => l.listing_status === "for_rent" && l.monthly_rent_hkd);
  const prices = saleListings.map((l) => l.price_per_sqft_hkd);
  const avgPricePerSqft = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 12000;
  const avgRent = rentListings.length
    ? rentListings.reduce((a, l) => a + (l.monthly_rent_hkd ?? 0), 0) / rentListings.length
    : 0;
  const avgPrice = saleListings.length
    ? saleListings.reduce((a, l) => a + l.price_hkd, 0) / saleListings.length
    : 0;
  const avgYield = avgPrice > 0 ? Math.round(((avgRent * 12) / avgPrice) * 100 * 10) / 10 : 4.5;
  const allPrices = saleListings.map((l) => l.price_hkd).sort((a, b) => a - b);
  const median = allPrices[Math.floor(allPrices.length / 2)] ?? avgPrice;

  return {
    district,
    updatedAt: now,
    listings,
    market_stats: {
      avg_price_per_sqft_hkd: avgPricePerSqft,
      avg_gross_yield_pct: avgYield,
      median_price_hkd: median,
      total_listings_scraped: listings.length,
      price_range: { min: allPrices[0] ?? 0, max: allPrices[allPrices.length - 1] ?? 0 },
    },
  };
}
