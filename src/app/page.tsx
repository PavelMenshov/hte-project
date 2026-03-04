import HeroSection from "@/app/HeroSection";
import HowItWorksSection from "@/app/HowItWorksSection";
import PortfolioStats from "@/app/PortfolioStats";

export default function Home() {
  return (
    <div className="min-h-screen text-[var(--text)]">
      <HeroSection />

      <HowItWorksSection />

      {/* Why not buy one apartment yourself */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2
            className="section-heading mb-8 text-2xl font-bold text-[var(--text)]"
            style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
          >
            Why not just buy one apartment?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="card border-[var(--danger)]/30 p-6">
              <h3 className="font-semibold text-[var(--danger)]">❌  Traditional</h3>
              <ul className="mt-3 space-y-1 text-sm text-[var(--text-2)]">
                <li>HKD 5,000,000+ minimum entry</li>
                <li>Exit takes weeks or months</li>
                <li>Full vacancy &amp; maintenance risk</li>
                <li>Requires local legal entity</li>
                <li>Zero portfolio diversification</li>
              </ul>
            </div>
            <div className="card border-[var(--gold)]/30 p-6">
              <h3 className="font-semibold text-[var(--gold)]">✅  TenantShield</h3>
              <ul className="mt-3 space-y-1 text-sm text-[var(--text-2)]">
                <li>From HKD 1,000 — any amount</li>
                <li>Internal secondary market + quarterly redemption</li>
                <li>AI-diversified, professionally managed</li>
                <li>KYC-compliant, SFC-structured for Professional Investors</li>
                <li>Earn 90% of net rental income quarterly</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <PortfolioStats />

      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-[var(--text-2)] sm:px-6">
          TenantShield · Tokenised Real Estate · Hong Kong<br />
          Powered by AWS Bedrock &amp; Abelian QDay  ·  For Professional Investors Only
        </div>
      </footer>
    </div>
  );
}
