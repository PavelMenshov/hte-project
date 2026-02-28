"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { addQDayToWallet, connectWallet, txUrl } from "@/lib/abelian";
import { isEscrowDeployed, getConnectedAddress, escrowDeposit } from "@/lib/wallet";

const DEMO_TX = "0x0000000000000000000000000000000000000000000000000000000000000000";

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
        const valueWei = BigInt(Math.floor(parseFloat(amount) * 1e18));
        if (valueWei <= BigInt(0)) {
          setError("Amount must be > 0");
          return;
        }
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

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="font-bold text-[#2563eb] hover:underline">
            ← TenantShield
          </Link>
          <Link href="/pitch" className="text-sm font-medium text-slate-600 hover:text-[#2563eb]">
            Pitch
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-900">Deposit Pool (Escrow)</h1>
        <p className="mt-2 text-slate-600">
          Lock your deposit on QDay. Landlord sees a cryptographic guarantee—not your identity.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {!address ? (
            <>
              <p className="text-sm text-slate-600">Connect wallet on QDay testnet to continue.</p>
              <button
                type="button"
                onClick={handleConnect}
                disabled={loading}
                className="mt-4 rounded-full bg-[#2563eb] px-6 py-3 font-semibold text-white disabled:opacity-50 hover:bg-[#1d4ed8]"
              >
                {loading ? "Connecting…" : "Add QDay & Connect"}
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                Connected: <span className="font-mono text-slate-800">{address.slice(0, 10)}…{address.slice(-8)}</span>
              </p>
              {escrowDeployed ? (
                <>
                  <label className="mt-4 block text-sm font-medium text-slate-700">Landlord address (0x…)</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={landlord}
                    onChange={(e) => setLandlord(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-800 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                  />
                  <label className="mt-3 block text-sm font-medium text-slate-700">Amount (QDAY)</label>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-800 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                  />
                </>
              ) : (
                <p className="mt-4 rounded-lg border border-[#2563eb]/20 bg-[#2563eb]/5 p-3 text-sm text-slate-700">
                  Demo mode: Escrow not deployed. Click below to simulate a deposit (shows flow + explorer link).
                </p>
              )}
              <button
                type="button"
                onClick={handleDeposit}
                disabled={loading || (escrowDeployed && !landlord.trim())}
                className="mt-4 rounded-full bg-[#2563eb] px-6 py-3 font-semibold text-white disabled:opacity-50 hover:bg-[#1d4ed8]"
              >
                {loading ? "Confirming…" : escrowDeployed ? "Deposit" : "Simulate deposit"}
              </button>
            </>
          )}
          {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}
          {txHash && (
            <p className="mt-4 text-sm">
              <a href={txUrl(txHash)} target="_blank" rel="noopener noreferrer" className="font-medium text-[#2563eb] hover:underline">
                View transaction on QDay Explorer →
              </a>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
