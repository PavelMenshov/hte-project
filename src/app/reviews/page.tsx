export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="section-heading text-3xl font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          Anonymous Landlord Reviews
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">After you leave, submit a review. Abelian verifies you actually rented (via Deposit Pool) without revealing your identity. Aggregated ratings help the next tenant.</p>
        <p className="card mt-6 p-4 text-sm text-[var(--color-muted)]">Review registry contract: next phase.</p>
      </main>
    </div>
  );
}
