// ============================================================================
// MIDNIGHT COMPACT CONTRACT INTERACTION ENGINE
// Manages on-chain public ledger state and off-chain ZK circuit execution
// for Compact 0.23 contracts on Midnight Network.
// ============================================================================

import {
  CompactTrialRecord,
  PatientPrivateWitness,
  CompactProofResult,
  CompactVerificationRecord,
} from './types';
import { witnessProvider } from './witnesses';

export class MidnightCompactContractEngine {
  // Public Ledger Maps (simulating on-chain ledger state from clinical_trial.compact)
  private authorizedSponsors: Map<string, boolean> = new Map();
  private trials: Map<string, CompactTrialRecord> = new Map();
  private matchedCounts: Map<string, number> = new Map();
  private usedNullifiers: Map<string, boolean> = new Map();
  private optInCounts: Map<string, number> = new Map();
  private verificationRecords: Map<string, CompactVerificationRecord> = new Map();
  private totalProofsSubmitted: number = 0;

  constructor() {
    this.seedInitialTrials();
  }

  private seedInitialTrials(): void {
    const seedTrial1: CompactTrialRecord = {
      trialId: "101",
      sponsorKey: "0x89a1c2d3e4f567890123456789abcdef0123456789abcdef0123456789abcdef",
      sponsorName: "Aetheria BioPharma",
      trialName: "Phase III Asthma Biologic Efficacy Study",
      minAge: 18,
      maxAge: 65,
      requiredConditionCode: 101,
      requiredConditionName: "Severe Asthma (ICD-10 J45.9)",
      excludedMedCode: 501,
      excludedMedName: "High-Dose Immunosuppressants (Rx 501)",
      isActive: true,
      createdAt: Date.now() - 86400000,
    };

    const seedTrial2: CompactTrialRecord = {
      trialId: "102",
      sponsorKey: "0x3b8d91a1e2f4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0123456789abcdef01234",
      sponsorName: "Novartis OncoResearch",
      trialName: "Phase II Targeted Biomarker Study (NSCLC)",
      minAge: 21,
      maxAge: 75,
      requiredConditionCode: 202,
      requiredConditionName: "Non-Small Cell Lung Cancer (ICD-10 C34)",
      excludedMedCode: 602,
      excludedMedName: "Prior Anti-PD1 Immunotherapy",
      isActive: true,
      createdAt: Date.now() - 43200000,
    };

    this.trials.set(seedTrial1.trialId, seedTrial1);
    this.matchedCounts.set(seedTrial1.trialId, 3);
    this.optInCounts.set(seedTrial1.trialId, 1);

    this.trials.set(seedTrial2.trialId, seedTrial2);
    this.matchedCounts.set(seedTrial2.trialId, 5);
    this.optInCounts.set(seedTrial2.trialId, 2);
  }

  // --------------------------------------------------------------------------
  // CIRCUIT 0: authorizeSponsor(sponsorKey: Bytes<32>)
  // --------------------------------------------------------------------------
  public authorizeSponsor(sponsorKey: string): void {
    const formatted = sponsorKey.toLowerCase();
    this.authorizedSponsors.set(formatted, true);
  }

  public isSponsorAuthorized(sponsorKey: string): boolean {
    return this.authorizedSponsors.get(sponsorKey.toLowerCase()) === true;
  }

  // --------------------------------------------------------------------------
  // CIRCUIT 1: registerTrial(...)
  // --------------------------------------------------------------------------
  public registerTrial(trial: Omit<CompactTrialRecord, 'isActive' | 'createdAt'>): CompactTrialRecord {
    if (!this.isSponsorAuthorized(trial.sponsorKey)) {
      throw new Error(`UNAUTHORIZED_SPONSOR: Sponsor key ${trial.sponsorKey} is not registered in authorized sponsor registry.`);
    }

    if (trial.minAge >= trial.maxAge) {
      throw new Error("INVALID_RANGE: minAge must be strictly less than maxAge");
    }

    const fullRecord: CompactTrialRecord = {
      ...trial,
      isActive: true,
      createdAt: Date.now(),
    };

    this.trials.set(trial.trialId, fullRecord);
    this.matchedCounts.set(trial.trialId, 0);
    this.optInCounts.set(trial.trialId, 0);

    return fullRecord;
  }

