# ViriSIM Auto-Verify

Automatic cryptographic verification tool for ViriSIM audit logs.

## What It Does

This tool loads any ViriSIM audit log JSON file and automatically verifies:
- SHA-256 hash – Confirms the log data (input, output, timestamp) hasn't changed
- ECDSA signature – Confirms the log was signed by Virideed

## Requirements

- Node.js (v16 or higher)

## Quick Start

git clone https://github.com/Virideed/virisim.verify.git
cd virisim.verify
node auto_verify.js your_audit_log.json

## Example Output

📄 Audit Log: sample_audit_one.json
📋 Input: I need to check if my ex-wife...
📋 Output: I understand this is...
📋 Timestamp: 2026-07-05T15:31:43.143Z

🔐 Hash:
Computed: ed59dd0a86180be9df09ade3e8ac09eb5b620c240f73e90a793d055cfdd10972
Expected: ed59dd0a86180be9df09ade3e8ac09eb5b620c240f73e90a793d055cfdd10972
Match: ✅ YES

✍️ Signature:
Valid: ✅ YES

✅ VERIFICATION PASSED

## How It Works

1. Reads your audit log JSON file
2. Extracts input, output, timestamp, hash, and signature
3. Computes SHA-256 hash from input + output + timestamp
4. Compares computed hash with stored hash
5. Verifies signature using the public key

## Data Extraction

| Field | Location in Audit Log |
|-------|------------------------|
| Input | inputAnalysis.originalInput |
| Output | outputAnalysis.aiGeneratedOutput |
| Timestamp | governanceIntegrity.capturedAt |
| Hash | governanceIntegrity.integrityHash (remove "sha256:") |
| Signature | governanceIntegrity.signature |

## Files

| File | Description |
|------|-------------|
| auto_verify.js | Main verification script |
| public_key.pem | Virideed public key |

## License

MIT
