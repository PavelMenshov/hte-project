export default function SubleasePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="section-heading text-3xl font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          Sublease Coordinator
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">Going away for summer? List your room; AI matches a short-term tenant. Smart contract splits rent between you, landlord, and subtenant—no empty room, no lost lease.</p>
        <p className="card mt-6 p-4 text-sm text-[var(--color-muted)]">Matching logic + payment split contract: next phase.</p>
      </main>
    </div>
  );
}
