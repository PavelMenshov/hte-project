import cron from "node-cron";
import { scrapeAllDistricts } from "./index";

/**
 * Запуск cron: обновление кэша каждые 6 часов.
 * Вызови startScraperScheduler() при старте сервера (например из instrumentation.ts).
 */
export function startScraperScheduler(): void {
  cron.schedule("0 */6 * * *", async () => {
    console.log("[Scraper] Scheduled run: scraping all districts...");
    try {
      const results = await scrapeAllDistricts();
      const ok = results.filter((r) => r.success).length;
      console.log(`[Scraper] Done: ${ok}/${results.length} districts updated`);
    } catch (e) {
      console.error("[Scraper] Scheduled run failed:", e);
    }
  });
  console.log("[Scraper] Scheduler started (every 6 hours)");
}
