// ============================================================================
// CIPHERTRIAL VITEST TEST SUITE
// Tests all Midnight Compact circuits, witness privacy, and nullifier mechanics
// Target Networks: Midnight Preprod & Preview Testnets
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { CompactTrialContractSimulator } from '../src/contracts/simulator';
import { midnightContractEngine } from '../src/midnight';
import { MIDNIGHT_PREPROD_CONFIG, MIDNIGHT_PREVIEW_CONFIG } from '../src/config/network';

describe('Midnight Health — CipherTrial Compact Contracts & ZK Circuits', () => {
  let contract: CompactTrialContractSimulator;
  const authorizedSponsorPk = "0x89a1c2d3e4f567890123456789abcdef0123456789abcdef0123456789abcdef";
  const unauthorizedSponsorPk = "0xfake000000000000000000000000000000000000000000000000000000000000";
  const testTrialId = 301n;

  beforeEach(() => {
    contract = new CompactTrialContractSimulator();
  });

  // --------------------------------------------------------------------------
  // TEST 1: Circuit 0 — Authorize Sponsor
  // --------------------------------------------------------------------------
  it('1. should register an authorized sponsor in the on-chain sponsor registry', () => {
    contract.registerSponsor(authorizedSponsorPk);
    const isAuth = contract.isSponsorAuthorized(authorizedSponsorPk);
    expect(isAuth).toBe(true);
  });

  // --------------------------------------------------------------------------
  // TEST 2: Circuit 0 — Unauthorized Sponsor Rejection Check
  // --------------------------------------------------------------------------
  it('2. should correctly identify and reject an unregistered sponsor', () => {
    const isAuth = contract.isSponsorAuthorized(unauthorizedSponsorPk);
    expect(isAuth).toBe(false);
  });

  // --------------------------------------------------------------------------
  // TEST 3: Circuit 1 — Register Trial
  // --------------------------------------------------------------------------
  it('3. should allow an authorized sponsor to publish clinical trial eligibility rules', () => {
    contract.registerSponsor(authorizedSponsorPk);

    contract.registerTrial({
      trialId: testTrialId,
      trialName: "Phase III Oncology Biomarker Study",
      sponsorPk: authorizedSponsorPk,
      sponsorName: "Aetheria BioPharma",
      minAge: 18,
      maxAge: 65,
      requiredConditionCode: 101, // Severe Asthma
      requiredConditionName: "Severe Asthma (ICD-10 J45.9)",
      excludedMedicationCode: 501, // Immunosuppressants
      excludedMedicationName: "High-Dose Immunosuppressants (Rx 501)",
      active: true,
      createdAt: Date.now(),
    });

    const trial = contract.getTrial(testTrialId);
    expect(trial).toBeDefined();
    expect(trial?.trialId).toBe(testTrialId);
    expect(trial?.minAge).toBe(18);
    expect(trial?.maxAge).toBe(65);
    expect(trial?.active).toBe(true);
  });

  // --------------------------------------------------------------------------
  // TEST 4: Circuit 1 — Block Unauthorized Sponsor from Publishing Trial
  // --------------------------------------------------------------------------
  it('4. should reject trial registration from an unauthorized sponsor', () => {
    expect(() => {
      contract.registerTrial({
        trialId: 999n,
        trialName: "Unauthorized Trial",
        sponsorPk: unauthorizedSponsorPk,
        sponsorName: "Unverified Org",
        minAge: 18,
        maxAge: 60,
        requiredConditionCode: 101,
        requiredConditionName: "Asthma",
        excludedMedicationCode: 501,
        excludedMedicationName: "Med",
        active: true,
        createdAt: Date.now(),
      });
    }).toThrow(/UNAUTHORIZED_SPONSOR/);
  });

  // --------------------------------------------------------------------------
  // TEST 5: Circuit 2 & 3 — Eligible Patient ZK Proof Generation & Verification
  // --------------------------------------------------------------------------
  it('5. should generate and verify a ZK proof locally for an eligible patient witness', async () => {
    contract.registerSponsor(authorizedSponsorPk);
    contract.registerTrial({
      trialId: testTrialId,
      trialName: "Phase III Asthma Study",
      sponsorPk: authorizedSponsorPk,
      sponsorName: "Aetheria BioPharma",
      minAge: 18,
      maxAge: 65,
      requiredConditionCode: 101,
      requiredConditionName: "Severe Asthma",
      excludedMedicationCode: 501,
      excludedMedicationName: "Immunosuppressants",
      active: true,
      createdAt: Date.now(),
    });

    const initialMatches = contract.getMatchedCount(testTrialId);

    // Eligible Witness (Age 32, Condition 101, Med 0, Random nullifier secret)
    const witness = {
      patientAge: 32,
      patientConditionCode: 101,
      patientMedicationCode: 0,
      patientNullifierSecret: "0xsecret_patient_seed_alpha_1234567890",
    };

    const proofResult = await contract.submitEligibilityProof(testTrialId, witness);

    expect(proofResult.isEligible).toBe(true);
    expect(proofResult.proofHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(proofResult.nullifier).toMatch(/^0x[a-f0-9]{64}$/);
    expect(proofResult.rawWitnessFieldsHidden).toBe(true);

    // Verify and record on-chain
    const verificationRecord = contract.verifyEligibility(
      testTrialId,
      proofResult.proofHash,
      proofResult.nullifier
    );

    expect(verificationRecord.isValid).toBe(true);
    expect(verificationRecord.trialId).toBe(testTrialId);
    expect(contract.getMatchedCount(testTrialId)).toBe(initialMatches + 1);
  });

  // --------------------------------------------------------------------------
  // TEST 6: Privacy Invariant — Prevent Duplicate Proof Submission
  // --------------------------------------------------------------------------
  it('6. should reject duplicate proof submission with the same nullifier', async () => {
    contract.registerSponsor(authorizedSponsorPk);
    contract.registerTrial({
      trialId: testTrialId,
      trialName: "Phase III Asthma Study",
      sponsorPk: authorizedSponsorPk,
      sponsorName: "Aetheria BioPharma",
      minAge: 18,
      maxAge: 65,
      requiredConditionCode: 101,
      requiredConditionName: "Severe Asthma",
      excludedMedicationCode: 501,
      excludedMedicationName: "Immunosuppressants",
      active: true,
      createdAt: Date.now(),
    });

    const witness = {
      patientAge: 40,
      patientConditionCode: 101,
      patientMedicationCode: 0,
      patientNullifierSecret: "0xunique_nullifier_seed_555",
    };

    // First submission succeeds and is verified on-chain
    const firstProof = await contract.submitEligibilityProof(testTrialId, witness);
    contract.verifyEligibility(testTrialId, firstProof.proofHash, firstProof.nullifier);

    // Duplicate submission with same nullifier secret must fail on-chain
    await expect(contract.submitEligibilityProof(testTrialId, witness)).rejects.toThrow(/DUPLICATE_PROOF/);
  });

  // --------------------------------------------------------------------------
  // TEST 7: ZK Constraint Rejections for Ineligible Patient Witnesses
  // --------------------------------------------------------------------------
  it('7. should reject private witnesses that violate age, condition, or medication constraints', async () => {
    contract.registerSponsor(authorizedSponsorPk);
    contract.registerTrial({
      trialId: testTrialId,
      trialName: "Phase III Asthma Study",
      sponsorPk: authorizedSponsorPk,
      sponsorName: "Aetheria BioPharma",
      minAge: 18,
      maxAge: 65,
      requiredConditionCode: 101,
      requiredConditionName: "Severe Asthma",
      excludedMedicationCode: 501,
      excludedMedicationName: "Immunosuppressants",
      active: true,
      createdAt: Date.now(),
    });

    // Case A: Underage (17 < 18)
    await expect(
      contract.submitEligibilityProof(testTrialId, {
        patientAge: 17,
        patientConditionCode: 101,
        patientMedicationCode: 0,
        patientNullifierSecret: "0xunderage_seed_1",
      })
    ).rejects.toThrow(/ELIGIBILITY_FAILED/);

    // Case B: Overage (66 > 65)
    await expect(
      contract.submitEligibilityProof(testTrialId, {
        patientAge: 66,
        patientConditionCode: 101,
        patientMedicationCode: 0,
        patientNullifierSecret: "0xoverage_seed_2",
      })
    ).rejects.toThrow(/ELIGIBILITY_FAILED/);

    // Case C: Mismatched condition (202 != 101)
    await expect(
      contract.submitEligibilityProof(testTrialId, {
        patientAge: 35,
        patientConditionCode: 202,
        patientMedicationCode: 0,
        patientNullifierSecret: "0xwrong_cond_seed_3",
      })
    ).rejects.toThrow(/ELIGIBILITY_FAILED/);

    // Case D: Excluded medication (501 is excluded)
    await expect(
      contract.submitEligibilityProof(testTrialId, {
        patientAge: 35,
        patientConditionCode: 101,
        patientMedicationCode: 501,
        patientNullifierSecret: "0xexcluded_med_seed_4",
      })
    ).rejects.toThrow(/ELIGIBILITY_FAILED/);
  });

  // --------------------------------------------------------------------------
  // TEST 8: Circuit 4 — Voluntary Patient Opt-In Reveal
  // --------------------------------------------------------------------------
  it('8. should increment trial opt-in counter upon voluntary patient reveal', () => {
    contract.registerSponsor(authorizedSponsorPk);
    contract.registerTrial({
      trialId: testTrialId,
      trialName: "Phase III Asthma Study",
      sponsorPk: authorizedSponsorPk,
      sponsorName: "Aetheria BioPharma",
      minAge: 18,
      maxAge: 65,
      requiredConditionCode: 101,
      requiredConditionName: "Severe Asthma",
      excludedMedicationCode: 501,
      excludedMedicationName: "Immunosuppressants",
      active: true,
      createdAt: Date.now(),
    });

    const initialOptIns = contract.getOptInCount(testTrialId);
    contract.optInReveal(testTrialId, "0xencrypted_contact_payload");
    expect(contract.getOptInCount(testTrialId)).toBe(initialOptIns + 1);
  });
});
