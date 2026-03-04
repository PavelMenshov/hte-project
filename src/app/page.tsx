import HeroSection from "@/app/HeroSection";
import HowItWorksSection from "@/app/HowItWorksSection";
import PortfolioStats from "@/app/PortfolioStats";

export default function Home() {
  return (
    <div className="min-h-screen text-[var(--color-text)]">
      <HeroSection />

      <HowItWorksSection />

      {/* Why not buy one property yourself */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2
            className="section-heading mb-8 text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
          >
            Why not buy one apartment yourself?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="card border-[var(--color-danger)]/20 p-6">
              <h3 className="font-semibold text-[var(--color-danger)]">❌ Traditional</h3>
              <ul className="mt-3 space-y-1 text-sm text-[var(--color-muted)]">
                <li>HKD 5,000,000 minimum entry</li>
                <li>Illiquid — selling takes weeks or months</li>
                <li>Full vacancy &amp; maintenance risk</li>
                <li>Requires local legal entity</li>
                <li>No diversification</li>
              </ul>
            </div>
            <div className="card border-[var(--color-success)]/20 p-6">
              <h3 className="font-semibold text-[var(--color-success)]">✅ TenantShield</h3>
              <ul className="mt-3 space-y-1 text-sm text-[var(--color-muted)]">
                <li>From HKD 1,000 — any amount</li>
                <li>Liquidate in ~15 minutes on secondary market</li>
                <li>AI-diversified portfolio, managed properties</li>
                <li>KYC-compliant, SFC professional investor structure</li>
                <li>Earn 90% of net rental income quarterly</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <PortfolioStats />

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-[var(--color-muted)] sm:px-6">
          TenantShield · Tokenised Real Estate · Hong Kong · Powered by AWS Bedrock &amp; Abelian QDay
        </div>
      </footer>
    </div>
  );
}
