# ViriSIM Verify

Cryptographic verification tool for ViriSIM audit logs.

## What It Does

This tool verifies that a ViriSIM audit log is authentic and has not been tampered with.

It checks:
- **SHA-256 hash** – Confirms the log data (input, output, timestamp) hasn't changed
- **ECDSA signature** – Confirms the log was signed by Virideed

## Requirements

- Node.js (v16 or higher)

## Quick Start

```bash
git clone https://github.com/Virideed/virisim-verify.git
cd virisim-verify
node verify.js
