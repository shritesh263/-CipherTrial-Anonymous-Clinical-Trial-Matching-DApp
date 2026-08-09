// ============================================================================
// RUST ZK PROVER LIBRARY FOR MIDNIGHT COMPACT CIRCUITS
// High-performance native Rust off-chain witness calculation and ZK verifier
// ============================================================================

pub mod nullifier;
pub mod verifier;
pub mod witness_prover;

pub use nullifier::generate_nullifier;
pub use verifier::verify_compact_proof;
pub use witness_prover::{PatientWitness, TrialRules, ZkProofResult};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_eligible_witness_evaluation() {
        let rules = TrialRules {
            trial_id: 101,
            min_age: 18,
            max_age: 65,
            req_condition_code: 101,
            excl_medication_code: 501,
        };

        let witness = PatientWitness {
            patient_age: 35,
            condition_code: 101,
            medication_code: 0,
            secret_seed: "test_secret_seed_999".to_string(),
        };

        let result = witness_prover::evaluate_and_prove(&rules, &witness).unwrap();
        assert!(result.is_eligible);
        assert!(result.proof_hash.starts-with("0xzk_rust_proof_"));
    }

    #[test]
    fn test_ineligible_witness_evaluation() {
        let rules = TrialRules {
            trial_id: 101,
            min_age: 18,
            max_age: 65,
            req_condition_code: 101,
            excl_medication_code: 501,
        };

        let witness = PatientWitness {
            patient_age: 70, // Overage
            condition_code: 101,
            medication_code: 0,
            secret_seed: "test_secret_seed_999".to_string(),
        };

        let result = witness_prover::evaluate_and_prove(&rules, &witness).unwrap();
        assert!(!result.is_eligible);
    }
}
