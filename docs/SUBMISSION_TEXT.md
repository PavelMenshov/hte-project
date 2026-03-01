# TenantShield — Hackathon Submission Text

Copy-paste ready text for Devpost / submission forms.

---

## Inspiration

Hong Kong students and young tenants face the same problems: they overpay for rent, lose deposits to unfair landlords, and can’t afford lawyers to check tenancy agreements. At the same time, buying property in HK is out of reach for most people—minimum down payments are in the millions. We wanted one platform that solves both sides: **investors** get access to fractional, AI-selected real estate from HKD 1,000, and **tenants** get AI contract checks and escrow without having to hand over their passport and personal data. We combined AWS Bedrock for intelligence and Abelian’s QDay for privacy so that your identity stays with you—not in the cloud.

---

## What it does

**For investors:** Browse AI-scored co-living properties in our portfolio. Each one has a Bedrock-generated report (yield, growth potential, risks). Buy Tenantshield tokens from HKD 1,000; you earn 90% of net rental income. Ownership is on Abelian QDay—quantum-resistant, no KYC. Connect your wallet, see your balance and next payout, and chat with a portfolio advisor powered by Bedrock.

**For tenants:** Upload a tenancy agreement and get an AI analysis in seconds: summary, red flags, illegal clauses, and recommendations based on HK tenant law. Lock your deposit in an on-chain escrow on QDay so the landlord sees a cryptographic guarantee—not your name or ID. Contribute to a shared Legal Fund (on-chain) for dispute support. Browse available rooms in Tenantshield-managed properties and join a waitlist when full. Everything is designed so your personal data never leaves the privacy layer; AI only sees contract text or anonymized data.

---

## How we built it

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS. Pages for home, properties, invest, dashboard, rental, contract analysis, deposit, legal fund, and collective pool.
- **AI:** AWS Bedrock—we use Bedrock Agent (AgentCore) when configured for contract analysis and property analysis, with InvokeModel (Amazon Nova) as fallback. Separate agents/contexts for contract analyzer, property scorer, market-listing enricher, and portfolio advisor. All prompts are structured for HK law and JSON output.
- **Blockchain:** Abelian QDay (EVM-compatible). Solidity contracts: Escrow (deposit lock), LegalFund (contributions), CollectiveRentPool (demo). We use viem for wallet connect and transactions; users add QDay testnet in one click and see tx links to QDay Explorer.
- **Data:** Property portfolio in JSON; market data from scrapers (28hse, Squarefoot) and cache; auth is cookie-based for the demo (no PII stored server-side for tenant flows).
- **Deployment:** Next.js on Vercel or self-hosted; env vars for AWS credentials and Bedrock agent IDs.

---

## Challenges we ran into

- **Bedrock region and model availability:** Agent defaulted to Claude in some regions; we had to document switching the agent’s foundation model to Amazon Nova so it runs in HK-friendly regions. We added clear error messages and fallbacks so the app still works without Bedrock (e.g. static portfolio, local advisor replies).
- **Privacy architecture:** Making sure AI never sees tenant identity was a design constraint from day one. We had to separate “what goes to the chain” (escrow, fund, proofs) from “what goes to Bedrock” (contract text only, no signatures or IDs). Getting the data flow right and explaining it simply on the About page took several iterations.
- **QDay integration in 36h:** Connecting wallet, adding the testnet, and wiring Escrow + Legal Fund so that a judge could see a real tx on QDay Explorer in a short demo required careful sequencing and a “simulate” path when contracts aren’t deployed.

---

## Accomplishments that we're proud of

- **Two-sided product in one hack:** A single app serves both investors (tokens, portfolio, advisor) and tenants (contract check, escrow, legal fund, rental listings)—with a clear privacy story: identity on Abelian, intelligence on Bedrock.
- **Real AI integration:** Multiple Bedrock use cases (contract analysis, property scoring, market enrichment, portfolio chat) with structured prompts and error handling, not just a single chatbot.
- **Working on-chain flows:** Deposit escrow and Legal Fund contributions on QDay with wallet connect and explorer links; contracts are auditable and EVM-compatible.
- **HK-specific value:** We focused on Hong Kong tenant law, co-living, and student pain points so the solution is relevant to the local market and scalable to other cities later.

---

## What we learned

- Combining a privacy-first chain (Abelian) with a powerful AI (Bedrock) forces you to think clearly about data boundaries: what is identity, what is “content,” and what never leaves the user’s control. We learned to document this in the UI and in the architecture so judges and users get it quickly.
- Bedrock Agent vs InvokeModel: having both paths and a fallback when the agent isn’t configured made the demo robust and taught us how to keep the same API surface for the frontend regardless of backend config.
- Building for two audiences (investors and tenants) in one hackathon is hard but possible if the core idea—privacy + AI + real estate—ties them together.

---

## What's next for TenantShield

- **Deploy contracts on QDay mainnet** and enable real deposit locks and Legal Fund payouts; partner with a law firm for dispute classification and payouts from the fund.
- **Expand Bedrock agents:** Add tools (e.g. search portfolio, fetch market stats) so the portfolio advisor and a future “collective pool coordinator” are fully agentic. Integrate contract analysis with the rental flow (e.g. “analyze before you sign”).
- **Scale the rental side:** More Tenantshield-managed properties, waitlist → lease flow, and anonymous verified reviews stored on-chain so tenants can choose safely without revealing identity.
- **Go-to-market:** B2B pilots with HK universities (housing for international students), then “TenantShield Verified” badge for landlords who accept escrow and standard terms. Expand to Singapore, London, or Tokyo with local law and listing integrations.
- **Compliance:** Explore private placement (e.g. up to 50 investors) and later a Type 9 SFC structure for broader token distribution in Hong Kong.
