# Security

This document describes how we handle secrets and sensitive data so the repository can stay public safely.

## What we never commit

- **Environment files with secrets**: `.env`, `.env.local`, `.env.*.local`, and any file containing `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, or other credentials.
- **Keys and certificates**: `*.pem`, `*.key`, `*.p12`, `*.pfx`, and files in `secrets/` or named `*.credentials`.
- **User data**: `data/users.json` (local auth storage). Never commit real user emails or password hashes.

Use `.env.example` as a template only; it contains placeholders, not real values.

## Proven practices we use

1. **Secrets in environment variables**  
   All sensitive configuration (AWS keys, Bedrock agent IDs, etc.) is read from `process.env` and set via `.env.local` (or CI secrets). No secrets are hardcoded in source.

2. **`.gitignore`**  
   The repo explicitly ignores:
   - All `.env*` files except `.env.example`
   - Key/certificate files and `secrets/`
   - `data/users.json`

3. **Public vs private env vars**  
   - `NEXT_PUBLIC_*` variables are exposed to the browser; use them only for non-secret config (e.g. RPC URLs, chain ID, contract addresses).
   - AWS keys, `BEDROCK_AGENT_*`, and other server-only secrets are **not** prefixed with `NEXT_PUBLIC_` and are only used in API routes and server code.

4. **Least privilege**  
   Use an IAM user or role with only the Bedrock (and any other) permissions the app needs. Avoid root or broad admin keys.

5. **If you ever committed a secret**  
   - Rotate the credential immediately (e.g. new AWS key, new password).
   - Consider using [GitHub secret scanning](https://docs.github.com/en/code-security/secret-scanning) and [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) or `git filter-repo` to remove the secret from history if the repo was already pushed. Note: once pushed, treat the old secret as compromised forever.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Fill in real values only in `.env.local` (never commit it).
3. Restart the dev server after changing env vars.

## CI / Deployment (e.g. Vercel, GitHub Actions)

- Store secrets in the platform’s secret store (e.g. Vercel Environment Variables, GitHub Actions Secrets).
- Do not echo or log environment variables in CI.
- Use separate credentials for production and development where possible.

## Automated checks

- **Secret scanning**: The repository uses [Gitleaks](https://github.com/gitleaks/gitleaks) in GitHub Actions (`.github/workflows/secret-scan.yml`) on every push and pull request to the default branch. If a secret is detected, the workflow fails so it can be fixed before merge.
- **Pre-commit (optional)**: For an extra safety net locally, you can install [gitleaks](https://github.com/gitleaks/gitleaks#installation) and run `gitleaks detect --no-git --verbose` before committing, or add it as a pre-commit hook.

## Reporting a vulnerability

If you discover a security issue, please report it responsibly (e.g. via a private security advisory or contact the maintainers) rather than opening a public issue with sensitive details.
