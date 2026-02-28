import Link from "next/link";

export default function InvestCTABlock() {
  return (
    <div className="card border-[var(--color-primary)]/20 p-6 sm:p-8">
      <h3
        className="font-bold text-white"
        style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
      >
        💡 How to invest in this property
      </h3>
      <p className="mt-3 text-sm text-[var(--color-muted)]">
        This property is owned by Tenantshield SPV. You can&apos;t buy a share of just this flat — 100 anonymous
        co-owners can&apos;t sign leases or manage repairs. It breaks legally.
      </p>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Tenantshield owns it. You own Tenantshield. Buy tokens → earn from the full portfolio, including this property.
      </p>
      <Link
        href="/invest"
        className="btn-primary mt-6 inline-flex rounded-full px-6 py-3 text-sm"
      >
        Buy Tenantshield Tokens →
      </Link>
    </div>
  );
}
