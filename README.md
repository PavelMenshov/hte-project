# TenantShield

Collective tenant protection platform for Hong Kong students: contract analysis (AWS Bedrock), escrow deposits, and anonymous collective bargaining on **Abelian / QDay** (quantum-resistant, privacy-first).

## Quick start

```bash
npm install
cp .env.example .env.local
# Edit .env.local: add AWS credentials and optionally QDay RPC/chainId
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Adaptive layout: works on mobile and desktop.

### Share via ngrok

To expose the app to the internet (e.g. for demos or sharing with judges):

1. In one terminal: `npm run dev` (keep it running).
2. In another terminal: `npm run share` (runs `ngrok http 3000`).

Ngrok will print a public URL (e.g. `https://abc123.ngrok-free.app`). Open it in a browser or share the link. The first time you may need to accept the ngrok cookie banner when visiting the URL.

**Использовать свой аккаунт ngrok (или сменить токен):**

1. Зайди на [dashboard.ngrok.com](https://dashboard.ngrok.com) и залогинься (или зарегистрируйся).
2. В разделе **Your Authtoken** скопируй токен.
3. В терминале выполни один раз:
   ```bash
   npx ngrok config add-authtoken ВСТАВЬ_СЮДА_ТОКЕН
   ```
   Это сохранит токен в конфиг ngrok; дальше `npm run share` будет использовать твой аккаунт.

   Либо можно не сохранять в конфиг, а передавать токен через переменную окружения перед запуском:
   - Windows (PowerShell): `$env:NGROK_AUTHTOKEN="твой_токен"; npm run share`
   - Mac/Linux: `NGROK_AUTHTOKEN=твой_токен npm run share`

## Environment

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_QDAY_RPC` | QDay testnet RPC (default: https://testnet-rpc-00.qday.info) |
| `NEXT_PUBLIC_QDAY_CHAIN_ID` | Chain ID for QDay testnet |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | For Bedrock |
| **Bedrock Agent (recommended for Contract Analyzer)** | |
| `BEDROCK_AGENT_ID` | Agent ID from AWS Console → Bedrock → Agents → your agent |
| `BEDROCK_AGENT_ALIAS_ID` | Alias ID (e.g. alias "prod") — same place in console |
| `BEDROCK_MODEL_ID` | Used only when Agent is not set; e.g. amazon.nova-lite-v1:0 |

## Abelian / QDay

- **Must** for Abelian Foundation Privacy & AI Award: all on-chain flows use QDay.
- Add network in MetaMask: use "Add QDay & Connect" on the Deposit page (or add manually: RPC and Explorer in `.env.example`).
- Deploy Escrow contract from `contracts/` to QDay testnet and set `NEXT_PUBLIC_ESCROW_ADDRESS` for real deposit flow.

## For judges (hackathon)

- **Pitch summary:** Open [/pitch](http://localhost:3000/pitch) for problem, solution, architecture, and track coverage.
- **Demo (2–3 min):** [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) — script for live or recorded demo.
- **Judging checklist:** [docs/JUDGING_CHECKLIST.md](docs/JUDGING_CHECKLIST.md) — how we meet each track’s criteria.
- **Architecture slide:** [docs/ARCHITECTURE_SLIDE.md](docs/ARCHITECTURE_SLIDE.md) — one-slide text for deck.

**No AWS / no wallet:** Contract Analyzer shows a clear fallback message if Bedrock is not configured. Deposit works in “Simulate” mode without deployed contracts; connect wallet to add QDay and see the flow.

## Demo flow (hackathon)

1. **Landing** → Modules + “Pitch” + “Try demo”.
2. **Contract Analyzer** → “Use sample contract (demo)” → Analyze (Bedrock; no PII). If AWS missing, friendly message is shown.
3. **Deposit** → “Add QDay & Connect” → “Simulate deposit” → link to QDay Explorer. With deployed Escrow, real deposit works.
4. **Legal Fund** → Same pattern: connect, simulate or real contribute.

## Docs

- [Abelian Award strategy](docs/ABELIAN_AWARD_STRATEGY.md) — how we meet Privacy creativity, AI implementation, Technical execution, QDay integration.
- [36h priority](docs/HACKATHON_36H_PRIORITY.md) — build order and risks.

## Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind (adaptive).
- **AI:** AWS Bedrock AgentCore (InvokeAgent when agent ID set); InvokeModel fallback.
- **Chain:** QDay (EVM); viem for wallet + contract writes. Contracts: `contracts/Escrow.sol`, `contracts/LegalFund.sol`.
