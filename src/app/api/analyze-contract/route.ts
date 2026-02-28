import { NextResponse } from "next/server";
import { analyzeContractText } from "@/lib/bedrock";

export async function POST(req: Request) {
  try {
    const { contractText } = (await req.json()) as { contractText?: string };
    if (!contractText || typeof contractText !== "string") {
      return NextResponse.json(
        { error: "contractText required" },
        { status: 400 }
      );
    }
    const result = await analyzeContractText(contractText);
    return NextResponse.json(result);
  } catch (e) {
    console.error("analyze-contract:", e);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}
