/**
 * AWS Bedrock integration for TenantShield.
 * Supports: Amazon Nova (default, no EOL), Claude (Anthropic), Titan (legacy format).
 */

function getConfig() {
  return {
    region: process.env.AWS_REGION ?? "us-east-1",
    // Default: Amazon Nova Lite (current, not EOL). In HK with VPN: anthropic.claude-sonnet-4-5-20250929-v1:0
    modelId: (process.env.BEDROCK_MODEL_ID ?? "amazon.nova-lite-v1:0").trim(),
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
      return JSON.parse(jsonMatch[0]) as ContractAnalysisResult;
    } catch {
      // fall through
    }
  }
  return { summary: text.slice(0, 500), redFlags: [], recommendations: [] };
}

function extractText(decoded: Record<string, unknown>, kind: "nova" | "titan" | "claude"): string {
  if (kind === "nova") {
    const output = decoded.output as Record<string, unknown> | undefined;
    const message = output?.message as Record<string, unknown> | undefined;
    const content = message?.content as Array<{ text?: string }> | undefined;
    let text = content?.[0]?.text;
    if (typeof text === "string") return text;
    // Some Nova responses may use top-level content
    const topContent = decoded.content as Array<{ text?: string }> | undefined;
    text = topContent?.[0]?.text;
    if (typeof text === "string") return text;
  }
  if (kind === "titan") {
    const results = decoded.results as Array<{ outputText?: string }> | undefined;
    const text = results?.[0]?.outputText;
    if (typeof text === "string") return text;
  }
  // Claude
  const content = decoded.content as Array<{ text?: string }> | undefined;
  const text = content?.[0]?.text;
  if (typeof text === "string") return text;
  return "{}";
}

/**
 * Analyze contract text via Bedrock (no PII). Uses Nova, Claude, or Titan depending on BEDROCK_MODEL_ID.
 */
export async function analyzeContractText(contractText: string): Promise<ContractAnalysisResult> {
  if (!contractText.trim()) {
    return { summary: "No text provided.", redFlags: [], recommendations: [] };
  }

  const { region, modelId } = getConfig();
  const { BedrockRuntimeClient, InvokeModelCommand } = await import("@aws-sdk/client-bedrock-runtime");
  const client = new BedrockRuntimeClient({ region });
  const prompt = `${CONTRACT_ANALYZER_PROMPT}\n\n---\n${contractText.slice(0, 12000)}`;

  const isNova = modelId.startsWith("amazon.nova");
  const isTitan = modelId.startsWith("amazon.titan");
  let body: string;

  if (isNova) {
    body = JSON.stringify({
      schemaVersion: "messages-v1",
      messages: [{ role: "user", content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens: 1024, temperature: 0.3 },
    });
  } else if (isTitan) {
    body = JSON.stringify({
      inputText: prompt,
      textGenerationConfig: { maxTokenCount: 1024, temperature: 0.3 },
    });
  } else {
    body = JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1024,
      messages: [{ role: "user", content: [{ type: "text" as const, text: prompt }] }],
    });
  }

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
    const kind = isNova ? "nova" : isTitan ? "titan" : "claude";
    const text = extractText(decoded, kind);
    return parseResultText(text || "{}");
  } catch (e: unknown) {
    const err = e as { name?: string; message?: string };
    const msg = typeof err.message === "string" ? err.message : String(e);
    console.error("Bedrock analyzeContractText:", e);

    const isCountryRestriction =
      err.name === "ValidationException" &&
      typeof err.message === "string" &&
      (err.message.includes("unsupported countries") || err.message.includes("not allowed from"));

    if (isCountryRestriction) {
      return {
        summary: "Claude is not available in your region without VPN. Use Amazon Nova (no region block).",
        redFlags: [],
        recommendations: [
          "In .env.local set: BEDROCK_MODEL_ID=amazon.nova-lite-v1:0",
          "Restart the dev server (npm run dev).",
        ],
      };
    }

    return {
      summary: `Bedrock error: ${msg}`,
      redFlags: [],
      recommendations: [
        "Check IAM: user needs bedrock:InvokeModel permission.",
        "Use Amazon Nova (current, not EOL): BEDROCK_MODEL_ID=amazon.nova-lite-v1:0 in .env.local.",
        "Or: amazon.nova-micro-v1:0 (smaller). In HK with VPN: anthropic.claude-sonnet-4-5-20250929-v1:0.",
        "Restart dev server after changing .env.local.",
      ],
    };
  }
}
