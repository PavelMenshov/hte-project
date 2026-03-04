import type { Metadata } from "next";
import { Syne, IBM_Plex_Mono } from "next/font/google";
import NavHeader from "@/components/NavHeader";
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
  title: "TenantShield — Own Hong Kong Real Estate From HKD 1,000",
  description: "AI selects the best HK co-living properties. We acquire them. You earn 90% of rental income — liquid in minutes. KYC-compliant, SFC professional investor structure. Abelian QDay & AWS Bedrock.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a0e1a",
};

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
        <NavHeader />
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
      </body>
    </html>
  );
}
