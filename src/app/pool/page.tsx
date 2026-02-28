import Link from "next/link";

export default function PoolPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="section-heading text-3xl font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          Collective Rent Pool
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Anonymous preferences (district, budget, move-in date) are aggregated by AI. Landlords get one consolidated offer; you get 15–25% discount. Coming in next iteration.
        </p>
        <Link href="/collective" className="btn-primary mt-6 inline-block rounded-full px-6 py-3 text-sm">
          Try pool simulator
        </Link>
        <p className="card mt-4 p-4 text-sm text-[var(--color-muted)]">
          For demo: use Contract Analyzer and Deposit Pool to show AI + QDay integration.
        </p>
      </main>
    </div>
  );
}
