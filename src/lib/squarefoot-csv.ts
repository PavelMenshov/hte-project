import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { parse } from "csv-parse/sync";
import type { Property } from "@/types/property";

/** CSV columns from scrapers/squarefoot main.py */
type SquarefootRow = {
  url: string;
  district: string;
  subdistrict: string;
  category: string;
  unit_desc: string;
  address: string;
  price_raw: string;
  price_hkd: string;
  price_per_sqft: string;
  size_sqft: string;
  bedrooms: string;
  bathrooms: string;
  posted: string;
  source_page: string;
};

const CANDIDATE_PATHS = [
  path.join(process.cwd(), "data", "squarefoot_listings.csv"),
  path.join(process.cwd(), "scrapers", "squarefoot", "squarefoot_listings.csv"),
];

function findCsvPath(): string | null {
  for (const p of CANDIDATE_PATHS) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      // ignore
    }
  }
  return null;
}

function rowToProperty(row: SquarefootRow, index: number): Property {
  const priceHkd = row.price_hkd ? Number.parseInt(row.price_hkd, 10) : 0;
  const sizeSqft = row.size_sqft ? Number.parseInt(row.size_sqft, 10) : 0;
  const rooms = row.bedrooms ? Number.parseInt(String(row.bedrooms).replaceAll(/\D/g, ""), 10) || 0 : 0;
  const districtLabel = [row.district, row.subdistrict].filter(Boolean).join(" / ") || "Hong Kong";
  const name = row.unit_desc?.trim() || row.address?.trim() || `${districtLabel} #${index + 1}`;

  return {
    id: `market-squarefoot-${index}`,
    name: name.slice(0, 120),
    address: row.address?.trim() || "",
    district: districtLabel,
    type: row.category?.trim() || "residential",
    status: "from_market",
    acquired_date: null,
    acquired_price_hkd: null,
    current_valuation_hkd: Number.isFinite(priceHkd) && priceHkd > 0 ? priceHkd : null,
    rooms: Number.isFinite(rooms) ? rooms : 0,
    size_sqft: Number.isFinite(sizeSqft) ? sizeSqft : 0,
    monthly_rent_hkd: 0,
    gross_yield_pct: 0,
    net_yield_pct: 0,
    ai_score: 0,
    ai_recommendation: "HOLD",
    ai_growth_forecast_pct: 0,
    risk_level: "MEDIUM",
    ai_buy_reasons: [],
    ai_concerns: [],
    ai_rejected_alternatives: [],
    tenants_current: 0,
    tenants_max: Number.isFinite(rooms) ? rooms : 0,
    images: [],
    features: [],
    listing_url: row.url?.trim() || undefined,
  };
}

const SCRAPER_DIR = path.join(process.cwd(), "scrapers", "squarefoot");
const SCRAPER_SCRIPT = path.join(SCRAPER_DIR, "main.py");
const PRIMARY_CSV = path.join(process.cwd(), "data", "squarefoot_listings.csv");
const STALE_HOURS = 6;

function csvIsStale(): boolean {
  try {
    const stat = fs.statSync(PRIMARY_CSV);
    const ageHours = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60);
    return ageHours > STALE_HOURS;
  } catch {
    return true;
  }
}

let scrapeInProgress = false;

/** Run Python scraper with UTF-8 I/O so paths with non-ASCII (e.g. Cyrillic) don't cause UnicodeEncodeError on Windows */
function runScraperInBackground(): void {
  if (scrapeInProgress) return;
  if (!fs.existsSync(SCRAPER_SCRIPT)) return;

  scrapeInProgress = true;
  console.log("[squarefoot] Auto-scraping Squarefoot (a1, max 3 pages)...");

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const args = [SCRAPER_SCRIPT, "--district", "a1", "--max-pages", "3", "--output", PRIMARY_CSV];
  const env = { ...process.env, PYTHONIOENCODING: "utf-8" };

  const tryPython = (cmd: string) => {
    execFile(cmd, args, { timeout: 120_000, cwd: SCRAPER_DIR, env }, (error, stdout, stderr) => {
      if (error && cmd === "python") {
        tryPython("python3");
        return;
      }
      scrapeInProgress = false;
      if (error) {
        console.error("[squarefoot] Scraper failed:", stderr || (error as Error).message);
      } else {
        console.log("[squarefoot] Scraper finished.", String(stdout).trim().slice(-300));
      }
    });
  };

  tryPython("python");
}

function readCsv(): Property[] {
  const csvPath = findCsvPath();
  if (!csvPath) return [];
  try {
    const raw = fs.readFileSync(csvPath, "utf-8");
    const rows = parse(raw, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as unknown as SquarefootRow[];
    if (!Array.isArray(rows) || rows.length === 0) return [];
    return rows.map((row, i) => rowToProperty(row, i));
  } catch {
    return [];
  }
}

export function loadSquarefootFromCsv(): Property[] {
  if (csvIsStale()) {
    runScraperInBackground();
  }
  return readCsv();
}
