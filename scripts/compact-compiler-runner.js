// ============================================================================
// COMPACT COMPILER HELPER RUNNER
// JavaScript build helper for scanning and validating Compact smart contracts.
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';

const CONTRACTS_DIR = path.resolve(process.cwd(), 'contracts');

export function scanCompactContracts() {
  console.log('🔍 Scanning Compact contracts directory:', CONTRACTS_DIR);

  if (!fs.existsSync(CONTRACTS_DIR)) {
    console.error('❌ Contracts directory not found!');
    return [];
  }

  const files = fs.readdirSync(CONTRACTS_DIR);
  const compactFiles = files.filter((f) => f.endsWith('.compact'));

  console.log(`Found ${compactFiles.length} Compact smart contract(s):`);
  compactFiles.forEach((file, index) => {
    const fullPath = path.join(CONTRACTS_DIR, file);
    const stat = fs.statSync(fullPath);
    console.log(`  ${index + 1}. ${file} (${stat.size} bytes)`);
  });

  return compactFiles;
}

if (process.argv[1] && process.argv[1].endsWith('compact-compiler-runner.js')) {
  scanCompactContracts();
}
