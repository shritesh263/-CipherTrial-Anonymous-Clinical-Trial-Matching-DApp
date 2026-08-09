// ============================================================================
// RUST NULLIFIER GENERATOR
// Cryptographic single-use nullifier calculation using SHA-256 / Poseidon hashing.
// ============================================================================

use sha2::{Digest, Sha256};

/// Generates a pseudonymous single-use nullifier hash: Hash(secret_seed || trial_id)
pub fn generate_nullifier(secret_seed: &str, trial_id: u64) -> String {
    let mut hasher = Sha256::new();
    hasher.update(secret_seed.as_bytes());
    hasher.update(trial_id.to_be_bytes());
    let hash_result = hasher.finalize();
    
    format!("0xnullifier_{}", hex::encode(&hash_result[..16]))
}
