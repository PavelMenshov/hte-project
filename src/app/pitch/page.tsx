import Link from "next/link";

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="section-heading text-4xl font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          TenantShield — Pitch summary
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">For judges &amp; hackathon presentation</p>

        <section className="mt-10 space-y-6">
          <h2 className="section-heading text-xl font-bold text-[var(--color-primary)]" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>Problem</h2>
          <p className="text-[var(--color-muted)]">
            Hong Kong is the world&apos;s most expensive rental market. International students (CIS, mainland China, Southeast Asia) sign leases in Cantonese/English without understanding terms, face illegal clauses, lose deposits (often 2 months = HK$16k–30k), and cannot afford legal help (HK$500+ per consultation). Alone, they have no leverage; together, they do.
          </p>
        </section>

        <section className="mt-10 space-y-6">
          <h2 className="section-heading text-xl font-bold text-[var(--color-primary)]" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>Solution</h2>
          <p className="text-[var(--color-muted)]">
            TenantShield combines <strong>Abelian (QDay)</strong> for privacy-preserving, quantum-resistant on-chain actions (escrow, legal fund, reviews) with <strong>AWS Bedrock</strong> AI for contract analysis and collective pool coordination. Personal data never leaves the Abelian layer; AWS sees only anonymized aggregates or contract text.
          </p>
        </section>

        <section className="mt-10 space-y-6">
          <h2 className="section-heading text-xl font-bold text-[var(--color-primary)]" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>Architecture (one slide)</h2>
          <div className="card p-6 font-mono text-sm text-[var(--color-muted)]">
            <pre className="whitespace-pre-wrap">
{`[Tenant] → Abelian/QDay (wallet, escrow, anonymous ID)
    ↓
  Only: contract text*, hashes, aggregates (no PII)
    ↓
[AWS Bedrock] → Contract analysis, pool coordination
    ↓
[Result] → Report, recommendations, matches
* No names, IDs, or addresses sent to AI`}
            </pre>
          </div>
        </section>

        <section className="mt-10 space-y-6">
          <h2 className="section-heading text-xl font-bold text-[var(--color-primary)]" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>Demo flow (2–3 min)</h2>
          <ol className="list-inside list-decimal space-y-2 text-[var(--color-muted)]">
            <li>Landing: show six modules and &quot;Privacy by design&quot;.</li>
            <li>Contract Analyzer: paste sample contract → Analyze → show red flags and recommendations (AI without identity).</li>
            <li>Deposit: Add QDay &amp; Connect → Simulate deposit → show &quot;View on QDay Explorer&quot; (Abelian integration).</li>
            <li>Optional: if contracts deployed, do a real deposit or Legal Fund contribute.</li>
          </ol>
        </section>

        <section className="mt-10 space-y-6">
          <h2 className="section-heading text-xl font-bold text-[var(--color-primary)]" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>Tracks we cover</h2>
          <ul className="space-y-2 text-[var(--color-muted)]">
            <li><strong>AWS Agentic AI:</strong> Bedrock for contract analysis (and collective pool in roadmap).</li>
            <li><strong>Abelian Privacy &amp; AI:</strong> QDay for escrow, legal fund, anonymous reviews; AI on anonymized data only.</li>
            <li><strong>HKUST Innovation:</strong> Real student pain in HK → scalable product.</li>
            <li><strong>Main Awards:</strong> Novelty, AI/ML, impact, technical execution.</li>
          </ul>
        </section>

        <section className="mt-10 flex flex-wrap gap-4">
          <Link href="/contract" className="btn-primary rounded-full px-6 py-3 text-sm">
            Try Contract Analyzer
          </Link>
          <Link href="/deposit" className="rounded-full border-2 border-[var(--color-border)] bg-transparent px-6 py-3 text-sm font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
            Try Deposit (QDay)
          </Link>
        </section>
      </main>
    </div>
  );
}
