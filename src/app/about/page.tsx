import Link from "next/link";
import RevealSection from "@/components/RevealSection";

export default function AboutPage() {
  return (
    <div className="min-h-screen text-[var(--text)]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1
          className="section-heading text-4xl font-bold text-[var(--text)]"
          style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
        >
          Why this model?
        </h1>

        <div className="mt-10 space-y-10">
          <RevealSection>
            <section className="card p-6">
              <h2 className="font-bold text-[var(--text)]" style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}>
                Why can&apos;t I choose which property to invest in?
              </h2>
              <p className="mt-3 text-[var(--text-2)]">
                100 anonymous co-owners of one apartment would be an operational and legal dead end: who signs the tenancy agreement? Who decides on repairs? TenantShield SPV owns the properties as a company; you own a share of the company. This is the standard managed fund structure — like an ETF or REIT.
              </p>
            </section>
          </RevealSection>

          <RevealSection>
            <section className="card p-6">
              <h2 className="font-bold text-[var(--text)]" style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}>
                How do I know the company picks good properties?
              </h2>
              <p className="mt-3 text-[var(--text-2)]">
                Every property is shown publicly with a full AI report on /properties: score, reasons for purchase, rejected alternatives, and yield projections. All deals are dated and transparent; on-chain data is available for verification.
              </p>
            </section>
          </RevealSection>

          <RevealSection>
            <section className="card p-6">
              <h2 className="font-bold text-[var(--text)]" style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}>
                Is this legal?
              </h2>
              <p className="mt-3 text-[var(--text-2)]">
                TenantShield operates within Hong Kong&apos;s SFC regulatory framework. Our tokens are structured as security tokens under the Securities and Futures Ordinance (Cap. 571). We partner with licensed intermediaries for compliant distribution to Professional Investors only.
              </p>
            </section>
          </RevealSection>

          <RevealSection>
            <section className="card border-[var(--gold)]/30 p-6">
              <h2 className="font-bold text-[var(--gold)]" style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}>
                Regulatory Framework
              </h2>
              <p className="mt-3 text-[var(--text-2)] leading-relaxed">
                TenantShield operates within Hong Kong&apos;s SFC regulatory framework. Our tokens are structured as security tokens under the Securities and Futures Ordinance (Cap. 571). We are pursuing SFC Type 1 licensing and partner with licensed intermediaries for compliant distribution to Professional Investors only.
              </p>
              <p className="mt-3 text-[var(--text-2)] leading-relaxed">
                Precedent: Delin Holdings received SFC approval for HK&apos;s first tokenised real estate product in February 2026, validating the regulatory pathway we follow.
              </p>
            </section>
          </RevealSection>
        </div>

        <div className="mt-12 text-center">
          <Link href="/properties" className="btn-primary inline-flex px-8 py-4">
            See the Portfolio →
          </Link>
        </div>
      </div>
    </div>
  );
}
