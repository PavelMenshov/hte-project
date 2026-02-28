import Link from "next/link";

export default function PoolPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="font-bold text-[#2563eb] hover:underline">← TenantShield</Link>
          <Link href="/pitch" className="text-sm font-medium text-slate-600 hover:text-[#2563eb]">Pitch</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-900">Collective Rent Pool</h1>
        <p className="mt-2 text-slate-600">Anonymous preferences (district, budget, move-in date) are aggregated by AI. Landlords get one consolidated offer; you get 15–25% discount. Coming in next iteration.</p>
        <p className="mt-6 rounded-xl border border-[#2563eb]/20 bg-[#2563eb]/5 p-4 text-sm text-slate-700">For demo: use Contract Analyzer and Deposit Pool to show AI + QDay integration.</p>
      </main>
    </div>
  );
}
