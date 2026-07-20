#!/usr/bin/env node
/**
 * ViriSIM Verification Tool
 * 
 * Usage:
 *   node auto_verify.js sample_audit.json
 * 
 * The script extracts:
 *   - input: inputAnalysis.originalInput
 *   - output: outputAnalysis.aiGeneratedOutput
 *   - timestamp: governanceIntegrity.capturedAt
 *   - hash: governanceIntegrity.integrityHash (removes "sha256:" prefix)
 *   - signature: governanceIntegrity.signature
 * 
 * Exit codes:
 *   0 - All verifications passed
 *   1 - Verification failed or extraction error
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
    let allPassed = true;
    let foundAny = false;
    
    try {
        // 1. Read the JSON file
        const rawData = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(rawData);
        
        // 2. Get all logs (handle both single log and array)
        let logs = [];
        if (data.logs && Array.isArray(data.logs)) {
            logs = data.logs;
        } else if (data.logId) {
            logs = [data];
        } else {
            console.error('❌ No logs found in the audit file.');
            process.exit(1);
        }
        
        console.log(`📄 Audit Log: ${filePath}`);
        console.log(`📋 Found ${logs.length} log(s) to verify`);
        console.log('');
        
        // 3. Verify each log
        logs.forEach((log, index) => {
            const prefix = logs.length > 1 ? `[Log ${index + 1}/${logs.length}] ` : '';
            console.log(`${prefix}${'='.repeat(50)}`);
            
            const input = log.inputAnalysis?.originalInput;
            const output = log.outputAnalysis?.aiGeneratedOutput;
            const timestamp = log.governanceIntegrity?.capturedAt;
            const hashWithPrefix = log.governanceIntegrity?.integrityHash || '';
            const expectedHash = hashWithPrefix.replace('sha256:', '');
            const signature = log.governanceIntegrity?.signature;
            
            // Validate extraction
            if (!input || !output || !timestamp || !expectedHash || !signature) {
                console.error(`❌ Failed to extract required fields.`);
                console.error(`   input: ${input ? '✅' : '❌'}`);
                console.error(`   output: ${output ? '✅' : '❌'}`);
                console.error(`   timestamp: ${timestamp ? '✅' : '❌'}`);
                console.error(`   integrityHash: ${expectedHash ? '✅' : '❌'}`);
                console.error(`   signature: ${signature ? '✅' : '❌'}`);
                allPassed = false;
                return;
            }
            
            foundAny = true;
            
            console.log(`📋 Input: ${input.substring(0, 100)}${input.length > 100 ? '...' : ''}`);
            console.log(`📋 Output: ${output.substring(0, 100)}${output.length > 100 ? '...' : ''}`);
            console.log(`📋 Timestamp: ${timestamp}`);
            console.log(`📋 Expected Hash: ${expectedHash}`);
            console.log(`📋 Signature: ${signature.substring(0, 50)}...`);
            console.log('');
            
            // 4. Compute SHA-256 hash
            const payload = JSON.stringify({ input, output, timestamp });
            const computedHash = crypto.createHash('sha256').update(payload).digest('hex');
            
            const hashMatch = computedHash === expectedHash;
            
            console.log('🔐 Hash:');
            console.log(`   Computed: ${computedHash}`);
            console.log(`   Expected: ${expectedHash}`);
            console.log(`   Match: ${hashMatch ? '✅ YES' : '❌ NO'}`);
            console.log('');
            
            // 5. Verify ECDSA signature
            const verify = crypto.createVerify('SHA256');
            verify.update(payload);
            verify.end();
            
            const isValid = verify.verify(publicKeyPem, signature, 'base64');
            
            console.log('✍️ Signature:');
            console.log(`   Valid: ${isValid ? '✅ YES' : '❌ NO'}`);
            console.log('');
            
            // 6. Individual log result
            if (hashMatch && isValid) {
                console.log(`✅ LOG ${index + 1} VERIFICATION PASSED`);
                console.log(`   The signed operational payload (input, output, timestamp) is authentic and unchanged.`);
                console.log(`   Note: Derived governance fields are outside the signature scope.`);
            } else {
                console.log(`❌ LOG ${index + 1} VERIFICATION FAILED`);
                if (!hashMatch) {
                    console.log(`   The input, output or timestamp has been tampered with (hash mismatch).`);
                }
                if (!isValid) {
                    console.log(`   The signature is invalid.`);
                }
                allPassed = false;
            }
            console.log('');
        });
        
        // 7. Summary
        console.log('='.repeat(50));
        if (!foundAny) {
            console.log('❌ No valid logs found to verify.');
            process.exit(1);
        } else if (allPassed) {
            console.log(`✅ ALL ${logs.length} VERIFICATION(S) PASSED`);
            console.log('   All signed operational payloads are authentic and unchanged.');
            process.exit(0);
        } else {
            console.log(`❌ VERIFICATION FAILED`);
            console.log('   One or more logs failed verification.');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('   Usage: node auto_verify.js <audit_log.json>');
        process.exit(1);
    }
}

// ============================================================
// RUN
// ============================================================

const filePath = process.argv[2];
if (!filePath) {
    console.error('❌ Please provide an audit log JSON file.');
    console.error('   Usage: node auto_verify.js sample_audit.json');
    process.exit(1);
} else {
    verifyAuditLog(filePath);
}
