"use client";

import { useState, useEffect } from "react";
import { addQDayToWallet, connectWallet, txUrl } from "@/lib/abelian";
import { isLegalFundDeployed, getConnectedAddress, legalFundContribute } from "@/lib/wallet";

const DEMO_TX = "0x0000000000000000000000000000000000000000000000000000000000000000";
const CONTRIBUTION_WEI = BigInt(1e15); // 0.001 QDAY for demo

export default function LegalPage() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fundDeployed = isLegalFundDeployed();

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

  async function handleContribute() {
    setError(null);
    setTxHash(null);
    setLoading(true);
    try {
      if (fundDeployed) {
        const hash = await legalFundContribute(CONTRIBUTION_WEI);
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

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="section-heading text-3xl font-bold text-white" style={{ fontFamily: "var(--font-syne), system-ui, sans-serif" }}>
          Legal Fund
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">HK$5/month into a shared on-chain fund on QDay. In a dispute, AI classifies the case and a partner lawyer is paid from the fund.</p>
        <div className="card mt-8 p-6">
          {!address ? (
            <>
              <p className="text-sm text-[var(--color-muted)]">Connect wallet on QDay to contribute.</p>
              <button type="button" onClick={handleConnect} disabled={loading} className="btn-primary mt-4 rounded-full px-6 py-3 text-sm disabled:opacity-50">
                {loading ? "Connecting…" : "Add QDay & Connect"}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-[var(--color-muted)]">Connected: <span className="font-mono text-[var(--color-text)]">{address.slice(0, 10)}…{address.slice(-8)}</span></p>
              {!fundDeployed && <p className="mt-4 rounded-lg border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-3 text-sm text-[var(--color-muted)]">Demo: Legal Fund contract not deployed. Click below to simulate a contribution.</p>}
              <button type="button" onClick={handleContribute} disabled={loading} className="btn-primary mt-4 rounded-full px-6 py-3 text-sm disabled:opacity-50">
                {loading ? "Confirming…" : fundDeployed ? "Contribute 0.001 QDAY" : "Simulate contribute"}
              </button>
            </>
          )}
          {error && <p className="mt-4 text-sm font-medium text-[var(--color-danger)]">{error}</p>}
          {txHash && <p className="mt-4 text-sm"><a href={txUrl(txHash)} target="_blank" rel="noopener noreferrer" className="font-medium text-[var(--color-primary)] hover:underline">View on QDay Explorer →</a></p>}
        </div>
      </main>
    </div>
  );
}
