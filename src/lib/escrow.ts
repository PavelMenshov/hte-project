/**
 * Escrow contract ABI (subset for deposit) — QDay / Abelian.
 */

export const ESCROW_ABI = [
  {
    inputs: [{ name: "landlord", type: "address" }],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "id", type: "bytes32" }],
    name: "release",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "depositCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
