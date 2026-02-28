import { NextResponse } from "next/server";
import { analyzeMarketListing } from "@/lib/bedrock-property-agent";
import type { MarketListing } from "@/lib/scraper/types";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const listing = body.listing as MarketListing | undefined;
    if (!listing || typeof listing.address !== "string") {
      return NextResponse.json({ error: "Missing listing object" }, { status: 400 });
    }
    const result = await analyzeMarketListing({
      address: listing.address,
      district: listing.district,
      price_hkd: listing.price_hkd,
      size_sqft: listing.size_sqft,
      rooms: listing.rooms,
      monthly_rent_hkd: listing.monthly_rent_hkd,
      listing_status: listing.listing_status,
    });
    if (!result) return NextResponse.json({ error: "AI analysis failed" }, { status: 502 });
    return NextResponse.json(result);
  } catch (e) {
    console.error("[enrich-listing]", e);
    return NextResponse.json({ error: "Enrichment failed" }, { status: 500 });
  }
}
