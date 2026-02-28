export interface MarketListing {
  id: string;
  source: "squarefoot" | "centaline" | "mock" | "28hse";
  url: string;
  scrapedAt: string;
  /** First listing image URL from source (e.g. 28hse card thumbnail) */
  image_url?: string;

  address: string;
  district: HKDistrict;
  price_hkd: number;
  size_sqft: number;
  price_per_sqft_hkd: number;
  rooms: number;
  floor: string | null;

  monthly_rent_hkd: number | null;
  gross_yield_pct: number | null;

  mtr_station: string | null;
  mtr_distance_min: number | null;

  listing_date: string | null;
  listing_status: "for_sale" | "for_rent" | "sold" | "unknown";
}

export type HKDistrict =
  | "Kwun Tong"
  | "Mong Kok"
  | "Sha Tin"
  | "Tuen Mun"
  | "Sham Shui Po"
  | "Yau Tsim Mong"
  | "Wong Tai Sin"
  | "Kowloon City";

export interface DistrictCache {
  district: HKDistrict;
  updatedAt: string;
  listings: MarketListing[];
  market_stats: {
    avg_price_per_sqft_hkd: number;
    avg_gross_yield_pct: number;
    median_price_hkd: number;
    total_listings_scraped: number;
    price_range: { min: number; max: number };
  };
}

export interface ScrapeResult {
  success: boolean;
  district: HKDistrict;
  listingsFound: number;
  error?: string;
  duration_ms: number;
}
