"use client";

import { useState } from "react";
import Link from "next/link";
import type { ContractAnalysisResult } from "@/lib/bedrock";

const SAMPLE_TEXT = `TENANCY AGREEMENT
This agreement is made between Landlord and Tenant.
1. Rent: HK$15,000 per month, payable in advance. Late payment: 20% penalty.
2. Deposit: 2 months rent (HK$30,000), non-refundable if Tenant terminates early.
3. Tenant shall not sublet. Landlord may enter premises at any time with 24h notice.
4. Tenant waives all claims against Landlord for any damage or injury.
5. This agreement is governed by the laws of Hong Kong.`;

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

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="font-bold text-[#2563eb] hover:underline">
            ← TenantShield
          </Link>
          <Link href="/pitch" className="text-sm font-medium text-slate-600 hover:text-[#2563eb]">
            Pitch
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-900">Contract Analyzer</h1>
        <p className="mt-2 text-slate-600">
          Paste your tenancy agreement text. Only contract clauses are sent to AI—no names or IDs. Analysis uses Hong Kong tenant law.
        </p>

        <button
          type="button"
          onClick={() => setText(SAMPLE_TEXT)}
          className="mt-5 rounded-full border-2 border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-[#2563eb] hover:text-[#2563eb]"
        >
          Use sample contract (demo)
        </button>

        <textarea
          className="mt-4 w-full rounded-xl border border-slate-200 bg-white p-4 font-mono text-sm text-slate-800 shadow-sm placeholder:text-slate-400 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
          rows={12}
          placeholder="Paste contract text here (or use sample above)..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading || !text.trim()}
          className="mt-4 rounded-full bg-[#2563eb] px-6 py-3 font-semibold text-white disabled:opacity-50 hover:bg-[#1d4ed8]"
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>

        {apiError && <p className="mt-4 text-sm font-medium text-amber-700">Note: {apiError}</p>}

        {result && (
          <div className="mt-10 space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Report</h2>
            <p className="text-slate-700">{result.summary}</p>
            {result.redFlags.length > 0 && (
              <div>
                <h3 className="font-bold text-red-600">Red flags</h3>
                <ul className="mt-2 list-inside list-disc text-slate-600">
                  {result.redFlags.map((f) => (
                    <li key={f.slice(0, 80)}>{f}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.recommendations.length > 0 && (
              <div>
                <h3 className="font-bold text-[#2563eb]">Recommendations</h3>
                <ul className="mt-2 list-inside list-disc text-slate-600">
                  {result.recommendations.map((r) => (
                    <li key={r.slice(0, 80)}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {result.marketNote && <p className="text-sm text-slate-500">{result.marketNote}</p>}
          </div>
        )}
      </main>
    </div>
  );
}
