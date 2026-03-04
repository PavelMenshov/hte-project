"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function HeroSection() {
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onScroll = () => {
      el.style.backgroundPositionY = `${window.scrollY * 0.3}px`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={heroRef as React.RefObject<HTMLElement>}
      className="hero-grid relative flex min-h-[100dvh] flex-col justify-center px-4 pb-20 pt-8 sm:px-6"
    >
      <div className="mx-auto max-w-5xl animate-fade-in-down">
        <h1
          className="whitespace-pre-line text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl"
          style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
        >
          Own Hong Kong Real Estate.{"\n"}From HKD 1,000.
        </h1>
        <p
          className="mt-6 max-w-xl animate-fade-in-down-delay-1 text-base text-[var(--color-muted)]"
          style={{ fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace" }}
        >
          AI selects the best HK co-living properties. We acquire them. You earn 90% of rental income — liquid in minutes, not months.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 animate-fade-in-down-delay-2">
          <Link href="/properties" className="btn-primary inline-flex rounded-full px-8 py-4 text-sm">
            Explore Properties
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex rounded-full border-2 border-[var(--color-border)] bg-transparent px-8 py-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            How It Works
          </a>
        </div>
        <div className="mt-8 flex flex-wrap gap-4 animate-fade-in-up-d1">
          <span className="rounded-full border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-[var(--color-primary)]">
            HKD 1,000 minimum
          </span>
          <span className="animate-fade-in-up-d2 rounded-full border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-[var(--color-primary)]">
            ~15 min liquidity
          </span>
          <span className="animate-fade-in-up-d3 rounded-full border border-[var(--color-primary)]/40 bg-[var(--color-primary)]/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-[var(--color-primary)]">
            90% rental yield
          </span>
        </div>
      </div>
    </section>
  );
}
