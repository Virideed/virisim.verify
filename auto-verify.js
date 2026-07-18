#!/usr/bin/env node
/**
 * ViriSIM Verification Tool
 * 
 * Usage:
 *   node verify.js sample_audit.json
 * 
 * The script extracts:
 *   - input: inputAnalysis.originalInput
 *   - output: outputAnalysis.aiGeneratedOutput
 *   - timestamp: governanceIntegrity.capturedAt
 *   - hash: governanceIntegrity.integrityHash (removes "sha256:" prefix)
 *   - signature: governanceIntegrity.signature
 */

const fs = require('fs');
const crypto = require('crypto');

// ============================================================
// PUBLIC KEY - Virideed's public key for signature verification
// ============================================================

const publicKeyPem = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEFM59ND8ODb7oW+EfngrLTjRFLhkk
VhPD/Qzr2kXjf9MQJkRSJgNSSCLHHPr5gfqqPEqm6fzlA+7XO52+S2LEqQ==
-----END PUBLIC KEY-----`;

// ============================================================
// MAIN FUNCTION
// ============================================================

function verifyAuditLog(filePath) {
    try {
        // 1. Read the JSON file
        const rawData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(rawData);
        
        // 2. Extract values from the audit log
        const log = data.logs && data.logs.length > 0 ? data.logs[0] : data;
        
        const input = log.inputAnalysis?.originalInput;
        const output = log.outputAnalysis?.aiGeneratedOutput;
        const timestamp = log.governanceIntegrity?.capturedAt;
        const hashWithPrefix = log.governanceIntegrity?.integrityHash || '';
        const expectedHash = hashWithPrefix.replace('sha256:', '');
        const signature = log.governanceIntegrity?.signature;
        
        // 3. Validate extraction
        if (!input || !output || !timestamp || !expectedHash || !signature) {
            console.error('❌ Failed to extract required fields from audit log.');
            console.error('   Required: input, output, timestamp, integrityHash, signature');
            console.error('   Check that the audit log is complete.');
            return;
        }
        
        console.log('📄 Audit Log:', filePath);
        console.log('📋 Input:', input.substring(0, 100) + (input.length > 100 ? '...' : ''));
        console.log('📋 Output:', output.substring(0, 100) + (output.length > 100 ? '...' : ''));
        console.log('📋 Timestamp:', timestamp);
        console.log('📋 Expected Hash:', expectedHash);
        console.log('📋 Signature:', signature.substring(0, 50) + '...');
        console.log('');
        
        // 4. Compute SHA-256 hash
        const payload = JSON.stringify({ input, output, timestamp });
        const computedHash = crypto.createHash('sha256').update(payload).digest('hex');
        
        console.log('🔐 Hash:');
        console.log('   Computed:', computedHash);
        console.log('   Expected:', expectedHash);
        console.log('   Match:', computedHash === expectedHash ? '✅ YES' : '❌ NO');
        console.log('');
        
        // 5. Verify ECDSA signature
        const verify = crypto.createVerify('SHA256');
        verify.update(payload);
        verify.end();
        
        const isValid = verify.verify(publicKeyPem, signature, 'base64');
        
        console.log('✍️ Signature:');
        console.log('   Valid:', isValid ? '✅ YES' : '❌ NO');
        console.log('');
        
        // 6. Summary
        console.log('='.repeat(50));
        if (computedHash === expectedHash && isValid) {
            console.log('✅ VERIFICATION PASSED');
            console.log('   The audit log is authentic and has not been tampered with.');
        } else {
            console.log('❌ VERIFICATION FAILED');
            console.log('   The audit log may have been tampered with or is not authentic.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('   Usage: node verify.js <audit_log.json>');
    }
}

// ============================================================
// RUN
// ============================================================

const filePath = process.argv[2];
if (!filePath) {
    console.error('❌ Please provide an audit log JSON file.');
    console.error('   Usage: node verify.js sample_audit.json');
} else {
    verifyAuditLog(filePath);
}
