import Link from "next/link";

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="font-bold text-[#2563eb] hover:underline">
            ← TenantShield
          </Link>
          <nav className="flex gap-4 text-sm font-medium">
            <Link href="/contract" className="text-slate-600 hover:text-[#2563eb]">Demo: Contract</Link>
            <Link href="/deposit" className="text-slate-600 hover:text-[#2563eb]">Demo: Deposit</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="text-4xl font-bold text-slate-900">TenantShield — Pitch summary</h1>
        <p className="mt-2 text-slate-600">For judges &amp; hackathon presentation</p>

        <section className="mt-10 space-y-6">
          <h2 className="text-xl font-bold text-[#2563eb]">Problem</h2>
          <p className="text-slate-700">
            Hong Kong is the world&apos;s most expensive rental market. International students (CIS, mainland China, Southeast Asia) sign leases in Cantonese/English without understanding terms, face illegal clauses, lose deposits (often 2 months = HK$16k–30k), and cannot afford legal help (HK$500+ per consultation). Alone, they have no leverage; together, they do.
          </p>
        </section>

        <section className="mt-10 space-y-6">
          <h2 className="text-xl font-bold text-[#2563eb]">Solution</h2>
          <p className="text-slate-700">
            TenantShield combines <strong>Abelian (QDay)</strong> for privacy-preserving, quantum-resistant on-chain actions (escrow, legal fund, reviews) with <strong>AWS Bedrock</strong> AI for contract analysis and collective pool coordination. Personal data never leaves the Abelian layer; AWS sees only anonymized aggregates or contract text.
          </p>
        </section>

        <section className="mt-10 space-y-6">
          <h2 className="text-xl font-bold text-[#2563eb]">Architecture (one slide)</h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 font-mono text-sm text-slate-700 shadow-sm">
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
          <h2 className="text-xl font-bold text-[#2563eb]">Demo flow (2–3 min)</h2>
          <ol className="list-inside list-decimal space-y-2 text-slate-700">
            <li>Landing: show six modules and &quot;Privacy by design&quot;.</li>
            <li>Contract Analyzer: paste sample contract → Analyze → show red flags and recommendations (AI without identity).</li>
            <li>Deposit: Add QDay &amp; Connect → Simulate deposit → show &quot;View on QDay Explorer&quot; (Abelian integration).</li>
            <li>Optional: if contracts deployed, do a real deposit or Legal Fund contribute.</li>
          </ol>
        </section>

        <section className="mt-10 space-y-6">
          <h2 className="text-xl font-bold text-[#2563eb]">Tracks we cover</h2>
          <ul className="space-y-2 text-slate-700">
            <li><strong>AWS Agentic AI:</strong> Bedrock for contract analysis (and collective pool in roadmap).</li>
            <li><strong>Abelian Privacy &amp; AI:</strong> QDay for escrow, legal fund, anonymous reviews; AI on anonymized data only.</li>
            <li><strong>HKUST Innovation:</strong> Real student pain in HK → scalable product.</li>
            <li><strong>Main Awards:</strong> Novelty, AI/ML, impact, technical execution.</li>
          </ul>
        </section>

        <section className="mt-10 flex flex-wrap gap-4">
          <Link href="/contract" className="rounded-full bg-[#2563eb] px-6 py-3 font-semibold text-white hover:bg-[#1d4ed8]">
            Try Contract Analyzer
          </Link>
          <Link href="/deposit" className="rounded-full border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 hover:border-[#2563eb] hover:text-[#2563eb]">
            Try Deposit (QDay)
          </Link>
        </section>
      </main>
    </div>
  );
}
