/**
 * Browser wallet + contract writes for QDay (viem).
 * Used for Escrow deposit and Legal Fund contribute.
 */

import { createWalletClient, custom, type WalletClient } from "viem";
import { CONTRACT_ADDRESSES, isZeroAddress, QDAY_NETWORK } from "./constants";
import { ESCROW_ABI } from "./escrow";
import { LEGAL_FUND_ABI } from "./legalFund";

function getProvider() {
  if (typeof window === "undefined") return null;
  return (window as unknown as { ethereum?: unknown }).ethereum ?? null;
}

const chain = {
  id: QDAY_NETWORK.chainId,
  name: QDAY_NETWORK.name,
  nativeCurrency: QDAY_NETWORK.nativeCurrency,
  rpcUrls: { default: { http: [...QDAY_NETWORK.rpcUrls.default.http] } },
};

export function getWalletClient(): WalletClient | null {
  const provider = getProvider();
  if (!provider) return null;
  return createWalletClient({
    chain,
    transport: custom(provider as import("viem").EIP1193Provider),
  });
}

export async function getConnectedAddress(): Promise<string | null> {
  const client = getWalletClient();
  if (!client) return null;
  const [address] = await client.getAddresses();
  return address ?? null;
}

export function isEscrowDeployed(): boolean {
  return !isZeroAddress(CONTRACT_ADDRESSES.escrow);
}

/** Send Escrow.deposit(landlord). Returns tx hash or throws. */
export async function escrowDeposit(landlord: `0x${string}`, valueWei: bigint): Promise<`0x${string}`> {
  if (!isEscrowDeployed()) throw new Error("Escrow not deployed");
  const client = getWalletClient();
  if (!client) throw new Error("No wallet");
  const [account] = await client.getAddresses();
  if (!account) throw new Error("No account");
  const hash = await client.writeContract({
    chain,
    address: CONTRACT_ADDRESSES.escrow as `0x${string}`,
    abi: ESCROW_ABI,
    functionName: "deposit",
    args: [landlord],
    value: valueWei,
    account,
  });
  return hash;
}

export function isLegalFundDeployed(): boolean {
  return !isZeroAddress(CONTRACT_ADDRESSES.legalFund);
}

/** Send LegalFund.contribute(). Returns tx hash or throws. */
export async function legalFundContribute(valueWei: bigint): Promise<`0x${string}`> {
  if (!isLegalFundDeployed()) throw new Error("Legal Fund contract not deployed");
  const client = getWalletClient();
  if (!client) throw new Error("No wallet");
  const [account] = await client.getAddresses();
  if (!account) throw new Error("No account");
  const hash = await client.writeContract({
    chain,
    address: CONTRACT_ADDRESSES.legalFund as `0x${string}`,
    abi: LEGAL_FUND_ABI,
    functionName: "contribute",
    value: valueWei,
    account,
  });
  return hash;
}
