/**
 * AWS Bedrock integration for TenantShield.
 * When BEDROCK_AGENT_ID + BEDROCK_AGENT_ALIAS_ID are set, uses Bedrock Agent (AgentCore).
 * Otherwise: InvokeModel with Amazon Nova (default) or Titan.
 */

function getConfig() {
  const region = process.env.AWS_REGION ?? "us-east-1";
  const agentId = process.env.BEDROCK_AGENT_ID?.trim();
  const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID?.trim();
  const modelId = (process.env.BEDROCK_MODEL_ID ?? "amazon.nova-lite-v1:0").trim();
  return {
    region,
    modelId,
    useAgent: !!(agentId && agentAliasId),
    agentId: agentId ?? "",
    agentAliasId: agentAliasId ?? "",
  };
}

export type ContractAnalysisResult = {
  summary: string;
  redFlags: string[];
  recommendations: string[];
  marketNote?: string;
  legalRefs?: string[];
};

const CONTRACT_ANALYZER_PROMPT = `You are a tenant rights expert for Hong Kong. Analyze the following tenancy agreement text.
Output valid JSON only, with keys: summary (string), redFlags (string[]), recommendations (string[]), marketNote (string, optional), legalRefs (string[], optional).
Focus on: illegal clauses, unfair deposit terms, early termination, landlord obligations. Reference HK law where relevant.`;

function parseResultText(text: string): ContractAnalysisResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
      // Agent may return red_flags, illegal_clauses, market_comparison — map to our shape
      const redFlags = (parsed.red_flags as string[] | undefined) ?? (parsed.redFlags as string[] | undefined) ?? [];
      const illegal = (parsed.illegal_clauses as string[] | undefined) ?? [];
      const recs = (parsed.recommendations as string[] | undefined) ?? [];
      const market = parsed.market_comparison as Record<string, unknown> | undefined;
      const summary = (parsed.summary as string) ?? "";
      const marketNote = market ? JSON.stringify(market) : (parsed.marketNote as string | undefined);
      const combinedRedFlags = [...redFlags, ...illegal];
      return {
        summary: summary || (combinedRedFlags.length > 0 ? `Found ${redFlags.length} red flags, ${illegal.length} illegal clauses.` : text.slice(0, 500)),
        redFlags: combinedRedFlags,
        recommendations: recs,
        marketNote,
        legalRefs: parsed.legalRefs as string[] | undefined,
      };
    } catch {
      // fall through
    }
  }
  return { summary: text.slice(0, 500), redFlags: [], recommendations: [] };
}

function extractText(decoded: Record<string, unknown>, kind: "nova" | "titan"): string {
  if (kind === "nova") {
    const output = decoded.output as Record<string, unknown> | undefined;
    const message = output?.message as Record<string, unknown> | undefined;
    const content = message?.content as Array<{ text?: string }> | undefined;
    let text = content?.[0]?.text;
    if (typeof text === "string") return text;
    const topContent = decoded.content as Array<{ text?: string }> | undefined;
    text = topContent?.[0]?.text;
    if (typeof text === "string") return text;
  }
  if (kind === "titan") {
    const results = decoded.results as Array<{ outputText?: string }> | undefined;
    const text = results?.[0]?.outputText;
    if (typeof text === "string") return text;
  }
  return "{}";
}

/**
 * Invoke Bedrock Agent (TenantShield-ContractAnalyzer) and return parsed result.
 */
async function invokeAgent(contractText: string, config: ReturnType<typeof getConfig>): Promise<ContractAnalysisResult> {
  const { BedrockAgentRuntimeClient, InvokeAgentCommand } = await import("@aws-sdk/client-bedrock-agent-runtime");
  const client = new BedrockAgentRuntimeClient({ region: config.region });
  const prompt = `Analyze this tenancy agreement and output structured JSON (red_flags[], illegal_clauses[], market_comparison{}, recommendations[]).\n\n---\n${contractText.slice(0, 12000)}`;

  const response = await client.send(
    new InvokeAgentCommand({
      agentId: config.agentId,
      agentAliasId: config.agentAliasId,
      sessionId: `session-${Date.now()}`,
      inputText: prompt,
    })
  );

  let text = "";
  if (response.completion) {
    for await (const event of response.completion) {
      const chunk = event as { chunk?: { bytes?: Uint8Array } };
      if (chunk.chunk?.bytes) {
        text += new TextDecoder("utf-8").decode(chunk.chunk.bytes);
      }
    }
  }
  return parseResultText(text || "{}");
}

/**
 * Analyze contract text via Bedrock (no PII). Uses Agent if configured, else InvokeModel (Nova or Titan).
 */
export async function analyzeContractText(contractText: string): Promise<ContractAnalysisResult> {
  if (!contractText.trim()) {
    return { summary: "No text provided.", redFlags: [], recommendations: [] };
  }

  const config = getConfig();
  if (config.useAgent) {
    try {
      return await invokeAgent(contractText, config);
    } catch (e: unknown) {
      const err = e as { message?: string };
      const msg = err.message ?? String(e);
      console.error("Bedrock Agent invokeAgent:", e);
      return {
        summary: `Agent error: ${msg}`,
        redFlags: [],
        recommendations: [
          "Check BEDROCK_AGENT_ID and BEDROCK_AGENT_ALIAS_ID in .env.local (from AWS Console → Bedrock → Agents → your agent → Alias).",
          "Ensure the agent uses Amazon Nova (e.g. amazon.nova-lite-v1:0). Test in AWS Console first.",
        ],
      };
    }
  }

  const { region, modelId } = config;
  const { BedrockRuntimeClient, InvokeModelCommand } = await import("@aws-sdk/client-bedrock-runtime");
  const client = new BedrockRuntimeClient({ region });
  const prompt = `${CONTRACT_ANALYZER_PROMPT}\n\n---\n${contractText.slice(0, 12000)}`;

  const isTitan = modelId.startsWith("amazon.titan");
  const body =
    isTitan
      ? JSON.stringify({
          inputText: prompt,
          textGenerationConfig: { maxTokenCount: 1024, temperature: 0.3 },
        })
      : JSON.stringify({
          schemaVersion: "messages-v1",
          messages: [{ role: "user", content: [{ text: prompt }] }],
          inferenceConfig: { maxTokens: 1024, temperature: 0.3 },
        });

  try {
    const response = await client.send(
      new InvokeModelCommand({
        modelId,
        contentType: "application/json",
        accept: "application/json",
        body,
      })
    );
    const decoded = JSON.parse(new TextDecoder().decode(response.body)) as Record<string, unknown>;
    const kind = isTitan ? "titan" : "nova";
    const text = extractText(decoded, kind);
    return parseResultText(text || "{}");
  } catch (e: unknown) {
    const err = e as { message?: string };
    const msg = typeof err.message === "string" ? err.message : String(e);
    console.error("Bedrock analyzeContractText:", e);
    return {
      summary: `Bedrock error: ${msg}`,
      redFlags: [],
      recommendations: [
        "Check IAM: user needs bedrock:InvokeModel permission.",
        "In .env.local set BEDROCK_MODEL_ID=amazon.nova-lite-v1:0 (or amazon.nova-micro-v1:0).",
        "Restart dev server after changing .env.local.",
      ],
    };
  }
}
