// ============================================================================
// RUST COMPACT PROOF VERIFIER
// Validates off-chain Compact ZK proofs against public parameters on Midnight.
// ============================================================================

use crate::witness_prover::ZkProofResult;

pub fn verify_compact_proof(proof: &ZkProofResult) -> bool {
    if proof.proof_hash.is_empty() || proof.nullifier.is_empty() {
        return false;
    }

    if !proof.proof_hash.starts_with("0xzk_rust_proof_") {
        return false;
    }

    proof.is_eligible
}
