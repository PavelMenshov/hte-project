import { NextResponse } from "next/server";
import { fetchRVDMarketData } from "@/lib/rvd-data";
import type { RVDMarketSnapshot } from "@/lib/rvd-data";

let cache: { data: RVDMarketSnapshot; timestamp: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }
  const data = await fetchRVDMarketData();
  if (data) cache = { data, timestamp: Date.now() };
  return NextResponse.json(data);
}
