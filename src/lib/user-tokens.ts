const STORAGE_KEY_PREFIX = "tenantshield_tokens_";
const DEFAULT_TOKENS = 25;

export function getStoredTokenBalance(email: string | undefined): number {
  if (typeof window === "undefined" || !email) return DEFAULT_TOKENS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + email);
    if (raw == null) return DEFAULT_TOKENS;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : DEFAULT_TOKENS;
  } catch {
    return DEFAULT_TOKENS;
  }
}

export function setStoredTokenBalance(email: string | undefined, count: number): void {
  if (typeof window === "undefined" || !email) return;
  try {
    const n = Math.max(0, Math.floor(count));
    localStorage.setItem(STORAGE_KEY_PREFIX + email, String(n));
  } catch {
    // ignore
  }
}

export function addStoredTokens(email: string | undefined, add: number): number {
  const current = getStoredTokenBalance(email);
  const next = current + Math.max(0, Math.floor(add));
  setStoredTokenBalance(email, next);
  return next;
}
