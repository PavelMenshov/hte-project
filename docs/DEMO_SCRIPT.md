# TenantShield — Demo script (2–3 min)

Use this for live presentation or recording.

---

## Opening (15 sec)

- **Slide / screen:** Landing page.
- **Say:** «TenantShield is collective tenant protection for Hong Kong students. We use Abelian’s quantum-resistant chain so your data stays yours, and AWS Bedrock so AI helps without knowing who you are.»

---

## Problem (20 sec)

- **Say:** «Students sign leases they don’t understand, lose huge deposits, and can’t afford lawyers. Alone they’re powerless; together they have leverage. We give them escrow on-chain, contract analysis by AI, and anonymous collective bargaining.»

---

## Demo 1: Contract Analyzer (45 sec)

1. Go to **Contract Analyzer** (or click «Try demo»).
2. Click **«Use sample contract (demo)»** to fill a short lease.
3. Click **Analyze**.
4. **Say:** «Only the contract text goes to the AI—no names, no IDs. Bedrock checks it against Hong Kong tenant law.»
5. Show **Report**: red flags (e.g. non-refundable deposit, waiver of claims), recommendations.
6. **Say:** «If AWS isn’t configured here, the app still shows a clear message—we’re ready for live Bedrock.»

---

## Demo 2: Deposit on QDay (45 sec)

1. Go to **Deposit Pool**.
2. Click **«Add QDay & Connect»** — add QDay testnet and connect wallet.
3. **Say:** «All on-chain actions use Abelian’s QDay network.»
4. Click **«Simulate deposit»** (or **Deposit** if contract is deployed).
5. Show **«View transaction on QDay Explorer»**.
6. **Say:** «The landlord sees a cryptographic guarantee that the deposit is locked. They never see the tenant’s identity until after move-in, by design.»

---

## Closing (20 sec)

- Go to **Pitch** page (or one slide).
- **Say:** «We cover the AWS Agentic AI track with Bedrock, the Abelian Privacy & AI track with QDay for escrow and legal fund, and HKUST Innovation with a real student problem. Personal data never leaves the Abelian layer; AI only sees anonymized data or contract text.»
- **CTA:** «Try the demo at [URL].»

---

## If something breaks

- **No Bedrock:** Show sample contract + «Analysis unavailable» message; explain «AWS credentials in env would enable live analysis.»
- **No wallet / QDay:** Show Deposit page and explain: «User would add QDay and connect; we’d then call the Escrow contract.»
- **Time short:** Do only Contract Analyzer + one sentence on Deposit and Pitch.
