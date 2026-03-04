# TenantShield

TenantShield is a **fractional real estate tokenisation platform** for Hong Kong professional investors. AI selects the best HK co-living properties; we acquire them via SPV structures; you buy Real Estate Tokens from HKD 1,000 and earn 90% of net rental income. Liquidity in ~15 minutes via the secondary market. Built on Abelian QDay (quantum-resistant EVM) and AWS Bedrock.

- **Target:** Professional Investors (SFC definition under the Securities and Futures Ordinance, Cap. 571).
- **Currency flow:** USD / HKD / EUR → USDC/USDT → Real Estate Token (no internal cryptocurrency).
- **Compliance:** KYC-compliant; security tokens offered to Professional Investors only. Not an offer to retail investors.

## Quick start

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your values only (never commit .env.local — see SECURITY.md)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The layout is responsive and works on mobile and desktop.

## Project structure

```
TenantShield/
  contracts/          Solidity smart contracts (InvestmentVault, RevenueDistributor, TenantshieldToken, NAVOracle, Escrow)
  data/               Cached market data used by the scraper scheduler
  docs/               Additional project documentation
  public/             Static assets and pre-built JSON data files
  scrapers/           Python scraper for Squarefoot property listings
  scripts/            One-off TypeScript utility scripts (cache prefetch, HTML exploration)
  src/
    app/              Next.js App Router pages and route handlers
      api/            Server-side API routes (Bedrock, auth, market data)
    components/       Shared React components
    data/             Static JSON data consumed by the frontend
    lib/              Shared utilities (AI clients, auth, wallet helpers)
    types/            Shared TypeScript type definitions
```

### Key pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — hero, how-it-works, portfolio stats |
| `/properties` | Browse AI-scored co-living properties |
| `/invest` | Buy Real Estate Tokens (from HKD 1,000) |
| `/dashboard` | Investor dashboard — balances and payouts |
| `/about` | Product FAQ and regulatory information |
| `/login` | Sign in |
| `/register` | Register |
| `/pitch` | Redirects to `/properties` |

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_QDAY_RPC` | QDay testnet RPC (default: https://testnet-rpc-00.qday.info) |
| `NEXT_PUBLIC_QDAY_CHAIN_ID` | Chain ID for QDay testnet |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | AWS credentials for Bedrock |
| `BEDROCK_AGENT_ID` | Agent ID from AWS Console (Bedrock Agents) |
| `BEDROCK_AGENT_ALIAS_ID` | Alias ID for the Bedrock agent |
| `BEDROCK_MODEL_ID` | Fallback model when no agent is configured (e.g. `amazon.nova-lite-v1:0`) |
| `NEXT_PUBLIC_ESCROW_ADDRESS` | (Optional) Deployed Escrow contract address on QDay |

See `.env.example` for the full list. Never commit `.env.local` — see [SECURITY.md](SECURITY.md).

### Bedrock Agent setup

1. In AWS Console go to Bedrock → Agents and create or select your agent.
2. Set the foundation model to Amazon Nova (e.g. `amazon.nova-lite-v1:0`) and press "Prepare agent".
3. Copy the Agent ID into `BEDROCK_AGENT_ID`.
4. Under Aliases, copy the Alias ID into `BEDROCK_AGENT_ALIAS_ID`.
5. Ensure `AWS_REGION` matches the region where the agent was created.
6. The IAM user or role whose credentials are in `.env.local` needs `bedrock:InvokeAgent` permission.

To disable the agent temporarily, comment out `BEDROCK_AGENT_ID` and `BEDROCK_AGENT_ALIAS_ID`. The app will fall back to direct InvokeModel using `BEDROCK_MODEL_ID`.

## Security

Secrets (AWS keys, env files with credentials) are never committed. We use environment variables, a hardened `.gitignore`, and optional CI secret scanning. See **[SECURITY.md](SECURITY.md)** for practices and what to do if a secret was ever leaked.

## Abelian / QDay

On-chain flows use QDay (Abelian's EVM-compatible, quantum-resistant testnet). Add the network in MetaMask using the RPC URL and chain ID from `.env.example`.

To enable real on-chain operations, deploy the relevant contracts from `contracts/` to the QDay testnet and set the corresponding `NEXT_PUBLIC_*` addresses in `.env.local`.

## Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS (responsive)
- **AI:** AWS Bedrock (agents + InvokeModel fallback)
- **Blockchain:** Abelian QDay (EVM); viem for wallet connection and contract writes
- **Smart contracts:** Solidity — InvestmentVault, RevenueDistributor, TenantshieldToken, NAVOracle, Escrow (see `contracts/`)
