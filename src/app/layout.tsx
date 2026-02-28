"use client";

import { useState, useRef, useEffect } from "react";
import { Syne, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const NAV_LINKS = [
  { href: "/contract", label: "Contract" },
  { href: "/deposit", label: "Deposit" },
  { href: "/collective", label: "Collective" },
  { href: "/legal", label: "Legal Fund" },
  { href: "/reviews", label: "Reviews" },
  { href: "/sublease", label: "Sublease" },
  { href: "/pitch", label: "Pitch" },
] as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    <html lang="en" className="scroll-smooth">
      <head>
        <title>TenantShield — Collective tenant protection in Hong Kong</title>
        <meta name="description" content="Privacy-first platform for students: contract analysis, escrow deposits, collective rent pool on Abelian/QDay + AWS Bedrock AI." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0a0e1a" />
      </head>
      <body className={`${syne.variable} ${ibmPlexMono.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only left-4 top-4 z-[100] rounded bg-[var(--color-primary)] px-4 py-2 font-semibold text-[var(--color-bg)] focus:not-sr-only focus:fixed focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-primary)]"
        >
          Skip to main content
        </a>
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
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
      </body>
    </html>
  );
}
