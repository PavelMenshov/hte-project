"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/contract", label: "Contract" },
  { href: "/deposit", label: "Deposit" },
  { href: "/collective", label: "Collective" },
  { href: "/legal", label: "Legal Fund" },
  { href: "/reviews", label: "Reviews" },
  { href: "/sublease", label: "Sublease" },
  { href: "/pitch", label: "Pitch" },
] as const;

export default function NavHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="font-bold tracking-tight text-[var(--color-primary)]"
          style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
        >
          TENANT//SHIELD
        </Link>
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
            >
              {label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span
            className={`block w-6 h-0.5 bg-[var(--color-text)] transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 bg-[var(--color-text)] transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 bg-[var(--color-text)] transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </div>
      {menuOpen && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-md py-4 px-4 flex flex-col gap-2">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block py-2 px-3 rounded-lg text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
