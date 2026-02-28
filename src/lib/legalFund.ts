/**
 * Legal Fund contract ABI — QDay / Abelian.
 * contribute() adds to pool; dispute claims paid from pool (backend/oracle).
 */

export const LEGAL_FUND_ABI = [
  {
    inputs: [],
    name: "contribute",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "totalPool",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
