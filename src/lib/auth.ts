export type AuthUser = {
  id: string;
  email: string;
  name: string;
  university: string;
};

export function saveSession(user: AuthUser) {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(user));
  document.cookie = `ts_user=${value}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function getSession(): AuthUser | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("ts_user="));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split("=")[1])) as AuthUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof document === "undefined") return;
  document.cookie = "ts_user=; path=/; max-age=0";
}
