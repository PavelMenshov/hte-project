import { NextRequest, NextResponse } from "next/server";
import { scrapeAllDistricts, scrapeDistrict, loadDistrictCache } from "@/lib/scraper";
import type { HKDistrict } from "@/lib/scraper/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { district } = body as { district?: string };

    if (district) {
      const result = await scrapeDistrict(district as HKDistrict);
      return NextResponse.json({ results: [result] });
    }

    const results = await scrapeAllDistricts();
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: "Scrape failed", details: String(error) },
      { status: 500 }
    );
  }
}

const DISTRICTS: HKDistrict[] = ["Kwun Tong", "Mong Kok", "Sha Tin", "Tuen Mun"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get("district") as HKDistrict | null;

  if (district && DISTRICTS.includes(district)) {
    const cache = await loadDistrictCache(district);
    if (!cache) return NextResponse.json({ district, cached: false, listings: [], market_stats: null, updatedAt: null });
    return NextResponse.json({
      district: cache.district,
      cached: true,
      listings: cache.listings,
      market_stats: cache.market_stats,
      updatedAt: cache.updatedAt,
    });
  }

  const status = await Promise.all(
    DISTRICTS.map(async (d) => {
      const cache = await loadDistrictCache(d);
      return {
        district: d,
        cached: !!cache,
        updatedAt: cache?.updatedAt ?? null,
        listingsCount: cache?.listings.length ?? 0,
        marketStats: cache?.market_stats ?? null,
      };
    })
  );

  return NextResponse.json({ status });
}
