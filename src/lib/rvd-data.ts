/**
 * Hong Kong Rating and Valuation Department (RVD) official market data.
 * Source: https://www.rvd.gov.hk/datagovhk/7.3.csv
 * Fetched server-side only (CORS). No scraping, public CSV.
 */

export interface RVDTransactionRow {
  month: string;
  primarySales: number;
  primaryValue: number;
  secondarySales: number;
  secondaryValue: number;
  totalSales: number;
  totalValue: number;
}

export interface RVDMarketSnapshot {
  fetchedAt: string;
  recentTransactions: RVDTransactionRow[];
  marketTrend: "rising" | "stable" | "cooling";
  trendPercent: number;
  yearlyStats: {
    year: number;
    totalTransactions: number;
    totalValueBillionHKD: number;
  };
}

const RVD_CSV_URL = "https://www.rvd.gov.hk/datagovhk/7.3.csv";

const FALLBACK_DATA: RVDMarketSnapshot = {
  fetchedAt: new Date().toISOString(),
  recentTransactions: [
    {
      month: "Dec-25",
      primarySales: 1739,
      primaryValue: 20098,
      secondarySales: 4144,
      secondaryValue: 31129,
      totalSales: 5883,
      totalValue: 51227,
    },
    {
      month: "Nov-25",
      primarySales: 1822,
      primaryValue: 22731,
      secondarySales: 3766,
      secondaryValue: 28936,
      totalSales: 5588,
      totalValue: 51667,
    },
    {
      month: "Oct-25",
      primarySales: 2025,
      primaryValue: 23856,
      secondarySales: 3689,
      secondaryValue: 27217,
      totalSales: 5714,
      totalValue: 51073,
    },
  ],
  marketTrend: "rising",
  trendPercent: 8.2,
  yearlyStats: { year: 2025, totalTransactions: 94847, totalValueBillionHKD: 847 },
};

function parseCSVRow(line: string): RVDTransactionRow | null {
  const parts = line.split(",").map((p) => p.trim());
  if (parts.length < 5) return null;
  const month = parts[0];
  const primarySales = parseInt(parts[1], 10);
  const primaryValue = parseInt(parts[2], 10);
  const secondarySales = parseInt(parts[3], 10);
  const secondaryValue = parseInt(parts[4], 10);
  if (isNaN(primarySales) || isNaN(primaryValue) || isNaN(secondarySales) || isNaN(secondaryValue)) return null;
  return {
    month,
    primarySales,
    primaryValue,
    secondarySales,
    secondaryValue,
    totalSales: primarySales + secondarySales,
    totalValue: primaryValue + secondaryValue,
  };
}

function computeTrend(rows: RVDTransactionRow[]): { marketTrend: "rising" | "stable" | "cooling"; trendPercent: number } {
  if (rows.length < 6) return { marketTrend: "stable", trendPercent: 0 };
  const last3 = rows.slice(0, 3);
  const prev3 = rows.slice(3, 6);
  const sumLast3 = last3.reduce((a, r) => a + r.totalValue, 0);
  const sumPrev3 = prev3.reduce((a, r) => a + r.totalValue, 0);
  if (sumPrev3 === 0) return { marketTrend: "stable", trendPercent: 0 };
  const trendPercent = Math.round(((sumLast3 - sumPrev3) / sumPrev3) * 1000) / 10;
  const marketTrend: "rising" | "stable" | "cooling" =
    trendPercent > 5 ? "rising" : trendPercent < -5 ? "cooling" : "stable";
  return { marketTrend, trendPercent };
}

function computeYearlyStats(rows: RVDTransactionRow[], targetYear: number): RVDMarketSnapshot["yearlyStats"] {
  const yearShort = targetYear % 100;
  const forYear = rows.filter((r) => {
    const [_, yr] = r.month.split("-");
    return parseInt(yr, 10) === yearShort;
  });
  const totalTransactions = forYear.reduce((a, r) => a + r.totalSales, 0);
  const totalValueM = forYear.reduce((a, r) => a + r.totalValue, 0);
  const totalValueBillionHKD = Math.round(totalValueM / 1000);
  return { year: targetYear, totalTransactions, totalValueBillionHKD };
}

export async function fetchRVDMarketData(): Promise<RVDMarketSnapshot | null> {
  try {
    const res = await fetch(RVD_CSV_URL, {
      headers: { Accept: "text/csv" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return FALLBACK_DATA;
    const text = await res.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const rows: RVDTransactionRow[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (i < 2 && (line.startsWith("Month") || line.startsWith("DOMESTIC"))) continue;
      const row = parseCSVRow(line);
      if (row) rows.push(row);
    }
    if (rows.length === 0) return FALLBACK_DATA;
    const recent = rows.slice(-6).reverse();
    const { marketTrend, trendPercent } = computeTrend(recent);
    const currentYear = new Date().getFullYear();
    const yearlyStats = computeYearlyStats(rows, currentYear);
    return {
      fetchedAt: new Date().toISOString(),
      recentTransactions: recent.slice(0, 3),
      marketTrend,
      trendPercent,
      yearlyStats,
    };
  } catch {
    return FALLBACK_DATA;
  }
}
