# TenantShield

TenantShield is a privacy-first platform that serves two audiences: **investors** who own fractional Hong Kong real estate via tokens, and **tenants** (especially students) who get AI-powered contract analysis, escrow deposits, and collective bargaining — without handing over their identity.

- For investors: AI selects and scores HK co-living properties. Buy Tenantshield tokens from HKD 1,000 and earn 90% of net rental income. Ownership is quantum-private on Abelian QDay.
- For tenants: Upload a tenancy agreement and receive an AI analysis with red flags and recommendations. Lock your deposit in an on-chain escrow on QDay so the landlord sees a cryptographic guarantee, not your personal data.

## Quick start

```bash
npm install
cp .env.example .env.local
# Edit .env.local — add AWS credentials and optionally QDay RPC/chainId
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The layout is responsive and works on mobile and desktop.

## Project structure

```
hte-project/
  contracts/          Solidity smart contracts (Escrow, LegalFund, CollectiveRentPool, etc.)
  data/               Cached market data used by the scraper scheduler
  docs/               Additional project documentation
  public/             Static assets and pre-built JSON data files
  scrapers/           Python scraper for Squarefoot property listings
  scripts/            One-off TypeScript utility scripts (cache prefetch, HTML exploration)
  src/
    app/              Next.js App Router pages and route handlers
      api/            Server-side API routes (Bedrock, auth, market data, scraping)
    components/       Shared React components
    data/             Static JSON data consumed by the frontend
    lib/              Shared utilities (AI clients, auth, scraper logic, wallet helpers)
    types/            Shared TypeScript type definitions
```

### Key pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, how-it-works, and portfolio stats |
| `/properties` | Browse AI-scored co-living properties |
| `/invest` | Buy Tenantshield tokens |
| `/dashboard` | Investor dashboard — balances and payouts |
| `/contract` | Contract Analyzer — upload a tenancy agreement for AI review |
| `/deposit` | Lock a rental deposit in on-chain escrow on QDay |
| `/legal` | Contribute to the shared Legal Fund on QDay |
| `/collective` | Join a collective rent pool |
| `/rental` | Browse available rooms in Tenantshield-managed properties |
| `/reviews` | Anonymous verified tenant reviews |
| `/about` | Privacy architecture and product FAQ |

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_QDAY_RPC` | QDay testnet RPC (default: https://testnet-rpc-00.qday.info) |
| `NEXT_PUBLIC_QDAY_CHAIN_ID` | Chain ID for QDay testnet |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | AWS credentials for Bedrock |
| `BEDROCK_AGENT_ID` | Agent ID from AWS Console (Bedrock Agents) |
| `BEDROCK_AGENT_ALIAS_ID` | Alias ID for the Bedrock agent |
| `BEDROCK_MODEL_ID` | Fallback model when no agent is configured (e.g. `amazon.nova-lite-v1:0`) |
| `NEXT_PUBLIC_ESCROW_ADDRESS` | Deployed Escrow contract address on QDay |
| `NEXT_PUBLIC_LEGAL_FUND_ADDRESS` | Deployed LegalFund contract address on QDay |

The Contract Analyzer shows a clear fallback message when Bedrock is not configured. The Deposit and Legal Fund pages work in "Simulate" mode when contracts are not deployed.

### Bedrock Agent setup

1. In AWS Console go to Bedrock → Agents and create or select your agent.
2. Set the foundation model to Amazon Nova (e.g. `amazon.nova-lite-v1:0`) and press "Prepare agent".
3. Copy the Agent ID (shown at the top of the agent page) into `BEDROCK_AGENT_ID`.
4. Under Aliases, copy the Alias ID (the long string ID, not the alias name) into `BEDROCK_AGENT_ALIAS_ID`.
5. Make sure `AWS_REGION` matches the region where the agent was created.
6. The IAM user or role whose credentials are in `.env.local` needs the `bedrock:InvokeAgent` permission.

To disable the agent temporarily, comment out `BEDROCK_AGENT_ID` and `BEDROCK_AGENT_ALIAS_ID`. The app will fall back to direct InvokeModel using `BEDROCK_MODEL_ID`.

## Abelian / QDay

All on-chain flows use QDay (Abelian's EVM-compatible, quantum-resistant testnet). To add the network in MetaMask, use the "Add QDay and Connect" button on the Deposit page, or add the RPC and chain ID from `.env.example` manually.

To enable real on-chain deposits, deploy `contracts/Escrow.sol` to the QDay testnet and set `NEXT_PUBLIC_ESCROW_ADDRESS` in `.env.local`. The same applies to `contracts/LegalFund.sol` and `NEXT_PUBLIC_LEGAL_FUND_ADDRESS`.

## Stack

- Frontend: Next.js 15, TypeScript, Tailwind CSS (responsive)
- AI: AWS Bedrock AgentCore (InvokeAgent when agent ID is set); InvokeModel fallback
- Blockchain: Abelian QDay (EVM); viem for wallet connection and contract writes
- Smart contracts: Solidity — Escrow, LegalFund, CollectiveRentPool, and supporting contracts in `contracts/`
