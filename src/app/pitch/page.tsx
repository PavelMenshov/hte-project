"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FileSearch,
  Shield,
  Users,
  Scale,
  Star,
  Home as HomeIcon,
  User,
  Lock,
  Cpu,
} from "lucide-react";

const TOTAL_SLIDES = 8;

const MODULES = [
  { icon: FileSearch, name: "Contract Analyzer", desc: "Spots illegal clauses in 30 seconds", badge: "AWS Bedrock" },
  { icon: Shield, name: "Deposit Escrow", desc: "Your money, protected on-chain", badge: "Abelian" },
  { icon: Users, name: "Collective Rent Pool", desc: "47 students = negotiating power", badge: "Abelian + AWS" },
  { icon: Scale, name: "Legal Fund", desc: "$5/month buys real legal representation", badge: "AWS Bedrock" },
  { icon: Star, name: "Anonymous Reviews", desc: "Rate landlords without fear", badge: "Abelian" },
  { icon: HomeIcon, name: "Sublease Coordinator", desc: "Never pay for an empty room again", badge: "AWS" },
] as const;

const QUOTES = [
  "Signed contract without understanding it",
  "Landlord kept my deposit. I was afraid to complain",
  "Paid $8000 for an empty room all summer",
  "Couldn't afford a lawyer. Lost the dispute.",
] as const;

const BARS = [
  { label: "International students", pct: 78 },
  { label: "Local students", pct: 54 },
  { label: "Young professionals", pct: 61 },
] as const;

const AWARDS = [
  { initials: "AWS", prize: "HKD 10,000", name: "Agentic AI Champion", bullets: ["AWS Bedrock AgentCore powers Contract Analyzer", "Multi-agent: Analyzer + Pool Coordinator"], tag: "ELIGIBLE" as const },
  { initials: "AB", prize: "HKD 15,534", name: "Privacy & AI Award", bullets: ["All deposits and reviews on QDay testnet", "Zero personal data exposed to any party"], tag: "ELIGIBLE" as const },
  { initials: "HK", prize: "HKD 10,000", name: "Innovation Award", bullets: ["Addresses real student pain point", "Clear path to startup beyond hackathon"], tag: "ELIGIBLE" as const },
  { initials: "MA", prize: "HKD 20,000", name: "Champion", bullets: ["Novel AI + blockchain combination", "Real-world impact, working demo"], tag: "TARGETING" as const },
] as const;

