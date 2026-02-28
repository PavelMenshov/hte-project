import Link from "next/link";

const MODULES = [
  { id: "contract", title: "Contract Analyzer", short: "AI checks your lease for illegal clauses (HK law). No PII to the cloud.", href: "/contract", icon: "📄" },
  { id: "deposit", title: "Deposit Pool", short: "Escrow on QDay. Landlord sees guarantee, not your identity.", href: "/deposit", icon: "🔒" },
  { id: "pool", title: "Collective Rent Pool", short: "Anonymous group requests → 15–25% discount. Powered by AI + Abelian.", href: "/pool", icon: "👥" },
  { id: "legal", title: "Legal Fund", short: "HK$5/month into shared fund. Disputes → matched lawyer from fund.", href: "/legal", icon: "⚖️" },
  { id: "reviews", title: "Anonymous Reviews", short: "Verified tenant reviews. Author anonymized on-chain.", href: "/reviews", icon: "⭐" },
  { id: "sublease", title: "Sublease Coordinator", short: "Summer away? AI finds temp tenant; payments split on-chain.", href: "/sublease", icon: "🔄" },
] as const;

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-slate-900">
            <span className="text-2xl" aria-hidden>🛡️</span>
            <span className="text-xl">TenantShield</span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link href="/#modules" className="text-sm font-medium text-slate-600 hover:text-[#2563eb]">
              Modules
            </Link>
            <Link href="/pitch" className="text-sm font-medium text-slate-600 hover:text-[#2563eb]">
              Pitch
            </Link>
            <Link
              href="/contract"
              className="rounded-full bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
            >
              Try demo
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <section className="py-20 sm:py-28 md:py-36">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#2563eb]">
            Collective tenant protection · Hong Kong
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Your data stays yours.{" "}
            <span className="text-[#2563eb]">AI helps without knowing who you are.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-600">
            Students get contract checks, escrow deposits, and group bargaining power—on
            Abelian&apos;s quantum-resistant chain. Landlords see guarantees and ratings, not identities.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contract"
              className="inline-flex rounded-full bg-[#2563eb] px-6 py-3.5 font-semibold text-white transition hover:bg-[#1d4ed8]"
            >
              Analyze a contract
            </Link>
            <Link
              href="/deposit"
              className="inline-flex rounded-full border-2 border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-800 transition hover:border-[#2563eb] hover:text-[#2563eb]"
            >
              Deposit escrow (QDay)
            </Link>
          </div>
        </section>

        <section id="modules" className="scroll-mt-8 py-12">
          <h2 className="mb-8 text-3xl font-bold text-slate-900">Six modules</h2>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m) => (
              <li key={m.id}>
                <Link
                  href={m.href}
                  className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#2563eb]/40 hover:shadow-md"
                >
                  <span className="text-3xl" aria-hidden>{m.icon}</span>
                  <h3 className="mt-4 font-bold text-slate-900">{m.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{m.short}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 rounded-2xl border border-[#2563eb]/20 bg-[#2563eb]/5 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900">Privacy by design</h2>
          <p className="mt-3 text-slate-700">
            Personal data never leaves the Abelian layer. AWS Bedrock sees only anonymized
            aggregates or contract text—no names, IDs, or addresses. Landlords see: payment
            guarantee, number of tenants, and rating. Not who you are.
          </p>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-slate-500 sm:px-6">
          TenantShield · Abelian (QDay) + AWS Bedrock · Built for HK tenant protection · Hack The East 2026
        </div>
      </footer>
    </div>
  );
}
