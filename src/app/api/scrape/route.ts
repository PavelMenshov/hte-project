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

export async function GET() {
  const districts: HKDistrict[] = ["Kwun Tong", "Mong Kok", "Sha Tin", "Tuen Mun"];

  const status = await Promise.all(
    districts.map(async (d) => {
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
