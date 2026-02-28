/**
 * TenantShield — network and contract constants.
 * QDay testnet: https://testnet-rpc-00.qday.info
 */

export const QDAY_CHAIN_ID = Number(process.env.NEXT_PUBLIC_QDAY_CHAIN_ID ?? 35443);
export const QDAY_RPC = process.env.NEXT_PUBLIC_QDAY_RPC ?? "https://testnet-rpc-00.qday.info";
export const QDAY_EXPLORER = process.env.NEXT_PUBLIC_QDAY_EXPLORER ?? "https://testnet-explorer.qday.info";

export const QDAY_NETWORK = {
  id: QDAY_CHAIN_ID,
  chainId: QDAY_CHAIN_ID,
  name: "QDay Testnet",
  nativeCurrency: { name: "QDAY", symbol: "QDAY", decimals: 18 },
  rpcUrls: { default: { http: [QDAY_RPC] } },
  blockExplorers: { default: { name: "QDay Explorer", url: QDAY_EXPLORER } },
} as const;

/** Zero address = contract not deployed (demo mode) */
export const isZeroAddress = (a: string) =>
  !a || a === "0x0000000000000000000000000000000000000000";

/** Placeholder: deploy Escrow contract and set address here */
export const CONTRACT_ADDRESSES = {
  escrow: process.env.NEXT_PUBLIC_ESCROW_ADDRESS ?? "0x0000000000000000000000000000000000000000",
  legalFund: process.env.NEXT_PUBLIC_LEGAL_FUND_ADDRESS ?? "0x0000000000000000000000000000000000000000",
} as const;
