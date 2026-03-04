import type { Metadata } from "next";
import { DM_Serif_Display, DM_Mono } from "next/font/google";
import NavHeader from "@/components/NavHeader";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "TenantShield — Tokenised Real Estate · Hong Kong",
  description: "Professional investors own fractional HK real estate from HKD 1,000. AI-selected properties. 90% rental income. Quarterly liquidity. Powered by AWS Bedrock & Abelian QDay.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#08090d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${dmSerif.variable} ${dmMono.variable} antialiased`}>
        <a
          href="#main-content"
          className="sr-only left-4 top-4 z-[100] rounded bg-[var(--gold)] px-4 py-2 font-semibold text-[var(--bg)] focus:not-sr-only focus:fixed focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--gold)]"
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
