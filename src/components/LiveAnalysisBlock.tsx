"use client";

import { useState } from "react";

type Props = { propertyId: string };

export default function LiveAnalysisBlock({ propertyId }: Props) {
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
      if (!res.ok) throw new Error("Analysis failed");
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
