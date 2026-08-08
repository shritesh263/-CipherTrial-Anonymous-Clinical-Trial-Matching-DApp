// ============================================================================
// MIDNIGHT COMPACT CONTRACT DEVNET & ZK SUITE TEST SCRIPT
// Run with: npx tsx scripts/test-devnet.ts
// Target Networks: Midnight PREPROD & PREVIEW Network
// ============================================================================

import { CompactTrialContractSimulator } from '../src/contracts/simulator.ts';
import { MIDNIGHT_PREPROD_CONFIG, MIDNIGHT_PREVIEW_CONFIG } from '../src/config/network.ts';

async function runDevnetTestSuite() {
  console.log("\n============================================================");
  console.log("🧪 RUNNING CIPHERTRIAL COMPACT CONTRACT TEST SUITE");
  console.log(`📡 TARGET NETWORKS: ${MIDNIGHT_PREPROD_CONFIG.networkName} & ${MIDNIGHT_PREVIEW_CONFIG.networkName}`);
  console.log(`🔗 PREPROD RPC: ${MIDNIGHT_PREPROD_CONFIG.rpcEndpoint}`);
  console.log(`🔗 PREVIEW RPC: ${MIDNIGHT_PREVIEW_CONFIG.rpcEndpoint}`);
  console.log("============================================================\n");

  const contract = new CompactTrialContractSimulator();
  let testsPassed = 0;
  let testsFailed = 0;

  function assertTest(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      if (detail) console.log(`     └─ ${detail}`);
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      if (detail) console.error(`     └─ ${detail}`);
      testsFailed++;
    }
  }

  // --------------------------------------------------------------------------
  // TEST 1: Sponsor Authorization Registry
  // --------------------------------------------------------------------------
  console.log("1️⃣ Testing Sponsor Authorization Registry (Circuit 0)");
  const sponsorPk = "0x89a1c2d3e4f567890123456789abcdef0123456789abcdef0123456789abcdef";
  contract.registerSponsor(sponsorPk);
  assertTest(
    contract.isSponsorAuthorized(sponsorPk),
    "Authorized Sponsor Registration",
    `Sponsor PK ${sponsorPk.slice(0, 12)}... registered in authorized registry.`
  );

  const fakeSponsorPk = "0xfake000000000000000000000000000000000000000000000000000000000000";
  assertTest(
    !contract.isSponsorAuthorized(fakeSponsorPk),
    "Unauthorized Sponsor Rejection Check",
    "Unregistered sponsor is correctly identified as unauthorized."
  );

  // --------------------------------------------------------------------------
  // TEST 2: Register Trial (Circuit 1)
  // --------------------------------------------------------------------------
  console.log("\n2️⃣ Testing Register Trial (Circuit 1)");
  const trialId = 201n;
  contract.registerTrial({
    trialId,
    trialName: "Phase III Pediatric & Adult Oncology Study",
    sponsorPk,
    sponsorName: "BioGen Research Institute",
    minAge: 18,
    maxAge: 65,
    requiredConditionCode: 101, // Severe Asthma
    requiredConditionName: "Severe Asthma (ICD-10 J45.9)",
    excludedMedicationCode: 501, // Immunosuppressants
    excludedMedicationName: "High-Dose Immunosuppressants (Rx 501)",
    active: true,
    createdAt: Date.now(),
  });

  const trialOnChain = contract.getTrial(trialId);
  assertTest(
    trialOnChain !== undefined && trialOnChain.trialId === trialId,
    "Trial Rules Ledger Registration",
    `Trial ID #${trialId} published to ledger with age range [18-65], condition #101, excluded med #501.`
  );

  // Test registerTrial with unauthorized sponsor
  try {
    contract.registerTrial({
      trialId: 999n,
      trialName: "Unauthorized Trial",
      sponsorPk: fakeSponsorPk,
      sponsorName: "Fake Org",
      minAge: 18,
      maxAge: 50,
      requiredConditionCode: 101,
      requiredConditionName: "Asthma",
      excludedMedicationCode: 501,
      excludedMedicationName: "Med",
      active: true,
      createdAt: Date.now(),
    });
    assertTest(false, "Unauthorized Sponsor Trial Registration Rejection", "FAILED: Should have thrown error");
  } catch (err: any) {
    assertTest(
      err.message.includes("UNAUTHORIZED_SPONSOR"),
      "Unauthorized Sponsor Trial Registration Rejection",
      "Correctly blocked unauthorized sponsor from publishing trial rules."
    );
  }

  // --------------------------------------------------------------------------
  // TEST 3: Eligible Patient ZK Proof Submission (Circuit 2 & 3)
  // --------------------------------------------------------------------------
  console.log("\n3️⃣ Testing Eligible Patient ZK Proof Generation & Verification");
  const eligibleWitness = {
    patientAge: 35, // Boundary test: 18 <= 35 <= 65
    patientConditionCode: 101, // Matches required condition
    patientMedicationCode: 0, // No excluded medication
    patientNullifierSecret: "0xpatient_secret_nullifier_seed_101",
  };

  const proofResult = await contract.submitEligibilityProof(trialId, eligibleWitness);
  assertTest(
    proofResult.isEligible === true && proofResult.proofHash !== undefined,
    "Patient Local ZK Proof Generation",
    `Proof Hash: ${proofResult.proofHash.slice(0, 18)}..., Nullifier: ${proofResult.nullifier.slice(0, 18)}...`
  );

  const verificationRecord = contract.verifyEligibility(trialId, proofResult.proofHash, proofResult.nullifier);
  assertTest(
    verificationRecord.isValid === true && contract.getMatchedCount(trialId) === 1,
    "On-Chain Eligibility Verification & Aggregate Pool Increment",
    `Matched pool count incremented to ${contract.getMatchedCount(trialId)}.`
  );

  // --------------------------------------------------------------------------
  // TEST 4: Edge Case Boundary Tests (Ineligible Patients)
  // --------------------------------------------------------------------------
  console.log("\n4️⃣ Testing Edge Cases & Ineligible Witness Attributes");

  // Edge Case A: Boundary Age Below Minimum (Age 17 vs Min 18)
  try {
    await contract.submitEligibilityProof(trialId, {
      ...eligibleWitness,
      patientAge: 17,
    });
    assertTest(false, "Underage Patient Rejection (Age 17 < Min 18)");
  } catch (err: any) {
    assertTest(
      err.message.includes("ELIGIBILITY_FAILED"),
      "Underage Patient Rejection (Age 17 < Min 18)",
      "Underage witness correctly failed ZK circuit constraint."
    );
  }

  // Edge Case B: Boundary Age Above Maximum (Age 66 vs Max 65)
  try {
    await contract.submitEligibilityProof(trialId, {
      ...eligibleWitness,
      patientAge: 66,
    });
    assertTest(false, "Overage Patient Rejection (Age 66 > Max 65)");
  } catch (err: any) {
    assertTest(
      err.message.includes("ELIGIBILITY_FAILED"),
      "Overage Patient Rejection (Age 66 > Max 65)",
      "Overage witness correctly failed ZK circuit constraint."
    );
  }

  // Edge Case C: Mismatched Condition Code (Code 102 vs Req 101)
  try {
    await contract.submitEligibilityProof(trialId, {
      ...eligibleWitness,
      patientConditionCode: 102,
    });
    assertTest(false, "Mismatched Condition Rejection");
  } catch (err: any) {
    assertTest(
      err.message.includes("ELIGIBILITY_FAILED"),
      "Mismatched Condition Rejection",
      "Wrong condition code correctly failed ZK circuit constraint."
    );
  }

  // Edge Case D: Excluded Medication Match (Med 501 vs Excluded 501)
  try {
    await contract.submitEligibilityProof(trialId, {
      ...eligibleWitness,
      patientMedicationCode: 501,
    });
    assertTest(false, "Excluded Medication Rejection");
  } catch (err: any) {
    assertTest(
      err.message.includes("ELIGIBILITY_FAILED"),
      "Excluded Medication Rejection",
      "Excluded medication match correctly failed ZK circuit constraint."
    );
  }

  // --------------------------------------------------------------------------
  // TEST 5: Voluntary Opt-In Reveal Circuit (Circuit 4)
  // --------------------------------------------------------------------------
  console.log("\n5️⃣ Testing Voluntary Patient Opt-In Reveal (Circuit 4)");
  const encryptedContact = "0xencrypted_patient_contact_info_bytes_999";
  contract.optInReveal(trialId, encryptedContact);
  assertTest(
    contract.getOptInCount(trialId) === 1,
    "Patient Opt-In Reveal Circuit Execution",
    `Opt-In count for Trial #${trialId} successfully updated to 1.`
  );

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log("\n============================================================");
  console.log(`📊 TEST SUITE SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log("============================================================\n");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runDevnetTestSuite().catch(console.error);
