/**
 * Persist AI analysis overrides (score, recommendation, etc.) per property
 * so they survive navigation and page refresh.
 */

const STORAGE_KEY = "ts_ai_overrides";

export type StoredAnalysis = {
  ai_score: number;
  ai_recommendation?: "BUY" | "HOLD" | "REJECT";
  ai_growth_forecast_pct?: number;
  risk_level?: "LOW" | "MEDIUM" | "HIGH";
};

function getRaw(): Record<string, StoredAnalysis> {
  if (typeof globalThis.window === "undefined") return {};
  try {
    const raw = globalThis.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed && typeof parsed === "object") return parsed as Record<string, StoredAnalysis>;
  } catch {
    // ignore
  }
  return {};
}

export function getStoredOverride(propertyId: string): StoredAnalysis | null {
  const data = getRaw()[propertyId];
  return data && typeof data.ai_score === "number" ? data : null;
}

export function setStoredOverride(propertyId: string, data: StoredAnalysis): void {
  if (typeof globalThis.window === "undefined") return;
  try {
    const all = getRaw();
    all[propertyId] = {
      ai_score: data.ai_score,
      ai_recommendation: data.ai_recommendation,
      ai_growth_forecast_pct: data.ai_growth_forecast_pct,
      risk_level: data.risk_level,
    };
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}
