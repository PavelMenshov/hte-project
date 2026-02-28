"use client";

import { useState } from "react";

export type ParsedAnalysis = {
  ai_score: number;
  ai_recommendation: "BUY" | "HOLD" | "REJECT";
  ai_growth_forecast_pct?: number;
  risk_level?: "LOW" | "MEDIUM" | "HIGH";
};

function parseAnalysisText(text: string): Partial<ParsedAnalysis> | null {
  const out: Partial<ParsedAnalysis> = {};
  const scoreMatch = text.match(/AI SCORE[^\d]*([\d.]+)/i) || text.match(/([\d.]+)\s*\/\s*10\b/);
  if (scoreMatch) out.ai_score = Math.min(10, Math.max(0, Number.parseFloat(scoreMatch[1]) || 0));
  const recMatch = text.match(/RECOMMENDATION:\s*(BUY|HOLD|REJECT)/i);
  if (recMatch) out.ai_recommendation = recMatch[1].toUpperCase() as "BUY" | "HOLD" | "REJECT";
  const growthMatch = text.match(/GROWTH FORECAST[^\d]*([\d.]+)\s*%?/i) || text.match(/([\d.]+)\s*%\s*annual/);
  if (growthMatch) out.ai_growth_forecast_pct = Number.parseFloat(growthMatch[1]) || 0;
  const riskMatch = text.match(/risk[:\s]+(LOW|MEDIUM|HIGH)/i);
  if (riskMatch) out.risk_level = riskMatch[1].toUpperCase() as "LOW" | "MEDIUM" | "HIGH";
  if (out.ai_score !== undefined || out.ai_recommendation) return out;
  return null;
}

type Props = Readonly<{
  propertyId: string;
  onAnalysisComplete?: (parsed: ParsedAnalysis) => void;
}>;

export default function LiveAnalysisBlock({ propertyId, onAnalysisComplete }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    setText("");
    try {
      const res = await fetch("/api/analyze-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: propertyId }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg = typeof errBody?.error === "string" ? errBody.error : "Analysis failed";
        throw new Error(msg);
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream");
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setText(acc);
      }
      const parsed = parseAnalysisText(acc);
      if (parsed && onAnalysisComplete) {
        onAnalysisComplete({
          ai_score: parsed.ai_score ?? 0,
          ai_recommendation: parsed.ai_recommendation ?? "HOLD",
          ai_growth_forecast_pct: parsed.ai_growth_forecast_pct,
          risk_level: parsed.risk_level,
        });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card border-[var(--color-secondary)]/30 p-4">
      <div className="flex items-center justify-between gap-4">
        <h4 className="font-semibold text-[var(--color-secondary)]" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          Live AI re-analysis
        </h4>
        <button
          type="button"
          onClick={runAnalysis}
          disabled={loading}
          className="rounded-full bg-[var(--color-primary)]/20 px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/30 disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Re-analyze live"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-[var(--color-danger)]">{error}</p>}
      {text && (
        <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded bg-[var(--color-bg)]/50 p-3 text-sm text-[var(--color-text)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
          {text}
        </pre>
      )}
    </div>
  );
}
