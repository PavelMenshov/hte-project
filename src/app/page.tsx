import Link from "next/link";
import portfolioData from "@/data/portfolio.json";

const portfolio = portfolioData as {
  total_aum_hkd: number;
  properties_count: number;
  avg_ai_score: number;
  total_investors: number;
  avg_portfolio_yield_pct: number;
};

export default function Home() {
  const formatHKD = (n: number) =>
    new Intl.NumberFormat("en-HK", { style: "decimal", maximumFractionDigits: 0 }).format(n) + " HKD";

  return (
    <div className="min-h-screen text-[var(--color-text)]">
      {/* Hero */}
      <section className="hero-grid relative flex min-h-[100dvh] flex-col justify-center px-4 pb-20 pt-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h1
            className="whitespace-pre-line text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl"
            style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
          >
            Own Hong Kong Real Estate.{"\n"}From HKD 1,000.
          </h1>
          <p
            className="mt-6 max-w-xl text-base text-[var(--color-muted)]"
            style={{ fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace" }}
          >
            AI finds the best properties. We buy them. You earn.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/properties" className="btn-primary inline-flex rounded-full px-8 py-4 text-sm">
              Explore Properties
            </Link>
            <Link
              href="/invest"
              className="inline-flex rounded-full border-2 border-[var(--color-border)] bg-transparent px-8 py-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Buy Tokens
            </Link>
          </div>
        </div>
      </section>

      {/* How it works — 3 steps */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)]/50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2
            className="section-heading mb-12 text-3xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
          >
            How it works
          </h2>
          <ol className="grid gap-10 md:grid-cols-3">
            <li className="card p-6">
              <span className="text-2xl font-bold text-[var(--color-primary)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>1</span>
              <h3 className="mt-3 font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>AI SCANS THE MARKET</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                AWS Bedrock agents analyze HK properties and score each one for yield, growth potential, and co-living fit.
              </p>
            </li>
            <li className="card p-6">
              <span className="text-2xl font-bold text-[var(--color-primary)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>2</span>
              <h3 className="mt-3 font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>WE BUY THE BEST</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Tenantshield acquires AI-selected properties as co-living spaces for students.
              </p>
            </li>
            <li className="card p-6">
              <span className="text-2xl font-bold text-[var(--color-primary)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>3</span>
              <h3 className="mt-3 font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>YOU EARN</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Buy Tenantshield tokens from HKD 1,000. Get 90% of net income. Token grows with portfolio NAV.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Why not buy one property yourself */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2
            className="section-heading mb-8 text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
          >
            Why not buy one apartment yourself?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="card border-[var(--color-danger)]/20 p-6">
              <h3 className="font-semibold text-[var(--color-danger)]">❌ Traditional</h3>
              <ul className="mt-3 space-y-1 text-sm text-[var(--color-muted)]">
                <li>Buying one apartment: HKD 5,000,000 minimum</li>
                <li>Co-owning with 100 people: Who signs the lease?</li>
                <li>Managing tenants: Your problem</li>
                <li>Vacancy risk: 100% on you</li>
              </ul>
            </div>
            <div className="card border-[var(--color-success)]/20 p-6">
              <h3 className="font-semibold text-[var(--color-success)]">✅ Tenantshield</h3>
              <ul className="mt-3 space-y-1 text-sm text-[var(--color-muted)]">
                <li>Tenantshield tokens: From HKD 1,000</li>
                <li>Portfolio diversification: AI-selected properties</li>
                <li>Passive income: 90% of rental revenue</li>
                <li>Quantum-private: Abelian chain, zero-knowledge</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Live portfolio stats */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)]/50 py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2
            className="section-heading mb-8 text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
          >
            Live portfolio
          </h2>
          <div className="flex flex-wrap justify-center gap-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--color-primary)] sm:text-3xl" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
                {formatHKD(portfolio.total_aum_hkd)}
              </div>
              <div className="mt-1 text-sm text-[var(--color-text)]">Portfolio value</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--color-primary)] sm:text-3xl" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
                {portfolio.properties_count}
              </div>
              <div className="mt-1 text-sm text-[var(--color-text)]">Properties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--color-primary)] sm:text-3xl" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
                {portfolio.avg_ai_score.toFixed(1)}/10
              </div>
              <div className="mt-1 text-sm text-[var(--color-text)]">Avg AI score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--color-primary)] sm:text-3xl" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
                {portfolio.total_investors}
              </div>
              <div className="mt-1 text-sm text-[var(--color-text)]">Investors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--color-primary)] sm:text-3xl" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
                {portfolio.avg_portfolio_yield_pct.toFixed(1)}%
              </div>
              <div className="mt-1 text-sm text-[var(--color-text)]">Avg annual yield</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-[var(--color-muted)] sm:px-6">
          Tenantshield · AWS Bedrock + Abelian QDay · Hack The East 2026
        </div>
      </footer>
    </div>
  );
}
