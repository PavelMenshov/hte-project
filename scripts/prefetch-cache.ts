/**
 * Pre-fetch market data for all districts.
 * Run before hackathon: npx tsx scripts/prefetch-cache.ts
 * Commit data/market-cache/ so demo works even if scraper fails on stage.
 */

import { scrapeAllDistricts } from "../src/lib/scraper";

async function main() {
  console.log("🚀 Pre-fetching market data for all districts...");
  const results = await scrapeAllDistricts();

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`\n✅ Success: ${successful.map((r) => r.district).join(", ") || "none"}`);
  if (failed.length > 0) {
    console.log(`❌ Failed: ${failed.map((r) => `${r.district} (${r.error})`).join(", ")}`);
  }
  console.log("\n📦 Cache saved to data/market-cache/");
  console.log("Commit this folder before the hackathon demo!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
