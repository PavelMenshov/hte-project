import Link from "next/link";

export default function SubleasePage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="font-bold text-[#2563eb] hover:underline">← TenantShield</Link>
          <Link href="/pitch" className="text-sm font-medium text-slate-600 hover:text-[#2563eb]">Pitch</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-900">Sublease Coordinator</h1>
        <p className="mt-2 text-slate-600">Going away for summer? List your room; AI matches a short-term tenant. Smart contract splits rent between you, landlord, and subtenant—no empty room, no lost lease.</p>
        <p className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">Matching logic + payment split contract: next phase.</p>
      </main>
    </div>
  );
}
