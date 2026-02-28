import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const amountHkd = Number(body.amountHkd) || 10000;
    const nav = 1073;
    const tokensReceived = Math.floor(amountHkd / nav);
    const hash = "0x" + Array(64)
      .fill(0)
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join("");
    return NextResponse.json({
      transactionHash: hash,
      tokensReceived,
      timestamp: new Date().toISOString(),
      abelianProof: "zk-proof-demo-" + hash.slice(2, 20),
    });
  } catch {
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 });
  }
}
