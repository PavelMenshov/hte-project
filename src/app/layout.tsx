import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "TenantShield — Collective tenant protection in Hong Kong",
  description: "Privacy-first platform for students: contract analysis, escrow deposits, collective rent pool on Abelian/QDay + AWS Bedrock AI.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0e1a",
};

const NAV_LINKS = [
  { href: "/contract", label: "Contract" },
  { href: "/deposit", label: "Deposit" },
  { href: "/collective", label: "Collective" },
  { href: "/legal", label: "Legal Fund" },
  { href: "/pitch", label: "Pitch" },
] as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${syne.variable} ${ibmPlexMono.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only left-4 top-4 z-[100] rounded bg-[var(--color-primary)] px-4 py-2 font-semibold text-[var(--color-bg)] focus:not-sr-only focus:fixed focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-primary)]"
        >
          Skip to main content
        </a>
        <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <Link
              href="/"
              className="font-bold tracking-tight text-[var(--color-primary)]"
              style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
            >
              TENANT//SHIELD
            </Link>
            <nav className="flex items-center gap-6" aria-label="Main navigation">
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
          </div>
        </header>
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
      </body>
    </html>
  );
}
