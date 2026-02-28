/**
 * Portfolio Advisor — AWS Bedrock agent or InvokeModel for investor chat.
 * Uses BEDROCK_ADVISOR_AGENT_ID / BEDROCK_ADVISOR_AGENT_ALIAS_ID when set,
 * else InvokeModel. Fallback: local text from portfolio context when no credentials.
 */

export interface PortfolioContext {
  tokensHeld: number;
  totalValueHkd: number;
  totalEarnedHkd: number;
  nextPayoutHkd: number;
  navPerToken: number;
  yieldPct: number;
  sharePct: number;
}

const ADVISOR_SYSTEM = `You are Tenantshield's Portfolio Advisor. You help anonymous token holders understand their investment.
You know: their token count, total value (HKD), total earned, next payout, NAV (HKD 1,073), portfolio yield (8.3%), and their share of the fund.
You do NOT know the investor's identity — only anonymous portfolio data.
Answer as a concise financial advisor for the fund. Keep responses under 120 words. Be specific with numbers. Never ask for personal information.`;

function getAdvisorConfig() {
  const region = process.env.AWS_REGION ?? "ap-southeast-1";
  const agentId = process.env.BEDROCK_ADVISOR_AGENT_ID?.trim();
  const agentAliasId = process.env.BEDROCK_ADVISOR_AGENT_ALIAS_ID?.trim();
  const modelId = (process.env.BEDROCK_MODEL_ID ?? "amazon.nova-lite-v1:0").trim();
  return {
    region,
    modelId,
    useAgent: !!(agentId && agentAliasId),
    agentId: agentId ?? "",
    agentAliasId: agentAliasId ?? "",
  };
}

function buildFallbackReply(ctx: PortfolioContext, userMessage: string): string {
  const hasQuestion = userMessage.trim().length > 0;
  if (!hasQuestion) {
    return `Your ${ctx.tokensHeld} tokens are performing well. Current value: HKD ${ctx.totalValueHkd.toLocaleString()} (yield ${ctx.yieldPct}% annualized). You've earned HKD ${ctx.totalEarnedHkd.toLocaleString()} so far; next payout is HKD ${ctx.nextPayoutHkd} in about 23 days. At reinvestment rate, doubling your position would take roughly 8–9 years. A new property is planned for Q2 2026 — a good time to consider adding more tokens before NAV rises.`;
  }
  const lower = userMessage.toLowerCase();
  if (lower.includes("yield") || lower.includes("earn")) {
    return `At ${ctx.yieldPct}% annualized yield, your ${ctx.tokensHeld} tokens generate about HKD ${Math.round((ctx.totalValueHkd * ctx.yieldPct) / 100 / 4).toLocaleString()} per quarter. You've already earned HKD ${ctx.totalEarnedHkd.toLocaleString()} in total.`;
  }
  if (lower.includes("buy") || lower.includes("more")) {
    return `Your current share is ${ctx.sharePct.toFixed(3)}% of the Tenantshield portfolio. Buying more tokens increases your share of rental income. NAV is HKD ${ctx.navPerToken}; new acquisitions could push NAV up, so adding before Q2 2026 may be favourable.`;
  }
  return `Your portfolio: ${ctx.tokensHeld} tokens, HKD ${ctx.totalValueHkd.toLocaleString()} total value, ${ctx.yieldPct}% yield. Next payout HKD ${ctx.nextPayoutHkd}. For specific questions, we use live AI when Bedrock is configured.`;
}

export async function getPortfolioAdvice(
  message: string,
  portfolioContext: PortfolioContext
): Promise<string> {
  const config = getAdvisorConfig();
  const ctxStr = JSON.stringify(portfolioContext, null, 2);
  const userPrompt = message.trim()
    ? `Portfolio context:\n${ctxStr}\n\nUser question: ${message}`
    : `Portfolio context:\n${ctxStr}\n\nGive a brief personalized welcome and portfolio summary (yield, NAV growth, time to double, and one recommendation).`;

  if (config.useAgent) {
    try {
      const { BedrockAgentRuntimeClient, InvokeAgentCommand } = await import("@aws-sdk/client-bedrock-agent-runtime");
      const client = new BedrockAgentRuntimeClient({ region: config.region });
      const response = await client.send(
        new InvokeAgentCommand({
          agentId: config.agentId,
          agentAliasId: config.agentAliasId,
          sessionId: `advisor-${Date.now()}`,
          inputText: `${ADVISOR_SYSTEM}\n\n---\n${userPrompt}`,
        })
      );
      let text = "";
      if (response.completion) {
        for await (const event of response.completion) {
          const chunk = event as { chunk?: { bytes?: Uint8Array } };
          if (chunk.chunk?.bytes) text += new TextDecoder("utf-8").decode(chunk.chunk.bytes);
        }
      }
      return text?.trim() || buildFallbackReply(portfolioContext, message);
    } catch (e) {
      console.error("[Bedrock Advisor]", e);
      return buildFallbackReply(portfolioContext, message);
    }
  }

  const hasCreds = process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SECRET_ACCESS_KEY;
  if (!hasCreds) return buildFallbackReply(portfolioContext, message);

  try {
    const { BedrockRuntimeClient, InvokeModelCommand } = await import("@aws-sdk/client-bedrock-runtime");
    const client = new BedrockRuntimeClient({ region: config.region });
    const body = JSON.stringify({
      schemaVersion: "messages-v1",
      messages: [
        { role: "user", content: [{ text: `${ADVISOR_SYSTEM}\n\n---\n${userPrompt}` }] }],
      inferenceConfig: { maxTokens: 512, temperature: 0.4 },
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
    const msg = output?.message as Record<string, unknown> | undefined;
    const content = msg?.content as Array<{ text?: string }> | undefined;
    const text = content?.[0]?.text ?? "";
    return text?.trim() || buildFallbackReply(portfolioContext, message);
  } catch (e) {
    console.error("[Bedrock Advisor InvokeModel]", e);
    return buildFallbackReply(portfolioContext, message);
  }
}
