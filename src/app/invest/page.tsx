"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { addStoredTokens } from "@/lib/user-tokens";
import InvestmentCalculator from "@/components/InvestmentCalculator";
import PrivacyBlock from "@/components/PrivacyBlock";

type PurchaseResult = {
  transactionHash: string;
  tokensReceived: number;
  timestamp: string;
  amountHkd: number;
} | null;

export default function InvestPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult>(null);
  const [securing, setSecuring] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (mounted && !getSession()) {
      router.replace("/login?from=/invest");
    }
  }, [mounted, router]);

  if (!mounted) return null;

  async function handleSimulate(amountHkd: number, _payoutType: "quarterly" | "reinvest") {
    setSecuring(true);
    setPurchaseResult(null);
    try {
      const res = await fetch("/api/simulate-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountHkd, walletType: "demo" }),
      });
      const data = (await res.json()) as { transactionHash?: string; tokensReceived?: number };
      const tokensReceived = data.tokensReceived ?? Math.floor(amountHkd / 1073);
      setPurchaseResult({
        transactionHash: data.transactionHash ?? "0x" + new Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(""),
        tokensReceived,
        timestamp: new Date().toISOString(),
        amountHkd,
      });
      const user = getSession();
      if (user?.email) addStoredTokens(user.email, tokensReceived);
    } catch {
      const tokensReceived = Math.floor(amountHkd / 1073);
      setPurchaseResult({
        transactionHash: "0x" + new Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(""),
        tokensReceived,
        timestamp: new Date().toISOString(),
        amountHkd,
      });
      const user = getSession();
      if (user?.email) addStoredTokens(user.email, tokensReceived);
    } finally {
      setSecuring(false);
    }
  }

  return (
    <div className="min-h-screen text-[var(--color-text)]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1
          className="section-heading text-4xl font-bold text-white"
          style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
        >
          Invest in the Portfolio — not in one property.
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Buy Tenantshield tokens. Earn 90% of net rental income. Token grows with portfolio NAV.
        </p>

        <div className="mt-10 space-y-8">
          <InvestmentCalculator onSimulate={handleSimulate} />

          <div className="card p-6">
            <h3 className="font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
              🔒 Private Investment — Powered by Abelian / QDay
            </h3>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setWalletConnected(!walletConnected)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] py-3 px-4 text-sm font-medium text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition"
              >
                {walletConnected ? "Disconnect QDay Wallet" : "Connect QDay Wallet"}
              </button>
            </div>
            <p className="mt-3 text-xs text-[var(--color-muted)]">
              Tenantshield never knows who you are. Tokens linked to wallet address only. No KYC. Abelian quantum-resistant cryptography. Zero-knowledge proof of ownership.
            </p>
          </div>

          <div className="card border-[var(--color-primary)]/40 p-6">
            <p className="text-xs text-[var(--color-muted)] mb-3">No wallet needed — full simulation for demo purposes</p>
            <button
              type="button"
              onClick={() => handleSimulate(10000, "quarterly")}
              disabled={securing}
              className="w-full rounded-full border-2 border-[var(--color-primary)] bg-transparent py-3 px-6 text-sm font-bold uppercase tracking-wide text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition disabled:opacity-50"
            >
              🎮 Simulate Investment — Demo Mode
            </button>
          </div>

          <PrivacyBlock />
        </div>

        {securing && (
          <div className="card mt-8 border-[var(--color-primary)]/30 p-6 text-center">
            <p className="text-[var(--color-primary)] font-medium">Securing on Abelian chain...</p>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--color-primary)]" style={{ animation: "pulse 1.5s ease-in-out infinite" }} />
            </div>
          </div>
        )}

        {purchaseResult && !securing && (
          <div className="card mt-8 border-[var(--color-success)]/30 p-6">
            <h3 className="font-bold text-[var(--color-success)]">✓ Transaction confirmed</h3>
            <dl className="mt-4 space-y-2 text-sm" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
              <div className="flex justify-between">
                <dt className="text-[var(--color-muted)]">Transaction ID</dt>
                <dd className="truncate max-w-[200px]" title={purchaseResult.transactionHash}>{purchaseResult.transactionHash}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-muted)]">Tokens received</dt>
                <dd>{purchaseResult.tokensReceived}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-muted)]">Amount</dt>
                <dd>HKD {purchaseResult.amountHkd.toLocaleString()}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-[var(--color-muted)]">
              Your tokens = a share of the entire Tenantshield portfolio. First payout: next quarter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
