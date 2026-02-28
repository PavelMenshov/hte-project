/**
 * Abelian / QDay helpers.
 * All on-chain actions use QDay (EVM-compatible, quantum-resistant).
 * Personal data stays in wallet/layer; we only use hashes and anonymized IDs on-chain.
 */

import { QDAY_EXPLORER, QDAY_NETWORK } from "./constants";

export { QDAY_NETWORK, QDAY_EXPLORER };

export function txUrl(txHash: string): string {
  return `${QDAY_EXPLORER}/tx/${txHash}`;
}

export function addressUrl(address: string): string {
  return `${QDAY_EXPLORER}/address/${address}`;
}

/**
 * Add QDay testnet to MetaMask (or other wallet) programmatically.
 */
export async function addQDayToWallet(): Promise<void> {
  const provider = typeof window !== "undefined" && (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
  if (!provider) {
    throw new Error("No wallet found. Install MetaMask.");
  }
  await provider.request({
    method: "wallet_addEthereumChain",
    params: [
      {
        chainId: `0x${QDAY_NETWORK.chainId.toString(16)}`,
        chainName: QDAY_NETWORK.name,
        nativeCurrency: QDAY_NETWORK.nativeCurrency,
        rpcUrls: QDAY_NETWORK.rpcUrls.default.http,
        blockExplorerUrls: [QDAY_NETWORK.blockExplorers.default.url],
      },
    ],
  });
}

/**
 * Request wallet connection (QDay or current chain).
 */
export async function connectWallet(): Promise<string> {
  const provider = typeof window !== "undefined" && (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum;
  if (!provider) throw new Error("No wallet found.");
  const accounts = (await provider.request({ method: "eth_requestAccounts", params: [] })) as string[];
  if (!accounts[0]) throw new Error("No account selected.");
  return accounts[0];
}
