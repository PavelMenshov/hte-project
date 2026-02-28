"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
    <div className="min-h-screen bg-[#fafafa] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="font-bold text-[#2563eb] hover:underline">← TenantShield</Link>
          <Link href="/pitch" className="text-sm font-medium text-slate-600 hover:text-[#2563eb]">Pitch</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-900">Legal Fund</h1>
        <p className="mt-2 text-slate-600">HK$5/month into a shared on-chain fund on QDay. In a dispute, AI classifies the case and a partner lawyer is paid from the fund.</p>
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {!address ? (
            <>
              <p className="text-sm text-slate-600">Connect wallet on QDay to contribute.</p>
              <button type="button" onClick={handleConnect} disabled={loading} className="mt-4 rounded-full bg-[#2563eb] px-6 py-3 font-semibold text-white disabled:opacity-50 hover:bg-[#1d4ed8]">
                {loading ? "Connecting…" : "Add QDay & Connect"}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">Connected: <span className="font-mono text-slate-800">{address.slice(0, 10)}…{address.slice(-8)}</span></p>
              {!fundDeployed && <p className="mt-4 rounded-lg border border-[#2563eb]/20 bg-[#2563eb]/5 p-3 text-sm text-slate-700">Demo: Legal Fund contract not deployed. Click below to simulate a contribution.</p>}
              <button type="button" onClick={handleContribute} disabled={loading} className="mt-4 rounded-full bg-[#2563eb] px-6 py-3 font-semibold text-white disabled:opacity-50 hover:bg-[#1d4ed8]">
                {loading ? "Confirming…" : fundDeployed ? "Contribute 0.001 QDAY" : "Simulate contribute"}
              </button>
            </>
          )}
          {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
          {txHash && <p className="mt-4 text-sm"><a href={txUrl(txHash)} target="_blank" rel="noopener noreferrer" className="font-medium text-[#2563eb] hover:underline">View on QDay Explorer →</a></p>}
        </div>
      </main>
    </div>
  );
}
