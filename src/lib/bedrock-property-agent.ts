/**
 * Tenantshield Property Acquisition Analyzer.
 * Uses BEDROCK_PROPERTY_AGENT_ID + BEDROCK_PROPERTY_AGENT_ALIAS_ID when set,
 * else InvokeModel (amazon.nova-lite-v1:0).
 * Enriched with scraped market data from squarefoot.com.hk when available.
 */

import type { Property } from "@/types/property";
import { getMarketDataForAgent, formatMarketDataForPrompt } from "./scraper";
import type { HKDistrict } from "./scraper/types";
import { fetchRVDMarketData } from "./rvd-data";

const SCRAPED_DISTRICTS: HKDistrict[] = ["Kwun Tong", "Mong Kok", "Sha Tin", "Tuen Mun"];

function getConfig() {
  const region = process.env.AWS_REGION ?? "ap-southeast-1";
  const agentId = (process.env.BEDROCK_PROPERTY_AGENT_ID ?? process.env.BEDROCK_AGENT_ID)?.trim();
  const agentAliasId = (process.env.BEDROCK_PROPERTY_AGENT_ALIAS_ID ?? process.env.BEDROCK_AGENT_ALIAS_ID)?.trim();
  const modelId = (process.env.BEDROCK_MODEL_ID ?? "amazon.nova-lite-v1:0").trim();
  return {
    region,
    modelId,
    useAgent: !!(agentId && agentAliasId),
    agentId: agentId ?? "",
    agentAliasId: agentAliasId ?? "",
  };
}

/** Builds full prompt with RVD official data + district comparables. */
export async function buildPropertyAnalysisPrompt(property: Property): Promise<string> {
  const districtStr = property.district;
  const district = SCRAPED_DISTRICTS.includes(districtStr as HKDistrict)
    ? (districtStr as HKDistrict)
    : null;

  const [districtCache, rvdSnapshot] = await Promise.all([
    district ? getMarketDataForAgent(district).catch(() => null) : Promise.resolve(null),
    fetchRVDMarketData(),
  ]);

  let marketContext = "Market data unavailable — use general HK knowledge.";
  if (districtCache) marketContext = formatMarketDataForPrompt(districtCache);

  const rvdContext = rvdSnapshot
    ? `
HK TERRITORY-WIDE MARKET (Rating & Valuation Department, official):
- Latest month transactions: ${rvdSnapshot.recentTransactions[0]?.totalSales.toLocaleString() ?? "—"} deals
- Total market value: HKD ${rvdSnapshot.recentTransactions[0]?.totalValue.toLocaleString() ?? "—"}M
- Market trend: ${rvdSnapshot.marketTrend.toUpperCase()} (${rvdSnapshot.trendPercent > 0 ? "+" : ""}${rvdSnapshot.trendPercent}% vs prev quarter)
`
    : "";

  return `
You are Tenantshield's AI Property Acquisition Analyst for Hong Kong co-living investments.

PROPERTY TO ANALYZE:
${JSON.stringify(
  {
    name: property.name,
    address: property.address,
    district: property.district,
    type: property.type,
    rooms: property.rooms,
    size_sqft: property.size_sqft,
    monthly_rent_hkd: property.monthly_rent_hkd,
    gross_yield_pct: property.gross_yield_pct,
    net_yield_pct: property.net_yield_pct,
    ai_score: property.ai_score,
    risk_level: property.risk_level,
  },
  null,
  2
)}
${rvdContext}

${marketContext}

Based on the property data, official HK market data above, and district comparables, provide:

1. AI SCORE (0.0–10.0): Single number
2. RECOMMENDATION: BUY / HOLD / REJECT
3. TOP 3 REASONS: Why this recommendation (be specific, reference market data)
4. KEY CONCERNS: 1-3 risks or issues
5. GROWTH FORECAST: Estimated % annual appreciation
6. CO-LIVING ASSESSMENT: Suitability for student co-living model (room density, target tenant profile)
7. COMPARABLE ANALYSIS: How this property compares to the market data provided

Be specific. Reference actual numbers from the market data and official HK market data.
Format your response clearly with these exact section headers.
Reference the official HK market data (RVD) in your analysis when relevant.
`.trim();
}

export type MarketListingInput = {
  address: string;
  district: string;
  price_hkd: number;
  size_sqft: number;
  rooms: number;
  monthly_rent_hkd: number | null;
  listing_status: string;
};

