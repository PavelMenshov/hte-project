"use client";

import { useState, useEffect } from "react";
import { Shield, Lock, Send, Home, CheckCircle } from "lucide-react";
import { addQDayToWallet, connectWallet, txUrl } from "@/lib/abelian";
import { isEscrowDeployed, getConnectedAddress, escrowDeposit } from "@/lib/wallet";

const DEMO_TX = "0x0000000000000000000000000000000000000000000000000000000000000000";

const STEPS = [
  { id: "locked", label: "Deposit Locked", icon: Lock },
  { id: "notified", label: "Landlord Notified", icon: Send },
  { id: "verified", label: "Move-in Verified", icon: Home },
  { id: "released", label: "Released", icon: CheckCircle },
] as const;

export default function DepositPage() {
  const [address, setAddress] = useState<string | null>(null);
  const [landlord, setLandlord] = useState("");
  const [amount, setAmount] = useState("0.001");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const escrowDeployed = isEscrowDeployed();

  async function handleConnect() {
    setError(null);
    setLoading(true);
    try {
      await addQDayToWallet();
      const acc = await connectWallet();
      setAddress(acc);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getConnectedAddress().then(setAddress);
  }, []);

  async function handleDeposit() {
    setError(null);
    setTxHash(null);
    setLoading(true);
    try {
      if (escrowDeployed && landlord.trim()) {
        const addr = landlord.trim() as `0x${string}`;
        if (!addr.startsWith("0x") || addr.length < 40) {
          setError("Enter a valid landlord address (0x...)");
          return;
        }
        const amountNum = Number.parseFloat(amount);
        if (!Number.isFinite(amountNum) || amountNum <= 0) {
          setError("Amount must be a positive number");
          return;
        }
        const valueWei = BigInt(Math.floor(amountNum * 1e18));
        const hash = await escrowDeposit(addr, valueWei);
        setTxHash(hash);
      } else {
        await new Promise((r) => setTimeout(r, 1200));
        setTxHash(DEMO_TX);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction failed");
    } finally {
      setLoading(false);
    }
  }

  const completedSteps = txHash ? 2 : address ? 1 : 0;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1
          className="section-heading text-3xl font-bold text-white"
          style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}
        >
          Deposit Pool (Escrow)
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          Lock your deposit on QDay. Landlord sees a cryptographic guarantee—not your identity.
        </p>

        {/* Vault card with pulsing cyan ring */}
        <div className="card vault-pulse mt-8 flex flex-col items-center rounded-2xl border-[var(--color-primary)]/30 p-8">
          <div className="rounded-full bg-[var(--color-surface)] p-4 ring-2 ring-[var(--color-primary)]/50">
            <Shield className="h-14 w-14 text-[var(--color-primary)]" strokeWidth={1.5} />
          </div>
          <p className="mt-4 text-center font-medium text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
            Escrow vault
          </p>
          <p className="mt-1 text-center text-sm text-[var(--color-muted)]">
            Your deposit is held on-chain until move-in is verified
          </p>
        </div>

        <div className="card mt-8 p-6">
          {!address ? (
            <>
              <p className="text-sm text-[var(--color-muted)]">Connect wallet on QDay testnet to continue.</p>
              <button
                type="button"
                onClick={handleConnect}
                disabled={loading}
                className="btn-primary mt-4 rounded-full px-6 py-3 text-sm disabled:opacity-50"
              >
                {loading ? "Connecting…" : "Add QDay & Connect"}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-[var(--color-muted)]">
                Connected: <span className="font-mono text-[var(--color-text)]">{address.slice(0, 10)}…{address.slice(-8)}</span>
              </p>
              {escrowDeployed ? (
                <>
                  <label htmlFor="deposit-landlord" className="mt-4 block text-sm font-medium text-[var(--color-text)]">Landlord address (0x…)</label>
                  <input
                    id="deposit-landlord"
                    type="text"
                    placeholder="0x..."
                    value={landlord}
                    onChange={(e) => setLandlord(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 font-mono text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                  <label htmlFor="deposit-amount" className="mt-3 block text-sm font-medium text-[var(--color-text)]">Amount (QDAY)</label>
                  <input
                    id="deposit-amount"
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 font-mono text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </>
              ) : (
                <p className="mt-4 rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-3 text-sm text-[var(--color-muted)]">
                  Demo mode: Escrow not deployed. Click below to simulate a deposit (shows flow + explorer link).
                </p>
              )}
              <button
                type="button"
                onClick={handleDeposit}
                disabled={loading || (escrowDeployed && !landlord.trim())}
                className="btn-primary mt-4 rounded-full px-6 py-3 text-sm disabled:opacity-50"
              >
                {loading ? "Confirming…" : escrowDeployed ? "Deposit" : "Simulate deposit"}
              </button>
            </>
          )}
          {error && <p className="mt-4 text-sm font-medium text-[var(--color-danger)]">{error}</p>}
          {txHash && (
            <p className="mt-4 text-sm">
              <a href={txUrl(txHash)} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--color-primary)] hover:underline">
                View transaction on QDay Explorer →
              </a>
            </p>
          )}
        </div>

        {/* Status timeline */}
        <div className="card mt-8 p-6">
          <h2 className="mb-6 text-lg font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
            Status
          </h2>
          <div className="relative flex flex-col gap-0">
            {STEPS.map((step, i) => {
              const isComplete = i < completedSteps;
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* vertical line */}
                  {i < STEPS.length - 1 && (
                    <div
                      className="absolute left-[11px] top-6 h-full w-0.5 bg-[var(--color-border)]"
                      style={{ height: "calc(100% + 0.5rem)" }}
                    />
                  )}
                  <div
                    className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                      isComplete
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                        : "border-[var(--color-border)] bg-[var(--color-surface)]"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="h-3.5 w-3.5 text-[var(--color-bg)]" />
                    ) : (
                      <Icon className="h-3.5 w-3.5 text-[var(--color-muted)]" />
                    )}
                  </div>
                  <div className="pt-0.5">
                    <p className={`font-medium ${isComplete ? "text-[var(--color-primary)]" : "text-[var(--color-muted)]"}`}>
                      {step.label}
                    </p>
                    {isComplete && i === 0 && <p className="mt-0.5 text-xs text-[var(--color-muted)]">Wallet connected</p>}
                    {isComplete && i === 1 && txHash && (
                      <p className="mt-0.5 text-xs text-[var(--color-muted)]">Transaction confirmed</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
