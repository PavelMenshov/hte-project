"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, FileUp } from "lucide-react";
import type { ContractAnalysisResult } from "@/lib/bedrock";

const SAMPLE_TEXT = `TENANCY AGREEMENT
This agreement is made between Landlord and Tenant.
1. Rent: HK$15,000 per month, payable in advance. Late payment: 20% penalty.
2. Deposit: 2 months rent (HK$30,000), non-refundable if Tenant terminates early.
3. Tenant shall not sublet. Landlord may enter premises at any time with 24h notice.
4. Tenant waives all claims against Landlord for any damage or injury.
5. This agreement is governed by the laws of Hong Kong.`;

function getRiskLevel(count: number): "LOW" | "MEDIUM" | "HIGH" {
  if (count === 0) return "LOW";
  if (count <= 2) return "MEDIUM";
  return "HIGH";
}

function getRiskBarWidth(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 50;
  return 100;
}

function getRiskColor(level: "LOW" | "MEDIUM" | "HIGH"): string {
  switch (level) {
    case "LOW":
      return "var(--color-success)";
    case "MEDIUM":
      return "var(--color-warning)";
    case "HIGH":
      return "var(--color-danger)";
  }
}

export default function ContractPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContractAnalysisResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setApiError(null);
    try {
      const res = await fetch("/api/analyze-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || "Analysis failed");
        setResult({
          summary: "Request failed. Check the error message below.",
          redFlags: [],
          recommendations: ["Ensure .env.local has AWS credentials and BEDROCK_MODEL_ID=amazon.titan-text-express-v1"],
        });
        return;
      }
      setResult(data);
    } catch {
      setApiError("Network error");
      setResult({
        summary: "Could not reach the analyzer. Check your connection and that the dev server is running.",
        redFlags: [],
        recommendations: [],
      });
    } finally {
      setLoading(false);
    }
  }

  const riskLevel = result ? getRiskLevel(result.redFlags.length) : null;
  const riskBarWidth = result ? getRiskBarWidth(result.redFlags.length) : 0;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1
          className="section-heading text-3xl font-bold text-white"
          style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
        >
          Contract Analyzer
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Paste your tenancy agreement text. Only contract clauses are sent to AI—no names or IDs. Analysis uses Hong Kong tenant law.
        </p>

        {/* Upload / paste zone — dashed cyan, dark bg, centered icon + text */}
        <div
          className="mt-8 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-primary)] bg-[var(--color-surface)] py-12 transition hover:border-[var(--color-primary)]/80"
          style={{ minHeight: "200px" }}
        >
          <FileUp className="mb-3 h-12 w-12 text-[var(--color-primary)]" strokeWidth={1.5} />
          <p className="mb-2 text-sm font-medium text-[var(--color-text)]">Paste contract text below or use sample</p>
          <button
            type="button"
            onClick={() => setText(SAMPLE_TEXT)}
            className="text-sm text-[var(--color-primary)] underline hover:no-underline"
          >
            Use sample contract (demo)
          </button>
        </div>

        <textarea
          className="mt-4 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 font-mono text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          rows={12}
          placeholder="Paste contract text here (or use sample above)..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
          className="btn-primary mt-4 rounded-full px-6 py-3 text-sm disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>

        {apiError && (
          <p className="mt-4 text-sm font-medium text-[var(--color-warning)]">Note: {apiError}</p>
        )}

        {result && (
          <div className="mt-10 space-y-6">
            {/* Threat level bar */}
            <div className="card p-6">
              <h2 className="mb-3 text-lg font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
                Contract Risk Score: {riskLevel}
              </h2>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${riskBarWidth}%`,
                    backgroundColor: riskLevel ? getRiskColor(riskLevel) : "transparent",
                  }}
                />
              </div>
            </div>

            <div className="card space-y-6 p-6">
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
                Report
              </h2>
              <p className="text-[var(--color-muted)]">{result.summary}</p>

              {result.redFlags.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-bold text-[var(--color-danger)]">
                    <AlertCircle className="h-5 w-5" />
                    Red flags
                  </h3>
                  <ul className="space-y-2">
                    {result.redFlags.map((f) => (
                      <li
                        key={f.slice(0, 80)}
                        className="flex gap-3 rounded-r-lg border-l-4 border-[var(--color-danger)] bg-[var(--color-danger)]/5 py-2 pl-3 pr-2"
                      >
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-danger)]" />
                        <span className="text-sm text-[var(--color-text)]">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-bold text-[var(--color-success)]">
                    <CheckCircle2 className="h-5 w-5" />
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((r) => (
                      <li
                        key={r.slice(0, 80)}
                        className="flex gap-3 rounded-r-lg border-l-4 border-[var(--color-success)] bg-[var(--color-success)]/5 py-2 pl-3 pr-2"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                        <span className="text-sm text-[var(--color-text)]">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.marketNote && (
                <p className="text-sm text-[var(--color-muted)]">{result.marketNote}</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
