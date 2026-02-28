import { NextResponse } from "next/server";
import { getPortfolioAdvice } from "@/lib/bedrock-advisor";
import type { PortfolioContext } from "@/lib/bedrock-advisor";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = typeof body.message === "string" ? body.message : "";
    const ctx = body.portfolioContext as PortfolioContext | undefined;
    if (!ctx || typeof ctx.tokensHeld !== "number") {
      return NextResponse.json({ error: "Missing portfolioContext" }, { status: 400 });
    }
    const portfolioContext: PortfolioContext = {
      tokensHeld: ctx.tokensHeld ?? 25,
      totalValueHkd: ctx.totalValueHkd ?? 0,
      totalEarnedHkd: ctx.totalEarnedHkd ?? 0,
      nextPayoutHkd: ctx.nextPayoutHkd ?? 0,
      navPerToken: ctx.navPerToken ?? 1073,
      yieldPct: ctx.yieldPct ?? 8.3,
      sharePct: ctx.sharePct ?? 0,
    };

    const text = await getPortfolioAdvice(message, portfolioContext);

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        for (let i = 0; i < text.length; i += 30) {
          controller.enqueue(encoder.encode(text.slice(i, i + 30)));
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
    console.error("[portfolio-advisor]", e);
    return NextResponse.json({ error: "Advisor failed" }, { status: 500 });
  }
}
