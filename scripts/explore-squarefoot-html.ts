/**
 * One-off: inspect one property card DOM on squarefoot /buy.
 * Use page.content() and regex to avoid evaluate() in broken page context.
 */
import { chromium } from "playwright";

async function main() {
  const b = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await b.newPage();
  await page.goto("https://www.squarefoot.com.hk/buy?district=mong-kok&sort=price_asc", {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  const html = await page.content();
  await b.close();

  const hasProperty = html.includes("property");
  const hasPrice = html.includes("price") || html.includes("Price");
  const propertyUrlMatches = html.match(/href="[^"]*\/property\/[^"]*"/g);
  const priceNumMatches = html.match(/>\s*\$?\s*[\d,]{6,}\s*</g);
  console.log("Contains 'property':", hasProperty);
  console.log("Contains 'price':", hasPrice);
  console.log("Links to /property/:", propertyUrlMatches?.length ?? 0);
  if (propertyUrlMatches?.length) console.log("Sample:", propertyUrlMatches[0]);
  console.log("Price-like numbers (6+ digits):", priceNumMatches?.length ?? 0);
  if (priceNumMatches?.length) console.log("Samples:", priceNumMatches.slice(0, 5));

  // Try to find listing table or grid
  const tableMatch = html.match(/<table[^>]*>[\s\S]{500,5000}?<\/table>/);
  const gridMatch = html.match(/class="[^"]*ui[^"]*grid[^"]*"[\s\S]{300,3000}?property/);
  console.log("\nTable with content:", !!tableMatch);
  console.log("Grid + property:", !!gridMatch);
  if (gridMatch) console.log("Grid snippet:", gridMatch[0].slice(0, 800));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
