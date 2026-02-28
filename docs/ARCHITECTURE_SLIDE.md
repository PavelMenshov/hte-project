# TenantShield — One-slide architecture (for pitch deck)

Copy this into a single slide or use the /pitch page.

---

## Title: **Privacy by design**

**Subtitle:** Personal data never leaves Abelian. AI helps without knowing who you are.

---

### Diagram (text)

```
┌─────────────┐     ┌──────────────────────────────────────┐
│   Tenant    │────►│  Abelian / QDay                      │
│   (wallet)  │     │  · Escrow (deposit)                  │
└─────────────┘     │  · Legal Fund (contributions)        │
                    │  · Reviews (anonymous, verified)     │
                    │  Identity & money stay here          │
                    └──────────────────────────────────────┘
                                      │
                    Only: contract text*, hashes, aggregates
                    * no names, IDs, addresses
                                      ▼
                    ┌──────────────────────────────────────┐
                    │  AWS Bedrock                         │
                    │  · Contract analysis (HK law)        │
                    │  · Collective pool coordination      │
                    └──────────────────────────────────────┘
                                      │
                                      ▼
                    ┌──────────────────────────────────────┐
                    │  Result: report, recommendations,     │
                    │  matches — no PII exposed            │
                    └──────────────────────────────────────┘
```

---

### Bullets for the slide

- **Tenant** → signs with wallet; deposits and contributions go to **QDay (Abelian)**.
- **To AWS** we send only: contract text (no signatures/PII), hashes, anonymized aggregates.
- **Bedrock** returns: analysis, red flags, recommendations, pool matches.
- **Landlord** sees: payment guarantee, number of tenants, rating. **Not** identity.

---

### One-liner for judges

«We combine Abelian’s quantum-resistant, privacy-first chain with AWS Bedrock so tenants get AI-powered contract checks and escrow without ever giving their identity to the cloud.»
