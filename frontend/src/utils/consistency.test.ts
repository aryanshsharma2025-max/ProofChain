import { checkOcrConsistency } from './consistency.ts';
import type { MatchedCredential } from '../types/index.ts';

const sampleCredential: MatchedCredential = {
  credential_id: 'PC-2026-000001',
  holder_name: 'Jane Doe',
  issuer_name: 'ProofChain Demo University',
};

function runTests() {
  console.log('Running consistency tests...');

  // Test 1: "Holder: Jane Doe" vs "Jane Doe" => MATCH
  {
    const ocrText = 'Credential ID: PC-2026-000001\nHolder: Jane Doe\nIssuer: ProofChain Demo University';
    const report = checkOcrConsistency(ocrText, sampleCredential);
    if (report.holder_name.status !== 'match') {
      throw new Error(`Test 1 Failed: Expected match for holder_name, got ${report.holder_name.status}`);
    }
  }

  // Test 2: "Issuer: ProofChain Demo University" vs exact value => MATCH
  {
    const ocrText = 'Issuer: ProofChain Demo University';
    const report = checkOcrConsistency(ocrText, sampleCredential);
    if (report.issuer_name.status !== 'match') {
      throw new Error(`Test 2 Failed: Expected match for issuer_name, got ${report.issuer_name.status}`);
    }
  }

  // Test 3: Genuinely different value => MISMATCH
  {
    const ocrText = 'Holder: John Smith';
    const report = checkOcrConsistency(ocrText, sampleCredential);
    if (report.holder_name.status !== 'mismatch') {
      throw new Error(`Test 3 Failed: Expected mismatch for holder_name, got ${report.holder_name.status}`);
    }
    if (report.holder_name.found !== 'John Smith') {
      throw new Error(`Test 3 Failed: Expected found to be 'John Smith', got '${report.holder_name.found}'`);
    }
  }

  // Test 4: Absent field => NOT_FOUND
  {
    const ocrText = 'This text has no relevant fields';
    const report = checkOcrConsistency(ocrText, sampleCredential);
    if (report.holder_name.status !== 'not_found') {
      throw new Error(`Test 4 Failed: Expected not_found for holder_name, got ${report.holder_name.status}`);
    }
    if (report.issuer_name.status !== 'not_found') {
      throw new Error(`Test 4 Failed: Expected not_found for issuer_name, got ${report.issuer_name.status}`);
    }
  }

  console.log('✅ All consistency tests passed successfully!');
}

runTests();
