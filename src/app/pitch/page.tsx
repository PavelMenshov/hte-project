"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const TOTAL_SLIDES = 8;

export default function PitchPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    function onScroll() {
      const container = containerRef.current;
      if (!container) return;
      const top = container.scrollTop;
      const h = container.clientHeight;
      const slide = Math.min(TOTAL_SLIDES, Math.floor(top / h) + 1);
      setCurrentSlide(slide);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-[var(--color-bg)]"
    >
      {/* Slide 1: Title */}
      <section className="flex min-h-screen snap-start flex-col justify-center px-6 py-16 pitch-city-grid">
        <h1
          className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl"
          style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
        >
          Tenantshield: AI-Powered Real Estate for Everyone
        </h1>
        <p className="mt-6 max-w-xl text-lg text-[var(--color-muted)]">
          Own Hong Kong real estate from HKD 1,000. AI finds the best properties. We buy them. You earn.
        </p>
      </section>

      {/* Slide 2: Problem */}
      <section className="flex min-h-screen snap-start flex-col justify-center px-6 py-16">
        <h2 className="section-heading text-3xl font-bold text-white sm:text-4xl" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          The problem
        </h2>
        <ul className="mt-8 space-y-4 text-xl text-[var(--color-text)]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
          <li><span className="text-[var(--color-primary)]">HKD 5,000,000</span> — average 50 sqm flat in HK</li>
          <li><span className="text-[var(--color-primary)]">14 years</span> — of median income to buy (UBS Bubble Index)</li>
          <li><span className="text-[var(--color-primary)]">2–4%</span> — bank deposit yield in HK</li>
          <li><span className="text-[var(--color-primary)]">30,000+</span> — non-local students in housing crisis</li>
        </ul>
      </section>

      {/* Slide 3: Solution */}
      <section className="flex min-h-screen snap-start flex-col justify-center px-6 py-16">
        <h2 className="section-heading text-3xl font-bold text-white sm:text-4xl" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          Solution — 3 steps
        </h2>
        <ol className="mt-8 space-y-6 text-lg text-[var(--color-text)]">
          <li className="flex gap-4">
            <span className="text-2xl font-bold text-[var(--color-primary)]">1</span>
            <span>AI scans the market (AWS Bedrock). We score every property.</span>
          </li>
          <li className="flex gap-4">
            <span className="text-2xl font-bold text-[var(--color-primary)]">2</span>
            <span>Tenantshield SPV buys the best ones as co-living for students.</span>
          </li>
          <li className="flex gap-4">
            <span className="text-2xl font-bold text-[var(--color-primary)]">3</span>
            <span>You buy tokens from HKD 1,000. You earn 90% of rental income.</span>
          </li>
        </ol>
      </section>

      {/* Slide 4: Why this model */}
      <section className="flex min-h-screen snap-start flex-col justify-center px-6 py-16">
        <h2 className="section-heading text-3xl font-bold text-white sm:text-4xl" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          Why this model?
        </h2>
        <p className="mt-6 max-w-2xl text-[var(--color-muted)]">
          ​100 anonymous co-owners of one apartment can&apos;t sign leases or manage repairs — it breaks legally. Tenantshield SPV owns the properties; you own the company. Standard fund structure: like an ETF or REIT.
        </p>
      </section>

      {/* Slide 5: Architecture */}
      <section className="flex min-h-screen snap-start flex-col justify-center px-6 py-16">
        <h2 className="section-heading text-3xl font-bold text-white sm:text-4xl" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          Architecture
        </h2>
        <div className="mt-8 space-y-4 font-mono text-sm text-[var(--color-muted)]">
          <p><span className="text-[var(--color-secondary)]">Privacy layer</span> — Abelian / QDay · zero-knowledge ownership</p>
          <p><span className="text-[var(--color-secondary)]">AI layer</span> — AWS Bedrock AgentCore · Property Analyzer + Portfolio Advisor</p>
          <p><span className="text-[var(--color-secondary)]">SPV layer</span> — Tenantshield owns assets; tokens = share of company</p>
        </div>
      </section>

      {/* Slide 6: Live demo */}
      <section className="flex min-h-screen snap-start flex-col justify-center px-6 py-16">
        <h2 className="section-heading text-3xl font-bold text-white sm:text-4xl" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          Live demo
        </h2>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/properties"
            className="btn-primary rounded-full px-8 py-4 text-sm"
          >
            View portfolio →
          </Link>
          <Link
            href="/invest"
            className="rounded-full border-2 border-[var(--color-border)] bg-transparent px-8 py-4 text-sm font-semibold text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Invest (demo) →
          </Link>
        </div>
      </section>

      {/* Slide 7: Track coverage */}
      <section className="flex min-h-screen snap-start flex-col justify-center px-6 py-16">
        <h2 className="section-heading text-3xl font-bold text-white sm:text-4xl" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          Track coverage
        </h2>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="pb-2">Track</th>
                <th className="pb-2">Prize (HKD)</th>
                <th className="pb-2">How we qualify</th>
              </tr>
            </thead>
            <tbody className="text-[var(--color-text)]">
              <tr className="border-b border-[var(--color-border)]/50">
                <td className="py-2">Abelian Foundation Privacy & AI</td>
                <td className="py-2 font-mono">15,534</td>
                <td className="py-2">QDay for anonymous token purchases, ZK ownership</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]/50">
                <td className="py-2">AWS Agentic AI Champion</td>
                <td className="py-2 font-mono">10,000</td>
                <td className="py-2">Property Analyzer + Portfolio Advisor (Bedrock AgentCore)</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]/50">
                <td className="py-2">HKUST EC Innovation</td>
                <td className="py-2 font-mono">10,000</td>
                <td className="py-2">Student pain, startup potential, scale to SG/London</td>
              </tr>
              <tr className="border-b border-[var(--color-border)]/50">
                <td className="py-2">Main Awards Champion</td>
                <td className="py-2 font-mono">20,000</td>
                <td className="py-2">AI + blockchain + impact + working demo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Slide 8: Market + CTA */}
      <section className="flex min-h-screen snap-start flex-col justify-center px-6 py-16">
        <h2 className="section-heading text-3xl font-bold text-white sm:text-4xl" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          Market & next steps
        </h2>
        <p className="mt-6 text-[var(--color-muted)]">
          Global residential real estate ~$15.5T by 2030. We start in HK, then Singapore and London. Tenantshield — from HKD 1,000 you own a piece of the best AI-selected co-living portfolio.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/" className="btn-primary rounded-full px-8 py-4 text-sm">
            Tenantshield →
          </Link>
          <Link href="/invest" className="rounded-full border border-[var(--color-border)] px-8 py-4 text-sm text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
            Buy tokens
          </Link>
        </div>
      </section>

      {/* Slide indicator */}
      <div className="fixed bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {Array.from({ length: TOTAL_SLIDES }, (_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full transition-all ${
              currentSlide === i + 1 ? "w-6 bg-[var(--color-primary)]" : "bg-[var(--color-border)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