export type EnrichedMarketListing = {
  translated_address: string;
  translated_name: string;
  ai_score: number;
  ai_recommendation: "BUY" | "HOLD" | "REJECT";
  ai_summary: string;
  ai_buy_reasons: string[];
  ai_concerns: string[];
  gross_yield_pct: number;
};

/** Build prompt for a scraped market listing: translate + score for co-living. */
export async function buildMarketListingPrompt(listing: MarketListingInput): Promise<string> {
  const district = SCRAPED_DISTRICTS.includes(listing.district as HKDistrict)
    ? (listing.district as HKDistrict)
    : null;
  const [districtCache, rvdSnapshot] = await Promise.all([
    district ? getMarketDataForAgent(district).catch(() => null) : Promise.resolve(null),
    fetchRVDMarketData(),
  ]);
  let marketContext = "Market data unavailable.";
  if (districtCache) marketContext = formatMarketDataForPrompt(districtCache);
  const rvdContext = rvdSnapshot
    ? `RVD: ${rvdSnapshot.recentTransactions[0]?.totalSales ?? "—"} deals, trend ${rvdSnapshot.marketTrend}`
    : "";

  const rent = listing.monthly_rent_hkd ?? 0;
  const yieldPct = listing.price_hkd > 0 && rent > 0
    ? ((rent * 12) / listing.price_hkd) * 100
    : 0;

  return `
You are Tenantshield's AI Property Analyst for Hong Kong. Analyze this LISTING from the market (address may be in Chinese).

LISTING:
- Address: ${listing.address}
- District: ${listing.district}
- Price (HKD): ${listing.price_hkd.toLocaleString()}
- Size: ${listing.size_sqft} sqft
- Rooms: ${listing.rooms}
- Monthly rent (HKD): ${rent > 0 ? rent.toLocaleString() : "unknown"}
- Listing type: ${listing.listing_status}
- Implied gross yield: ${yieldPct.toFixed(1)}%

${rvdContext}
${marketContext}

TASKS:
1. TRANSLATE: If the address is in Chinese, provide a short English translation for display (one line). Otherwise use the address as-is.
2. NAME: Suggest a short property name in English for this listing (e.g. "Mong Kok 3-bed near MTR").
3. SCORE: Give AI score 0.0–10.0 for co-living investment.
4. RECOMMENDATION: BUY, HOLD, or REJECT.
5. SUMMARY: 2–3 sentences.
6. REASONS: 2–3 bullet points why this recommendation.
7. CONCERNS: 1–2 risks if any.

Respond with valid JSON only, no markdown, exactly this structure:
{"translated_address":"...","translated_name":"...","ai_score":7.5,"ai_recommendation":"BUY","ai_summary":"...","ai_buy_reasons":["..."],"ai_concerns":["..."],"gross_yield_pct":4.2}
`.trim();
}

