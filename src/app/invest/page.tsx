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

const SECURING_STEPS = ["Initializing...", "Securing on Abelian chain...", "Confirmed ✓"];

export default function InvestPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult>(null);
  const [securing, setSecuring] = useState(false);
  const [securingStep, setSecuringStep] = useState(0);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (mounted && !getSession()) {
      router.replace("/login?from=/invest");
    }
  }, [mounted, router]);

  useEffect(() => {
    if (!securing) {
      setSecuringStep(0);
      return;
    }
    setSecuringStep(0);
    const t1 = setTimeout(() => setSecuringStep(1), 800);
    const t2 = setTimeout(() => setSecuringStep(2), 1600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [securing]);

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

          <PrivacyBlock />
        </div>

        {securing && (
          <div className="card mt-8 border-[var(--color-primary)]/30 p-6 text-center">
            <p className="text-[var(--color-primary)] font-medium">{SECURING_STEPS[securingStep]}</p>
            <div className="mt-4 h-1 rounded-full bg-[var(--color-border)] overflow-hidden">
              <div
                className="h-full bg-[var(--color-primary)] transition-all duration-[2500ms] ease-linear rounded-full"
                style={{ width: securing ? "100%" : "0%" }}
              />
            </div>
          </div>
        )}

        {purchaseResult && !securing && (
          <div className="card mt-8 border-[var(--color-success)]/30 p-6 animate-fade-in-up relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" aria-hidden>
              {[...Array(8)].map((_, i) => {
                const tx = (i % 2 === 0 ? 1 : -1) * (40 + (i * 7) % 40);
                const ty = -20 - (i * 10) % 60;
                const colors = ["var(--color-primary)", "var(--color-secondary)", "var(--color-success)"];
                return (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-sm left-1/2 top-1/2 -ml-1 -mt-1"
                    style={{
                      backgroundColor: colors[i % 3],
                      animation: "confetti-pop 0.6s ease-out forwards",
                      ["--tx" as string]: `${tx}px`,
                      ["--ty" as string]: `${ty}px`,
                    }}
                  />
                );
              })}
            </div>
            <h3 className="font-bold text-[var(--color-success)] relative z-10">✓ Transaction confirmed</h3>
            <dl className="mt-4 space-y-2 text-sm relative z-10" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
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
            <p className="mt-4 text-xs text-[var(--color-muted)] relative z-10">
              Your tokens = a share of the entire Tenantshield portfolio. First payout: next quarter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