export default function PitchPage() {
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const barsRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [barsVisible, setBarsVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const onIntersect = (i: number) => (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting) setCurrentSlide(i + 1);
    };
    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      const observer = new IntersectionObserver(onIntersect(i), { threshold: 0.5 });
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  useEffect(() => {
    const el = barsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setBarsVisible(true);
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (currentSlide < TOTAL_SLIDES) slideRefs.current[currentSlide]?.scrollIntoView({ behavior: "smooth" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (currentSlide > 1) slideRefs.current[currentSlide - 2]?.scrollIntoView({ behavior: "smooth" });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentSlide]);

  return (
    <div className="relative min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Progress bar */}
      <div
        className="fixed left-0 top-0 z-50 h-0.5 bg-[var(--color-primary)] transition-[width] duration-150"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden
      />

      {/* Slide counter */}
      <div
        className="fixed bottom-6 right-6 z-40 font-mono text-sm text-[var(--color-muted)] md:bottom-8 md:right-8"
        style={{ fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace" }}
      >
        {String(currentSlide).padStart(2, "0")} / {String(TOTAL_SLIDES).padStart(2, "0")}
      </div>

      {/* Slide 1 — Title */}
      <section
        ref={(el) => { slideRefs.current[0] = el; }}
        className="pitch-city-grid relative flex min-h-screen flex-col items-center justify-center px-4 py-16 md:px-8"
      >
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-primary)] md:text-sm" style={{ fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace" }}>
          HTE HACKATHON 2026 · HONG KONG
        </p>
        <h1 className="text-center text-5xl font-bold leading-none text-white md:text-7xl lg:text-[96px]" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          TENANT
          <br />
          <span style={{ textShadow: "0 0 40px rgba(0,212,255,0.6)" }}>SHIELD</span>
        </h1>
        <p className="mt-6 text-center text-base text-[var(--color-muted)] md:text-lg" style={{ fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace" }}>
          Collective AI protection for Hong Kong renters
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {["AWS Bedrock", "Abelian Privacy", "HKUST EC"].map((t) => (
            <span key={t} className="rounded-full border border-[var(--color-primary)] px-4 py-1.5 text-sm text-[var(--color-primary)]">
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Slide 2 — Problem */}
      <section
        ref={(el) => { slideRefs.current[1] = el; }}
        className="flex min-h-screen items-center px-4 py-16 md:px-8 lg:grid lg:grid-cols-[1fr_1fr] lg:gap-12"
      >
        <div>
          <h2 className="text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl xl:text-[52px]" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
            Hong Kong.
            <br />
            World&apos;s most
            <br />
            expensive city
            <br />
            to rent.
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3 lg:gap-8">
            <div>
              <p className="text-2xl font-bold text-[var(--color-primary)] md:text-3xl">2 months</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">deposit trapped with landlord</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-primary)] md:text-3xl">$500+</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">lawyer fee for one consultation</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-primary)] md:text-3xl">0 power</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">a student has negotiating alone</p>
            </div>
          </div>
        </div>
        <div className="mt-12 lg:mt-0">
          <div className="card overflow-hidden p-6 font-mono text-[13px] text-[var(--color-success)]" style={{ fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace" }}>
            {QUOTES.map((q) => (
              <div key={q} className="mb-2">
                &gt; &quot;{q}&quot;
              </div>
            ))}
            <span className="terminal-cursor inline-block h-4 w-0.5 bg-[var(--color-success)] align-middle" />
          </div>
        </div>
      </section>

      {/* Slide 3 — Solution */}
      <section
        ref={(el) => { slideRefs.current[2] = el; }}
        className="flex min-h-screen flex-col items-center justify-center px-4 py-16 md:px-8"
      >
        <h2 className="text-center text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          One platform.
          <br />
          Six shields.
        </h2>
        <div className="mt-12 grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.name}
                className="card flex flex-col items-center rounded-xl p-6 text-center transition duration-200 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-[0_0_24px_rgba(0,212,255,0.2)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)]">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>{m.name}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{m.desc}</p>
                <span className="mt-3 rounded bg-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-muted)]">{m.badge}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Slide 4 — Live Demo */}
      <section
        ref={(el) => { slideRefs.current[3] = el; }}
        className="pitch-scan-line relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16 md:px-8"
      >
        <div className="card relative w-full max-w-2xl overflow-hidden p-8 md:p-12">
          <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-primary)]" style={{ fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace" }}>
            LIVE DEMO
          </p>
          <h2 className="mt-6 text-center text-2xl font-bold leading-tight text-white md:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
            Watch the contract
            <br />
            get analyzed
            <br />
            in real time.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/contract" className="btn-primary inline-flex rounded-full px-6 py-3 text-sm">
              → Open Contract Analyzer
            </Link>
            <Link href="/collective" className="inline-flex rounded-full border-2 border-[var(--color-border)] px-6 py-3 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]">
              → Join Rent Pool
            </Link>
          </div>
          <p className="mt-8 text-center text-xs text-[var(--color-muted)]" style={{ fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace" }}>
            No personal data required. All analysis is anonymous.
          </p>
        </div>
      </section>

      {/* Slide 5 — Architecture */}
      <section
        ref={(el) => { slideRefs.current[4] = el; }}
        className="flex min-h-screen flex-col items-center justify-center px-4 py-16 md:px-8"
      >
        <h2 className="text-center text-3xl font-bold text-white md:text-4xl" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          Privacy by design.
        </h2>
        <div className="mt-12 flex w-full max-w-5xl flex-col items-stretch gap-8 lg:flex-row lg:items-center lg:gap-4">
          <div className="card flex-1 rounded-xl p-6 text-center">
            <User className="mx-auto h-10 w-10 text-[var(--color-muted)]" />
            <h3 className="mt-3 font-bold text-white">Student</h3>
            <ul className="mt-3 list-inside list-disc text-left text-sm text-[var(--color-muted)]">
              <li>Uploads contract</li>
              <li>Joins pool</li>
              <li>Pays $5 to fund</li>
            </ul>
          </div>
          <div className="flex flex-col items-center gap-1 lg:flex-row lg:flex-1">
            <div className="h-8 w-px bg-[var(--color-border)] lg:h-px lg:w-12 lg:flex-1" />
            <p className="text-xs text-[var(--color-muted)]">encrypted</p>
            <svg className="h-6 w-12 rotate-90 text-[var(--color-primary)] lg:h-8 lg:w-16 lg:rotate-0" viewBox="0 0 64 32" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path className="pitch-arrow-dash" d="M0 16 L56 16 M48 10 L56 16 L48 22" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="card flex-1 rounded-xl border-[var(--color-secondary)]/40 bg-[var(--color-secondary)]/10 p-6 text-center">
            <Lock className="mx-auto h-10 w-10 text-[var(--color-secondary)]" />
            <h3 className="mt-3 font-bold text-white">Abelian Layer</h3>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              Anonymizes identity
              <br />
              Holds deposits
              <br />
              Verifies without revealing
            </p>
          </div>
          <div className="flex flex-col items-center gap-1 lg:flex-row lg:flex-1">
            <div className="h-8 w-px bg-[var(--color-border)] lg:h-px lg:w-12 lg:flex-1" />
            <p className="text-xs text-[var(--color-muted)]">anonymized data only</p>
            <svg className="h-6 w-12 rotate-90 text-[var(--color-primary)] lg:h-8 lg:w-16 lg:rotate-0" viewBox="0 0 64 32" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path className="pitch-arrow-dash" d="M0 16 L56 16 M48 10 L56 16 L48 22" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="card flex-1 rounded-xl border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 p-6 text-center">
            <Cpu className="mx-auto h-10 w-10 text-[var(--color-primary)]" />
            <h3 className="mt-3 font-bold text-white">AWS Bedrock Agent</h3>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              Analyzes contracts
              <br />
              Matches rent pools
              <br />
              Classifies disputes
            </p>
          </div>
        </div>
        <p className="mt-10 max-w-2xl text-center text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace" }}>
          Landlords never know who you are. Only that you&apos;re protected.
        </p>
      </section>

      {/* Slide 6 — Traction */}
      <section
        ref={(el) => { slideRefs.current[5] = el; }}
        className="flex min-h-screen flex-col items-center justify-center px-4 py-16 md:px-8"
      >
        <h2 className="text-center text-3xl font-bold text-white md:text-4xl" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          The market is massive.
        </h2>
        <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="card p-6 text-center">
            <p className="text-2xl font-bold text-[var(--color-primary)] md:text-3xl">$15B+</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">HK rental market annually</p>
          </div>
          <div className="card p-6 text-center">
            <p className="text-2xl font-bold text-[var(--color-primary)] md:text-3xl">120,000+</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">international students in HK</p>
          </div>
          <div className="card p-6 text-center">
            <p className="text-2xl font-bold text-[var(--color-primary)] md:text-3xl">$5.4T</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">global fractional real estate by 2030</p>
          </div>
        </div>
        <div ref={barsRef} className="mt-14 w-full max-w-2xl">
          <h3 className="mb-4 text-lg font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
            Who suffers most from landlord disputes?
          </h3>
          <div className="space-y-4">
            {BARS.map((b) => (
              <div key={b.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-[var(--color-text)]">{b.label}</span>
                  <span className="text-[var(--color-muted)]">{b.pct}%</span>
                </div>
                <div className="h-6 overflow-hidden rounded bg-[var(--color-border)]">
                  <div
                    className="h-full rounded bg-[var(--color-primary)] transition-[width] duration-1000 ease-out"
                    style={{ width: barsVisible ? `${b.pct}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-[var(--color-muted)]" style={{ fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace" }}>
            Source: HK Tenants Rights Association survey 2024 (mock data for demo)
          </p>
        </div>
      </section>

      {/* Slide 7 — Track coverage */}
      <section
        ref={(el) => { slideRefs.current[6] = el; }}
        className="flex min-h-screen flex-col items-center justify-center px-4 py-16 md:px-8"
      >
        <h2 className="text-center text-3xl font-bold text-white md:text-4xl" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          Built to win.
        </h2>
        <div className="mt-12 grid w-full max-w-4xl gap-6 sm:grid-cols-2">
          {AWARDS.map((a) => (
            <div key={a.name} className="card flex flex-col p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-primary)]/20 font-bold text-[var(--color-primary)]">
                {a.initials}
              </div>
              <p className="text-2xl font-bold text-[var(--color-primary)] md:text-3xl" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>{a.prize}</p>
              <h3 className="mt-1 font-bold text-white">{a.name}</h3>
              <ul className="mt-3 list-inside list-disc text-sm text-[var(--color-muted)]">
                {a.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <span className={`mt-4 inline-block w-fit rounded px-2 py-0.5 text-xs font-semibold ${a.tag === "ELIGIBLE" ? "bg-[var(--color-success)]/20 text-[var(--color-success)]" : "bg-[var(--color-warning)]/20 text-[var(--color-warning)]"}`}>
                {a.tag}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-12 text-2xl font-bold text-[var(--color-primary)] md:text-3xl" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif", textShadow: "0 0 24px rgba(0,212,255,0.4)" }}>
          Total potential: HKD 55,534
        </p>
      </section>

      {/* Slide 8 — Closing */}
      <section
        ref={(el) => { slideRefs.current[7] = el; }}
        className="pitch-city-grid relative flex min-h-screen flex-col items-center justify-center px-4 py-16 md:px-8"
      >
        <h2 className="text-center text-4xl font-bold leading-tight text-white md:text-5xl lg:text-7xl" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          Every student
          <br />
          deserves a
          <br />
          fair lease.
        </h2>
        <a href="https://github.com/PavelMenshov/hte-project" target="_blank" rel="noopener noreferrer" className="mt-8 font-mono text-sm text-[var(--color-primary)] hover:underline" style={{ fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace" }}>
          github.com/PavelMenshov/hte-project
        </a>
        <p className="mt-6 text-center text-xs text-[var(--color-muted)]" style={{ fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace" }}>
          Built in 36 hours at HTE Hackathon · Hong Kong · 2026
        </p>
        <Link href="/" className="btn-primary mt-10 rounded-full px-10 py-4 text-base md:text-lg" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          TRY THE DEMO →
        </Link>
      </section>
    </div>
  );
}
