"use client";

import Link from "next/link";

export default function HeroSection() {
  function scrollToHow() {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section className="hero-grid relative flex min-h-[100dvh] flex-col justify-center px-4 pb-20 pt-8 sm:px-6">
      {/* Subtle radial gradient blob — top-right, gold tint */}
      <div
        className="pointer-events-none fixed top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-5xl w-full">
        <span className="badge badge-gold animate-slide-right inline-block">
          🏙 Hong Kong · Professional Investors Only
        </span>

        <h1
          className="mt-6 text-6xl font-normal leading-[1.0] tracking-tight sm:text-7xl md:text-8xl"
          style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
        >
          <span className="animate-fade-in-down block text-[var(--text)]">Own Hong Kong</span>
          <span className="animate-fade-in-down block text-[var(--gold)] italic">Real Estate.</span>
          <span className="animate-fade-in-down block text-[var(--text)]">From HKD 1,000.</span>
        </h1>

        <p
          className="mt-6 max-w-lg text-sm leading-relaxed text-[var(--text-2)] animate-fade-in-down-delay-1"
          style={{ fontFamily: "var(--font-dm-mono), monospace" }}
        >
          AI selects the best HK properties. We acquire them via SPV. You earn 90% of net rental income — liquid quarterly, not locked for decades.
        </p>

        <div className="mt-10 flex flex-wrap gap-4 animate-fade-in-down-delay-2">
          <Link href="/properties" className="btn-primary inline-flex px-8 py-4">
            Explore Properties
          </Link>
          <button type="button" onClick={scrollToHow} className="btn-outline px-8 py-4">
            How It Works
          </button>
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-8 text-xs uppercase tracking-widest animate-fade-up-d3" style={{ fontFamily: "var(--font-dm-mono), monospace" }}>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            <span className="text-[var(--text-2)]">Min</span>
            <span className="font-semibold text-[var(--gold)]">HKD 1,000</span>
          </div>
          <div className="h-4 w-px bg-[var(--border)] hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            <span className="text-[var(--text-2)]">Rental yield</span>
            <span className="font-semibold text-[var(--gold)]">90%</span>
          </div>
          <div className="h-4 w-px bg-[var(--border)] hidden sm:block" />
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            <span className="text-[var(--text-2)]">Liquidity</span>
            <span className="font-semibold text-[var(--gold)]">Quarterly</span>
          </div>
        </div>

        <div className="mt-12 flex justify-center animate-fade-up-d4">
          <a
            href="#how-it-works"
            onClick={(e) => {
              e.preventDefault();
              scrollToHow();
            }}
            className="inline-flex flex-col items-center gap-1 text-[var(--gold)] transition hover:opacity-80"
            aria-label="Scroll to How it works"
          >
            <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-dm-mono), monospace" }}>
              Scroll
            </span>
            <svg className="h-6 w-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
