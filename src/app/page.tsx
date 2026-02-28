import Link from "next/link";
import {
  FileSearch,
  Shield,
  Users,
  Scale,
  Star,
  Home as HomeIcon,
} from "lucide-react";

const MODULES = [
  {
    id: "contract",
    title: "Contract Analyzer",
    short: "AI checks your lease for illegal clauses (HK law). No PII to the cloud.",
    href: "/contract",
    icon: FileSearch,
  },
  {
    id: "deposit",
    title: "Deposit Pool",
    short: "Escrow on QDay. Landlord sees guarantee, not your identity.",
    href: "/deposit",
    icon: Shield,
  },
  {
    id: "pool",
    title: "Collective Rent Pool",
    short: "Anonymous group requests → 15–25% discount. Powered by AI + Abelian.",
    href: "/collective",
    icon: Users,
  },
  {
    id: "legal",
    title: "Legal Fund",
    short: "HK$5/month into shared fund. Disputes → matched lawyer from fund.",
    href: "/legal",
    icon: Scale,
  },
  {
    id: "reviews",
    title: "Anonymous Reviews",
    short: "Verified tenant reviews. Author anonymized on-chain.",
    href: "/reviews",
    icon: Star,
  },
  {
    id: "sublease",
    title: "Sublease Coordinator",
    short: "Summer away? AI finds temp tenant; payments split on-chain.",
    href: "/sublease",
    icon: HomeIcon,
  },
] as const;

// Stats based on verified HK market data (sources: UGC 2024, HK Rating & Valuation Dept)
const STATS = [
  {
    value: "30,000+",
    label: "Non-local university students in HK",
    note: "UGC 2024/25, quota doubled",
  },
  {
    value: "2 months",
    label: "Deposit trapped with landlord",
    note: "Standard HK tenancy practice",
  },
  {
    value: "$500+",
    label: "Lawyer fee per consultation",
    note: "Inaccessible for most students",
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen text-[var(--color-text)]">
      {/* Hero — full viewport height */}
      <section className="hero-grid relative flex min-h-[100dvh] flex-col justify-center px-4 pb-20 pt-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h1
            className="whitespace-pre-line text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl"
            style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
          >
            Your Rights.{"\n"}Collectively Protected.
          </h1>
          <p
            className="mt-6 max-w-xl text-base text-[var(--color-muted)]"
            style={{ fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace" }}
          >
            AI-powered tenant protection for Hong Kong students
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contract"
              className="btn-primary inline-flex rounded-full px-8 py-4 text-sm"
            >
              Analyze My Contract
            </Link>
            <Link
              href="/collective"
              className="inline-flex rounded-full border-2 border-[var(--color-border)] bg-transparent px-8 py-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Join Rent Pool
            </Link>
          </div>
        </div>
      </section>

      {/* Stats row — verified data */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)]/50 py-12">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-12 px-4 sm:px-6">
          {STATS.map(({ value, label, note }) => (
            <div key={label} className="text-center">
              <div
                className="text-3xl font-bold text-[var(--color-primary)] sm:text-4xl"
                style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
              >
                {value}
              </div>
              <div className="mt-1 text-sm text-[var(--color-text)]">{label}</div>
              <div className="mt-0.5 text-xs text-[var(--color-muted)]">{note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Module cards — 2x3 grid */}
      <section id="modules" className="scroll-mt-8 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2
            className="section-heading mb-10 text-3xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
          >
            Six modules
          </h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m) => {
              const Icon = m.icon;
              return (
                <li key={m.id}>
                  <Link
                    href={m.href}
                    className="card group block p-6 transition-all duration-300 ease-out hover:border-[var(--color-primary)] hover:shadow-[0_0_0_1px_var(--color-primary),0_0_24px_rgba(0,212,255,0.15),0_4px_24px_rgba(0,212,255,0.08)]"
                  >
                    <span className="inline-flex rounded-lg bg-[var(--color-primary)]/10 p-2 text-[var(--color-primary)] transition-colors duration-300 group-hover:bg-[var(--color-primary)]/25">
                      <Icon className="h-6 w-6" strokeWidth={2} />
                    </span>
                    <h3
                      className="mt-4 font-bold text-white"
                      style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
                    >
                      {m.title}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">{m.short}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* The Problem — concrete context for judges */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div
            className="card border-[var(--color-warning)]/20 p-6 sm:p-8"
            style={{ boxShadow: "0 0 0 1px var(--color-border), 0 4px 24px rgba(245,158,11,0.04)" }}
          >
            <h2
              className="section-heading text-xl font-bold text-white"
              style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
            >
              The problem is real
            </h2>
            <p className="mt-3 text-[var(--color-muted)]">
              Hong Kong is the world&apos;s most expensive rental market. Non-local student intake
              doubled in 2024/25, pushing demand to record highs. Landlords hold
              2-month deposits with no neutral escrow. A single legal consultation costs
              HK$500+—more than a week of student living expenses. Tenants who complain risk
              eviction. Those who stay silent lose thousands.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div
            className="card border-[var(--color-primary)]/20 p-6 sm:p-8"
            style={{ boxShadow: "0 0 0 1px var(--color-border), 0 4px 24px rgba(0,212,255,0.06)" }}
          >
            <h2
              className="section-heading text-xl font-bold text-white"
              style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
            >
              Privacy by design
            </h2>
            <p className="mt-3 text-[var(--color-muted)]">
              Personal data never leaves the Abelian layer. AWS Bedrock sees only anonymized
              aggregates or contract text—no names, IDs, or addresses. Landlords see: payment
              guarantee, number of tenants, and rating. Not who you are.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-[var(--color-muted)] sm:px-6">
          TenantShield · Abelian (QDay) + AWS Bedrock · Built for HK tenant protection · Hack The East 2026
        </div>
      </footer>
    </div>
  );
}
