"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { saveSession } from "@/lib/auth";

const inputClassName =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition";
const labelClassName = "block text-sm font-medium text-[var(--color-text)] mb-1";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const allowedFrom = ["/invest", "/rental", "/dashboard"];
  const redirectTo = from && allowedFrom.includes(from) ? from : "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      if (data.success && data.user) {
        saveSession(data.user);
        router.push(redirectTo);
      } else {
        setError("Invalid response");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-block text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition"
        >
          ← Back to home
        </Link>
        <div className="card p-8">
          <h1
            className="section-heading text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
          >
            Sign in
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-ibm-plex-mono), ui-monospace, monospace" }}>
            Access your TenantShield account
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="login-email" className={labelClassName}>
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="login-password" className={labelClassName}>
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClassName}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger)]/10 p-3 text-sm text-[var(--color-danger)]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full rounded-full py-3 text-sm disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-muted)]">or</span>
            <span className="h-px flex-1 bg-[var(--color-border)]" />
          </div>
          <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[var(--color-primary)] hover:underline">
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