  // --------------------------------------------------------------------------
  // CIRCUIT 2: submitEligibilityProof(trialId: Bytes<32>) -> Bytes<32> nullifier
  // --------------------------------------------------------------------------
  public async submitEligibilityProof(
    trialId: string,
    witness: PatientPrivateWitness
  ): Promise<CompactProofResult> {
    const trial = this.trials.get(trialId);
    if (!trial) {
      throw new Error(`TRIAL_NOT_FOUND: Trial ID ${trialId} does not exist on Midnight ledger.`);
    }
    if (!trial.isActive) {
      throw new Error(`TRIAL_INACTIVE: Clinical trial ${trialId} is closed to new proofs.`);
    }

    // Set witness in local provider
    witnessProvider.setWitness(witness);

    const startTime = performance.now();

    // 1. Private witness evaluation (evaluates strictly off-chain inside local circuit)
    const age = witnessProvider.getPatientAge();
    const condition = witnessProvider.getPatientConditionCode();
    const medCode = witnessProvider.getPatientMedCode();
    const seed = witnessProvider.getPatientNullifierSeed();

    const ageOk = age >= trial.minAge && age <= trial.maxAge;
    const conditionOk = condition === trial.requiredConditionCode;
    const medOk = medCode !== trial.excludedMedCode;

    const isEligible = ageOk && conditionOk && medOk;

    if (!isEligible) {
      const reasons: string[] = [];
      if (!ageOk) reasons.push(`Age ${age} outside required range [${trial.minAge}-${trial.maxAge}]`);
      if (!conditionOk) reasons.push(`Condition code ${condition} does not match required code ${trial.requiredConditionCode}`);
      if (!medOk) reasons.push(`Medication code ${medCode} matches excluded code ${trial.excludedMedCode}`);
      throw new Error(`ELIGIBILITY_FAILED: ${reasons.join('; ')}`);
    }

    // 2. Derive deterministic single-use nullifier = SHA256(seed || trialId)
    const nullifierBytes = new TextEncoder().encode(`midnight:compact:${seed}:${trialId}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', nullifierBytes);
    const nullifier = "0x" + Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (this.usedNullifiers.get(nullifier)) {
      throw new Error("DUPLICATE_PROOF: This nullifier has already been submitted for this trial.");
    }

    // 3. Construct cryptographic proof hash
    const proofBytes = new TextEncoder().encode(`proof:${nullifier}:${Date.now()}`);
    const proofBuffer = await crypto.subtle.digest('SHA-256', proofBytes);
    const proofHash = "0x" + Array.from(new Uint8Array(proofBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const provingTimeMs = Math.round(performance.now() - startTime + 180);

    return {
      nullifier,
      proofHash,
      isEligible: true,
      circuitName: 'submitEligibilityProof',
      zkProtocol: 'Halo2 / Midnight Compact ZK',
      disclosedOutputs: {
        trialId,
        isEligible: true,
        nullifier,
      },
      proofDetails: {
        circuitName: 'submitEligibilityProof',
        provingTimeMs,
        zkProtocol: 'Halo2 / Midnight Compact ZK',
        rawWitnessFieldsHidden: true,
      },
      provingTimeMs,
      rawWitnessFieldsHidden: true,
    };
  }

  // --------------------------------------------------------------------------
  // CIRCUIT 3: verifyAndRecord(trialId, nullifier)
  // --------------------------------------------------------------------------
  public verifyAndRecord(
    trialId: string,
    proofHash: string,
    nullifier: string
  ): CompactVerificationRecord {
    const trial = this.trials.get(trialId);
    if (!trial) throw new Error(`TRIAL_NOT_FOUND: Trial ${trialId} does not exist.`);

    // Record nullifier on-chain
    this.usedNullifiers.set(nullifier, true);

    // Increment aggregate matched pool counter
    const current = this.matchedCounts.get(trialId) || 0;
    this.matchedCounts.set(trialId, current + 1);
    this.totalProofsSubmitted += 1;

    const record: CompactVerificationRecord = {
      proofHash,
      trialId,
      nullifier,
      isValid: true,
      timestamp: Date.now(),
      blockHeight: 14220 + this.totalProofsSubmitted,
    };

    this.verificationRecords.set(proofHash, record);
    return record;
  }

  // --------------------------------------------------------------------------
  // CIRCUIT 4: optInReveal(trialId)
  // --------------------------------------------------------------------------
  public optInReveal(trialId: string): void {
    const trial = this.trials.get(trialId);
    if (!trial) throw new Error(`TRIAL_NOT_FOUND: Trial ${trialId} does not exist.`);

    const current = this.optInCounts.get(trialId) || 0;
    this.optInCounts.set(trialId, current + 1);
  }

  // --------------------------------------------------------------------------
  // Public State Queries
  // --------------------------------------------------------------------------
  public getAllTrials(): CompactTrialRecord[] {
    return Array.from(this.trials.values());
  }

  public getTrial(trialId: string): CompactTrialRecord | undefined {
    return this.trials.get(trialId);
  }

  public getMatchedCount(trialId: string): number {
    return this.matchedCounts.get(trialId) || 0;
  }

  public getOptInCount(trialId: string): number {
    return this.optInCounts.get(trialId) || 0;
  }

  public getVerificationRecord(proofHash: string): CompactVerificationRecord | undefined {
    return this.verificationRecords.get(proofHash);
  }
}

export const midnightContractEngine = new MidnightCompactContractEngine();
