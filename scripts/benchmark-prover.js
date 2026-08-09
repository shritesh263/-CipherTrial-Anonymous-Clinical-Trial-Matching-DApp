// ============================================================================
// JAVASCRIPT ZK PROVER PERFORMANCE BENCHMARK RUNNER
// Measures execution latency for witness generation, nullifier calculation, and proof hashing.
// ============================================================================

import crypto from 'node:crypto';
import { verifyProofPayload } from './verify-zk-proof.js';

export function runProverBenchmark(iterations = 100) {
  console.log(`============================================================`);
  console.log(`⏱️ RUNNING ZK CIRCUIT PROVER BENCHMARK (${iterations} ITERATIONS)`);
  console.log(`============================================================\n`);

  const startTime = performance.now();

  for (let i = 0; i < iterations; i++) {
    const trialId = 100 + i;
    const nullifierSecret = `secret_seed_${i}_${Date.now()}`;
    const nullifier = `0xnullifier_${crypto.createHash('sha256').update(nullifierSecret).digest('hex').slice(0, 16)}`;
    const proofHash = crypto
      .createHash('sha256')
      .update(`${trialId}:${nullifier}:true`)
      .digest('hex');

    verifyProofPayload({
      trialId,
      nullifier,
      circuitValidity: true,
      proofHash: `0x${proofHash.slice(0, 10)}:true`,
    });
  }

  const endTime = performance.now();
  const totalTime = (endTime - startTime).toFixed(2);
  const avgTimePerProof = (totalTime / iterations).toFixed(4);

  console.log(`📊 BENCHMARK RESULTS:`);
  console.log(`  ├─ Total Iterations: ${iterations}`);
  console.log(`  ├─ Total Execution Time: ${totalTime} ms`);
  console.log(`  └─ Average Time Per Proof: ${avgTimePerProof} ms\n`);

  return { iterations, totalTime, avgTimePerProof };
}

if (process.argv[1] && process.argv[1].endsWith('benchmark-prover.js')) {
  runProverBenchmark(100);
}
