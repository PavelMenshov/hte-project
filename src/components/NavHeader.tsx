"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getSession, clearSession, type AuthUser } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Properties" },
  { href: "/invest", label: "Invest" },
  { href: "/rental", label: "Rental" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about", label: "About" },
] as const;

export default function NavHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    queueMicrotask(() => setUser(getSession()));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  function handleLogout() {
    clearSession();
    setUser(null);
    setMenuOpen(false);
    router.push("/login");
  }

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="font-bold tracking-tight text-[var(--color-primary)]"
          style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
        >
          TENANTSHIELD
        </Link>
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition hover:text-[var(--color-primary)] ${
                  isActive ? "text-[var(--color-primary)] nav-link-active" : "text-[var(--color-muted)]"
                }`}
              >
                {label}
              </Link>
            );
          })}
          {user == null ? (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-primary)]"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="btn-primary rounded-full px-4 py-2 text-sm"
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm text-[var(--color-muted)]">
                Hi, {user.name.split(" ")[0]}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-primary rounded-full px-4 py-2 text-sm"
              >
                Logout
              </button>
            </>
          )}
        </nav>
        <button
          type="button"
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span
            className={`block w-6 h-0.5 bg-[var(--color-text)] transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 bg-[var(--color-text)] transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-6 h-0.5 bg-[var(--color-text)] transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </div>
      {menuOpen && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-md py-4 px-4 flex flex-col gap-2">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block py-2 px-3 rounded-lg text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition"
            >
              {label}
            </Link>
          ))}
          <div className="border-t border-[var(--color-border)] pt-3 mt-1 flex flex-col gap-2">
            {user == null ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 px-3 rounded-lg text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary rounded-full px-4 py-2 text-sm text-center"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <span className="block py-2 px-3 text-sm text-[var(--color-muted)]">
                  Hi, {user.name.split(" ")[0]}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-primary w-full rounded-full px-4 py-2 text-sm text-center"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
