import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen text-[var(--color-text)]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1
          className="section-heading text-4xl font-bold text-white"
          style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
        >
          Why this model?
        </h1>

        <div className="mt-10 space-y-10">
          <section className="card p-6">
            <h2 className="font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
              Why can&apos;t I choose which property to invest in?
            </h2>
            <p className="mt-3 text-[var(--color-muted)]">
              100 anonymous co-owners of one apartment would be an operational and legal dead end: who signs the tenancy agreement? Who decides on repairs? Tenantshield SPV owns the properties as a company; you own a share of the company. This is the standard managed fund structure — like an ETF or REIT.
            </p>
          </section>

          <section className="card p-6">
            <h2 className="font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
              How do I know the company picks good properties?
            </h2>
            <p className="mt-3 text-[var(--color-muted)]">
              Every property is shown publicly with a full AI report on /properties: score, reasons for purchase, rejected alternatives, and yield projections. All deals are dated and transparent; on-chain data is available for verification.
            </p>
          </section>

          <section className="card p-6">
            <h2 className="font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
              Is this legal?
            </h2>
            <p className="mt-3 text-[var(--color-muted)]">
              This is a proof of concept. In production we would use private placement to up to 50 investors (legal in HK without SFC licence). Scaling would be through a structure with a Type 9 licence.
            </p>
          </section>

          <section className="card border-[var(--color-secondary)]/30 p-6">
            <h2 className="font-bold text-[var(--color-secondary)]" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
              Privacy architecture
            </h2>
            <p className="mt-3 text-[var(--color-muted)]">
              Your identity is never revealed. Abelian / QDay provides quantum-resistant transactions and zero-knowledge ownership proof. Tenantshield knows only: how many tokens are on each wallet address. Not who is behind the wallet.
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link href="/properties" className="btn-primary inline-flex rounded-full px-8 py-4 text-sm">
            See the Portfolio →
          </Link>
        </div>
      </div>
    </div>
  );
}
