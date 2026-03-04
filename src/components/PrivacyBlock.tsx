export default function PrivacyBlock() {
  return (
    <div className="card border-[var(--color-secondary)]/30 p-6">
      <h3
        className="font-bold text-[var(--color-secondary)]"
        style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
      >
        🔐 Your Privacy is Protected by Quantum-Resistant Technology
      </h3>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Your identity is never linked to your investment. Abelian&apos;s QDay chain provides:
      </p>
      <ul className="mt-3 space-y-1 text-sm text-[var(--color-muted)]">
        <li>• Zero-knowledge ownership proofs</li>
        <li>• Quantum-resistant cryptography</li>
        <li>• Anonymous wallet addresses</li>
        <li>• On-chain anonymity — no KYC exposure</li>
      </ul>
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        Tenantshield never knows who you are. Tokens linked to wallet address only.
      </p>
    </div>
  );
}
