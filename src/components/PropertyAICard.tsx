"use client";

import { useState, useCallback, useEffect } from "react";
import type { Property, AIRecommendation } from "@/types/property";
import AIScoreBadge from "@/components/AIScoreBadge";
import LiveAnalysisBlock, { type ParsedAnalysis } from "@/components/LiveAnalysisBlock";
import { getStoredOverride, setStoredOverride } from "@/lib/ai-overrides";

function recommendationColor(rec: AIRecommendation): string {
  if (rec === "BUY") return "var(--color-success)";
  if (rec === "HOLD") return "var(--color-warning)";
  return "var(--color-danger)";
}

type Props = Readonly<{ property: Property }>;

export default function PropertyAICard({ property }: Props) {
  const [override, setOverride] = useState<Partial<ParsedAnalysis> | null>(() => getStoredOverride(property.id));

  useEffect(() => {
    queueMicrotask(() => {
      const stored = getStoredOverride(property.id);
      if (stored) setOverride(stored);
    });
  }, [property.id]);

  const score = override?.ai_score ?? property.ai_score;
  const recommendation: AIRecommendation = override?.ai_recommendation ?? property.ai_recommendation;
  const growthPct = override?.ai_growth_forecast_pct ?? property.ai_growth_forecast_pct;
  const riskLevel = override?.risk_level ?? property.risk_level;

  const handleAnalysisComplete = useCallback(
    (parsed: ParsedAnalysis) => {
      setStoredOverride(property.id, {
        ai_score: parsed.ai_score,
        ai_recommendation: parsed.ai_recommendation,
        ai_growth_forecast_pct: parsed.ai_growth_forecast_pct,
        risk_level: parsed.risk_level,
      });
      setOverride({
        ai_score: parsed.ai_score,
        ai_recommendation: parsed.ai_recommendation,
        ai_growth_forecast_pct: parsed.ai_growth_forecast_pct,
        risk_level: parsed.risk_level,
      });
    },
    [property.id]
  );

  return (
    <>
      <div className="card p-6">
        <h3
          className="font-bold text-white"
          style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
        >
          🤖 AI Acquisition Analysis
        </h3>
        <p className="mt-1 text-xs text-[var(--color-muted)]">Powered by AWS Bedrock AgentCore</p>
        <div className="mt-4 flex items-center gap-4">
          <span className={`text-lg font-bold ${recommendationColor(recommendation)}`}>
            RECOMMENDATION: {recommendation}
          </span>
          <AIScoreBadge score={score} />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded bg-[var(--color-bg)]/50 px-3 py-2 text-sm">
            <span className="text-[var(--color-muted)]">Yield</span>
            <span className="ml-2 font-mono text-[var(--color-primary)]">{property.net_yield_pct.toFixed(1)}%/yr</span>
          </div>
          <div className="rounded bg-[var(--color-bg)]/50 px-3 py-2 text-sm">
            <span className="text-[var(--color-muted)]">Growth</span>
            <span className="ml-2 font-mono">+{(growthPct ?? 0).toFixed(1)}%/yr</span>
          </div>
          <div className="rounded bg-[var(--color-bg)]/50 px-3 py-2 text-sm">
            <span className="text-[var(--color-muted)]">Risk</span>
            <span className="ml-2 font-mono">{riskLevel ?? "MEDIUM"}</span>
          </div>
        </div>
        {property.ai_buy_reasons.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-[var(--color-success)]">Why AI recommended {recommendation}:</h4>
            <ul className="mt-2 space-y-1 text-sm text-[var(--color-text)]">
              {property.ai_buy_reasons.map((r, i) => (
                <li key={i}>✅ {r}</li>
              ))}
            </ul>
          </div>
        )}
        {property.ai_concerns.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-semibold text-[var(--color-warning)]">Concerns:</h4>
            <ul className="mt-2 space-y-1 text-sm text-[var(--color-muted)]">
              {property.ai_concerns.map((c, i) => (
                <li key={i}>⚠️ {c}</li>
              ))}
            </ul>
          </div>
        )}
        {property.ai_rejected_alternatives.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-semibold text-[var(--color-muted)]">Properties AI rejected (same period):</h4>
            <ul className="mt-2 space-y-1 text-sm text-[var(--color-muted)]">
              {property.ai_rejected_alternatives.map((a, i) => (
                <li key={i}>❌ {a.description} — {a.reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <LiveAnalysisBlock propertyId={property.id} onAnalysisComplete={handleAnalysisComplete} />
    </>
  );
}
