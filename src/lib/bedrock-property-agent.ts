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
