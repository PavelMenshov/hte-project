"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/properties", label: "Properties" },
  { href: "/invest", label: "Invest" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about", label: "About" },
] as const;

export default function NavHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(typeof window !== "undefined" ? window.scrollY > 60 : false);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const navLinkClass = (href: string) => {
    const isActive = pathname === href || pathname.startsWith(href + "/");
    return `text-xs uppercase tracking-widest transition-colors duration-200 ${
      isActive ? "text-[var(--gold)] border-b border-[var(--gold)] pb-0.5" : "text-[var(--text-2)] hover:text-[var(--gold)]"
    }`;
  };

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--bg-2)]/95 backdrop-blur-md border-b border-[var(--border)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="TenantShield home">
          <span
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded bg-[var(--gold)] text-sm font-bold text-[var(--bg)]"
            style={{ fontFamily: "var(--font-dm-mono), monospace" }}
          >
            TS
          </span>
          <span
            className="font-semibold tracking-widest text-[var(--text)] text-xs uppercase hidden sm:inline"
            style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
          >
            TENANTSHIELD
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={navLinkClass(href)} style={{ fontFamily: "var(--font-dm-mono), monospace" }}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button type="button" className="btn-outline px-5 py-2.5">
            Connect Wallet
          </button>
          <Link href="/invest" className="btn-primary px-6 py-2.5">
            Invest Now
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`block w-6 h-0.5 bg-[var(--text)] transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-6 h-0.5 bg-[var(--text)] transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-6 h-0.5 bg-[var(--text)] transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-2)]/98 backdrop-blur-md py-4 px-4 flex flex-col gap-1 md:hidden">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`py-3 px-3 text-xs uppercase tracking-widest ${navLinkClass(href)}`}
              style={{ fontFamily: "var(--font-dm-mono), monospace" }}
            >
              {label}
            </Link>
          ))}
          <div className="border-t border-[var(--border)] mt-3 pt-3 flex flex-col gap-2">
            <button type="button" className="btn-outline w-full py-3 text-center">
              Connect Wallet
            </button>
            <Link href="/invest" onClick={() => setMenuOpen(false)} className="btn-primary w-full py-3 text-center block">
              Invest Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
