import { NextResponse } from "next/server";
import { getMarketProperties } from "@/lib/market-properties";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const all = await getMarketProperties();
  if (id) {
    const one = all.find((p) => p.id === id);
    if (!one) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(one);
  }
  return NextResponse.json(all);
}
