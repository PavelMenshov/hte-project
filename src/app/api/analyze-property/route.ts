import { NextResponse } from "next/server";
import propertiesData from "@/data/properties.json";
import type { Property } from "@/types/property";
import { analyzeProperty } from "@/lib/bedrock-property-agent";

const PROPERTIES = (propertiesData as { properties: Property[] }).properties;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = typeof body.id === "string" ? body.id : body.propertyId;
    if (!id) return NextResponse.json({ error: "Missing property id" }, { status: 400 });

    const property = PROPERTIES.find((p) => p.id === id);
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    const text = await analyzeProperty(property);

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        for (let i = 0; i < text.length; i += 50) {
          controller.enqueue(encoder.encode(text.slice(i, i + 50)));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[analyze-property]", e);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
