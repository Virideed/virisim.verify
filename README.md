# ViriSIM Verify

Cryptographic verification tool for ViriSIM audit logs.

## What It Does

This tool verifies that a ViriSIM audit log is authentic and has not been tampered with.

It checks:
- **SHA-256 hash** – Confirms the log data (input, output, timestamp) hasn't changed
- **ECDSA signature** – Confirms the log was signed by Virideed

## How to Extract the Data

The verification script uses three fields from the audit log:

| Field | Location in Audit Log |
|-------|----------------------|
| **Input** | `inputAnalysis.originalInput` |
| **Output** | `outputAnalysis.aiGeneratedOutput` |
| **Timestamp** | `governanceIntegrity.capturedAt` |

### Example

```json
{
  "inputAnalysis": {
    "originalInput": "Can you tell me if my neighbor James Wilson..."
  },
  "outputAnalysis": {
    "aiGeneratedOutput": "Okay, let me know..."
  },
  "governanceIntegrity": {
    "capturedAt": "2026-07-04T18:43:07.471Z"
  }
}
```

### Hash and Signature

| Field | Location |
|-------|----------|
| **Hash** | `governanceIntegrity.integrityHash` (remove `"sha256:"` prefix) |
| **Signature** | `governanceIntegrity.signature` |

## Requirements

- Node.js (v16 or higher)

## Quick Start

```bash
git clone https://github.com/Virideed/virisim.verify.git
cd virisim.verify
node verify.js
```

Expected output:

```
Hash: 4562cece001e2c1c4095a5cd62a5247cfc10be5ec0398f694d673da12e6b3f71
Hash match: true
Signature valid: true
```

## Verify Your Own Log

1. Open your audit log JSON file
2. Copy `inputAnalysis.originalInput` → paste in `verify.js` as `input`
3. Copy `outputAnalysis.aiGeneratedOutput` → paste as `output`
4. Copy `governanceIntegrity.capturedAt` → paste as `timestamp`
5. Copy `governanceIntegrity.integrityHash` → remove `"sha256:"` prefix → paste as `expectedHash`
6. Copy `governanceIntegrity.signature` → paste as `signatureBase64`

Then run:

```bash
node verify.js
```

## How the Verification Works

1. The script creates a SHA-256 hash from `input + output + timestamp`
2. It compares the computed hash with the stored hash
3. It verifies the signature using the public key

## Files

| File | Description |
|------|-------------|
| `verify.js` | Main verification script |
| `public_key.pem` | Virideed public key |

---

## 📘 About Virideed

### The Problem

AI is making high-stakes decisions — compliance, regulation, finance, legal. But **no one can independently prove** what the AI did, when, why, or that nothing was tampered with.

Regulators and auditors need verifiable evidence of inputs, outputs, decisions, and chain of custody. Traditional logging is trust-based. You can't verify it independently.

### Our Solution

Virideed provides a **tamper-evident, cryptographically verifiable compliance layer** for AI systems:

- **Cryptographic Evidence Chain** — Every decision is hashed, signed, and timestamped
- **Runtime Guardrails** — Input/output filtering, safety checks, bias detection
- **Regulatory Mapping** — Automatic mapping to EU AI Act, GDPR, ISO, etc.
- **Audit-Ready Reports** — Technical documentation for regulators (Annex IV compliant)
- **Open Verification** — Anyone can verify the evidence chain independently

### Who We Are

We're a compliance technology company founded by experts in AI governance, cryptography, and regulatory tech. Our mission: make AI **trustworthy by default** — not by trusting the provider, but by making every decision **independently verifiable**.

We work with AI providers, enterprises, regulators, and auditors.

### Why It Matters

When an AI affects your business, customers, or regulatory standing — **you need to prove what happened**. Virideed gives you that proof.

---

## Verification Flow

flowchart LR
    A[AI Executes] --> B[Audit Log Created]
    B --> C[Hash Computed]
    C --> D[Stored in ViriSIM]
    D --> E[Regulator Requests Evidence]
    E --> F[Audit JSON Exported]
    F --> G[Hash Verifier Tool]
    G --> H{Hash Matches?}
    H -->|✅| I[Evidence Validated]
    H -->|❌| J[Evidence Tampered]

1. Get Your Audit JSON — Download from ViriSIM dashboard
2. Verify the Hash — Tool checks if audit was tampered
3. Verify the Chain — Each audit links to previous, creating verifiable custody
4. Submit to Regulators — Provide verified audit and results

Any tampering breaks the hash and is immediately detectable.

---

## 📬 Contact

- **Website:** [virideed.com](https://virideed.com)
- **Email:** [support@virideed.com](mailto:support@virideed.com)
- **Issues:** [GitHub Issues](https://github.com/Virideed/virisim-hash-verify/issues)

---

## License

MIT
