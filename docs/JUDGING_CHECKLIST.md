# TenantShield — Judging checklist

Quick reference for judges and for the team before submission.

---

## Abelian Foundation Privacy & AI Award

| Criterion | ✅ How we meet it |
|-----------|-------------------|
| **Integrate with QDay/Abelian** | All on-chain flows use QDay: Deposit (Escrow), Legal Fund (contribute). Wallet connect adds QDay testnet; tx link goes to QDay Explorer. |
| **Privacy creativity** | Personal data never leaves Abelian layer. AWS sees only contract text (no PII) or anonymized aggregates. Landlord sees guarantee + rating, not identity. |
| **AI implementation** | Contract Analyzer via AWS Bedrock (InvokeModel/Agent). Collective Pool and Legal classifier in roadmap; architecture is AI-on-anonymized-data. |
| **Technical execution & impact** | Working demo: contract analysis, wallet + escrow flow, pitch page. Real problem (HK students), scalable product. |

---

## AWS / Ingram Micro Agentic AI Champion

| Criterion | ✅ How we meet it |
|-----------|-------------------|
| **Agentic AI** | Bedrock used for contract analysis (and collective pool in roadmap). Can extend to Bedrock AgentCore with tools. |
| **Technical** | Next.js API route → Bedrock; structured prompt for HK tenant law; JSON output (summary, red flags, recommendations). |

---

## HKUST EC Innovation Award

| Criterion | ✅ How we meet it |
|-----------|-------------------|
| **Real problem** | HK rental market: students overpay, lose deposits, lack legal access. |
| **Startup potential** | B2B (universities), commission on collective deals, «TenantShield Verified» badge for landlords. Scalable to Singapore, London, Tokyo. |

---

## Main Awards (Novelty, AI/ML, Impact, Technical)

| Criterion | ✅ How we meet it |
|-----------|-------------------|
| **Novelty** | Privacy-first tenant protection: Abelian + Bedrock; escrow + AI analysis + collective pool in one product. |
| **AI/ML** | Bedrock for contract analysis and (roadmap) pool coordination. |
| **Impact** | Target: international students in HK; expandable to all tenants and other cities. |
| **Technical** | Next.js, TypeScript, viem, Solidity (Escrow, LegalFund), AWS Bedrock, QDay integration. |

---

## Pre-submission checklist

- [ ] `npm run build` passes.
- [ ] Demo: Contract Analyzer (sample + Analyze) works or shows clear «AWS not configured» message.
- [ ] Demo: Deposit — Add QDay & Connect works; Simulate deposit shows explorer link.
- [ ] Pitch page loads and summarizes problem, solution, architecture, tracks.
- [ ] README has run instructions and env vars.
- [ ] If contracts deployed: set `NEXT_PUBLIC_ESCROW_ADDRESS` and/or `NEXT_PUBLIC_LEGAL_FUND_ADDRESS` for real tx demo.