/** Analyze a market listing (translate + score). Returns structured enrichment or null on failure. */
export async function analyzeMarketListing(listing: MarketListingInput): Promise<EnrichedMarketListing | null> {
  const config = getConfig();
  const prompt = await buildMarketListingPrompt(listing);

  let text: string;
  if (config.useAgent) {
    try {
      const { BedrockAgentRuntimeClient, InvokeAgentCommand } = await import("@aws-sdk/client-bedrock-agent-runtime");
      const client = new BedrockAgentRuntimeClient({ region: config.region });
      const response = await client.send(
        new InvokeAgentCommand({
          agentId: config.agentId,
          agentAliasId: config.agentAliasId,
          sessionId: `listing-${Date.now()}`,
          inputText: prompt,
        })
      );
      text = "";
      if (response.completion) {
        for await (const event of response.completion) {
          const chunk = event as { chunk?: { bytes?: Uint8Array } };
          if (chunk.chunk?.bytes) text += new TextDecoder("utf-8").decode(chunk.chunk.bytes);
        }
      }
    } catch (e) {
      console.error("[Bedrock Market Listing]", e);
      return null;
    }
  } else {
    try {
      const { BedrockRuntimeClient, InvokeModelCommand } = await import("@aws-sdk/client-bedrock-runtime");
      const client = new BedrockRuntimeClient({ region: config.region });
      const body = JSON.stringify({
        schemaVersion: "messages-v1",
        messages: [{ role: "user", content: [{ text: prompt }] }],
        inferenceConfig: { maxTokens: 512, temperature: 0.2 },
      });
      const response = await client.send(
        new InvokeModelCommand({
          modelId: config.modelId,
          contentType: "application/json",
          accept: "application/json",
          body,
        })
      );
      const decoded = JSON.parse(new TextDecoder().decode(response.body)) as Record<string, unknown>;
      const output = decoded.output as Record<string, unknown> | undefined;
      const message = output?.message as Record<string, unknown> | undefined;
      const content = message?.content as Array<{ text?: string }> | undefined;
      text = content?.[0]?.text ?? "";
    } catch (e) {
      console.error("[Bedrock Market Listing InvokeModel]", e);
      return null;
    }
  }

  try {
    const jsonStr = text.replace(/```json?\s*/i, "").replace(/```\s*$/, "").trim();
    const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
    const score = Number(parsed.ai_score);
    const rec = String(parsed.ai_recommendation ?? "HOLD").toUpperCase();
    return {
      translated_address: String(parsed.translated_address ?? listing.address),
      translated_name: String(parsed.translated_name ?? listing.address.split(",")[0] ?? "Market listing"),
      ai_score: Number.isFinite(score) ? score : 5,
      ai_recommendation: rec === "BUY" ? "BUY" : rec === "REJECT" ? "REJECT" : "HOLD",
      ai_summary: String(parsed.ai_summary ?? ""),
      ai_buy_reasons: Array.isArray(parsed.ai_buy_reasons) ? parsed.ai_buy_reasons.map(String) : [],
      ai_concerns: Array.isArray(parsed.ai_concerns) ? parsed.ai_concerns.map(String) : [],
      gross_yield_pct: Number(parsed.gross_yield_pct) || (listing.price_hkd > 0 && listing.monthly_rent_hkd
        ? ((listing.monthly_rent_hkd * 12) / listing.price_hkd) * 100
        : 0),
    };
  } catch {
    return null;
  }
}

/** Non-streaming: full analysis text. Uses market data from scraper when available. */
export async function analyzeProperty(property: Property): Promise<string> {
  const config = getConfig();
  const prompt = await buildPropertyAnalysisPrompt(property);

  if (config.useAgent) {
    try {
      const { BedrockAgentRuntimeClient, InvokeAgentCommand } = await import("@aws-sdk/client-bedrock-agent-runtime");
      const client = new BedrockAgentRuntimeClient({ region: config.region });
      const response = await client.send(
        new InvokeAgentCommand({
          agentId: config.agentId,
          agentAliasId: config.agentAliasId,
          sessionId: `prop-${Date.now()}`,
          inputText: prompt,
        })
      );
      let text = "";
      if (response.completion) {
        for await (const event of response.completion) {
          const chunk = event as { chunk?: { bytes?: Uint8Array } };
          if (chunk.chunk?.bytes) text += new TextDecoder("utf-8").decode(chunk.chunk.bytes);
        }
      }
      return text || "No analysis returned.";
    } catch (e) {
      console.error("[Bedrock Property Agent]", e);
      return `Analysis temporarily unavailable: ${(e as Error).message}. Showing cached report.`;
    }
  }

  const { BedrockRuntimeClient, InvokeModelCommand } = await import("@aws-sdk/client-bedrock-runtime");
  const client = new BedrockRuntimeClient({ region: config.region });
  const body = JSON.stringify({
    schemaVersion: "messages-v1",
    messages: [{ role: "user", content: [{ text: prompt }] }],
    inferenceConfig: { maxTokens: 1024, temperature: 0.3 },
  });
  try {
    const response = await client.send(
      new InvokeModelCommand({
        modelId: config.modelId,
        contentType: "application/json",
        accept: "application/json",
        body,
      })
    );
    const decoded = JSON.parse(new TextDecoder().decode(response.body)) as Record<string, unknown>;
    const output = decoded.output as Record<string, unknown> | undefined;
    const message = output?.message as Record<string, unknown> | undefined;
    const content = message?.content as Array<{ text?: string }> | undefined;
    const text = content?.[0]?.text ?? (decoded.content as Array<{ text?: string }> | undefined)?.[0]?.text ?? "";
    return text || "No analysis returned.";
  } catch (e) {
    console.error("[Bedrock Property InvokeModel]", e);
    return `Analysis temporarily unavailable: ${(e as Error).message}. Showing cached report.`;
  }
}
