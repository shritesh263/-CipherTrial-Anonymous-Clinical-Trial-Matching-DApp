// ============================================================================
// RUST ZK PROVER CLI BINARY
// Standalone CLI binary to generate ZK proofs for Midnight Compact circuits.
// ============================================================================

use rust_zk_prover::{evaluate_and_prove, PatientWitness, TrialRules};

fn main() {
    println!("============================================================");
    println!("🦀 RUST NATIVE ZERO-KNOWLEDGE PROVER FOR MIDNIGHT COMPACT");
    println!("============================================================");

    let rules = TrialRules {
        trial_id: 201,
        min_age: 18,
        max_age: 65,
        req_condition_code: 101, // Severe Asthma
        excl_medication_code: 501, // Immunosuppressants
    };

    let witness = PatientWitness {
        patient_age: 30,
        condition_code: 101,
        medication_code: 0,
        secret_seed: "0xrust_patient_private_nullifier_seed".to_string(),
    };

    println!("\n📋 Evaluating Patient Witness Attributes in ZK...");
    println!("  ├─ Patient Age: {}", witness.patient_age);
    println!("  ├─ Condition Code: {}", witness.condition_code);
    println!("  └─ Excluded Med Code: {}", witness.medication_code);

    match evaluate_and_prove(&rules, &witness) {
        Ok(result) => {
            println!("\n✅ ZK PROOF GENERATION SUCCESSFUL!");
            println!("  ├─ Eligibility Validity: {}", result.is_eligible);
            println!("  ├─ Proof Hash: {}", result.proof_hash);
            println!("  ├─ Nullifier Hash: {}", result.nullifier);
            println!("  └─ Prover Engine: {}", result.prover_engine);
        }
        Err(err) => {
            eprintln!("\n❌ ZK PROOF GENERATION FAILED: {}", err);
            std::process::exit(1);
        }
    }
}
