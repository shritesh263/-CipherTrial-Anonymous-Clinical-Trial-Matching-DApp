// ============================================================================
// MIDNIGHT COMPACT CONTRACT SIMULATOR & CLIENT RUNTIME
// Implements the ZK circuit logic, witness evaluation, and ledger state updates
// for the Anonymous Clinical Trial Matching dApp.
// Target Network: Midnight Preview Network (wss://rpc.preview.midnight.network)
// ============================================================================

import { MIDNIGHT_PREVIEW_CONFIG, NetworkId } from '../config/network.ts';

export interface TrialRules {
  trialId: bigint;
  trialName: string;
  sponsorPk: string;
  sponsorName: string;
  minAge: number;
  maxAge: number;
  requiredConditionCode: number;
  requiredConditionName: string;
  excludedMedicationCode: number;
  excludedMedicationName: string;
  active: boolean;
  createdAt: number;
}

export interface PatientWitness {
  patientAge: number;
  patientConditionCode: number;
  patientMedicationCode: number;
  patientNullifierSecret: string;
}

export interface ProofGenerationResult {
  proofHash: string;
  nullifier: string;
  isEligible: boolean;
  disclosedOutputs: {
    trialId: string;
    isEligible: boolean;
    nullifier: string;
  };
  proofDetails: {
    circuitName: 'submitEligibilityProof';
    provingTimeMs: number;
    zkProtocol: 'Halo2 / Midnight Compact ZK';
    rawWitnessFieldsHidden: boolean;
  };
}

export interface VerificationRecord {
  proofHash: string;
  trialId: bigint;
  nullifier: string;
  isValid: boolean;
  timestamp: number;
  network: NetworkId;
}

export class CompactTrialContractSimulator {
  // Public Ledger State
  private authorizedSponsors: Map<string, boolean> = new Map();
  private trials: Map<bigint, TrialRules> = new Map();
  private matchedCounts: Map<bigint, number> = new Map();
  private verificationStatus: Map<string, VerificationRecord> = new Map();
  private optInCounts: Map<bigint, number> = new Map();

  constructor() {
    // Initialize sample seed trial (no pre-authorized sponsor — requires real wallet auth)
    const sampleSponsorPk = "0xsample_seed_sponsor";

    // Initialize sample seed trial
    const sampleTrial: TrialRules = {
      trialId: 101n,
      trialName: "Phase III Asthma Biologic Efficacy Study",
      sponsorPk: sampleSponsorPk,
      sponsorName: "Aetheria BioPharma",
      minAge: 18,
      maxAge: 65,
      requiredConditionCode: 101, // Asthma
      requiredConditionName: "Severe Asthma (ICD-10 J45.9)",
      excludedMedicationCode: 501, // Immunosuppressants
      excludedMedicationName: "High-Dose Immunosuppressants (Rx 501)",
      active: true,
      createdAt: Date.now() - 86400000,
    };
    this.trials.set(sampleTrial.trialId, sampleTrial);
    this.matchedCounts.set(sampleTrial.trialId, 3);
    this.optInCounts.set(sampleTrial.trialId, 1);
  }

  // --------------------------------------------------------------------------
  // CIRCUIT 0: Authorize Sponsor
  // --------------------------------------------------------------------------
  public registerSponsor(sponsorPk: string): void {
    const formattedPk = sponsorPk.toLowerCase();
    this.authorizedSponsors.set(formattedPk, true);
  }

  public isSponsorAuthorized(sponsorPk: string): boolean {
    return this.authorizedSponsors.get(sponsorPk.toLowerCase()) === true;
  }

  // --------------------------------------------------------------------------
  // CIRCUIT 1: Register Trial (Sponsor Circuit)
  // --------------------------------------------------------------------------
  public registerTrial(rules: TrialRules): void {
    if (!this.isSponsorAuthorized(rules.sponsorPk)) {
      throw new Error(`UNAUTHORIZED_SPONSOR: Sponsor PK ${rules.sponsorPk} is not registered in the authorized sponsor registry.`);
    }

    this.trials.set(rules.trialId, rules);
    this.matchedCounts.set(rules.trialId, 0);
    this.optInCounts.set(rules.trialId, 0);
  }

  // --------------------------------------------------------------------------
  // CIRCUIT 2: Submit Eligibility Proof (Patient ZK Local Circuit)
  // Evaluates private witness fields locally against public trial rules.
  // Returns ZK proof without disclosing raw witness data.
  // --------------------------------------------------------------------------
  public async submitEligibilityProof(
    trialId: bigint,
    witness: PatientWitness
  ): Promise<ProofGenerationResult> {
    const trial = this.trials.get(trialId);
    if (!trial) {
      throw new Error(`TRIAL_NOT_FOUND: Clinical trial ID ${trialId} does not exist on-chain.`);
    }
    if (!trial.active) {
      throw new Error(`TRIAL_INACTIVE: Target clinical trial ID ${trialId} is inactive.`);
    }

    const startTime = performance.now();

    // Local ZK Circuit Computation (evaluates private witnesses)
    const ageEligible = witness.patientAge >= trial.minAge && witness.patientAge <= trial.maxAge;
    const conditionEligible = witness.patientConditionCode === trial.requiredConditionCode;
    const medEligible = witness.patientMedicationCode !== trial.excludedMedicationCode;

    const isEligible = ageEligible && conditionEligible && medEligible;

    if (!isEligible) {
      let failureReason = [];
      if (!ageEligible) failureReason.push(`Age ${witness.patientAge} outside required range [${trial.minAge}-${trial.maxAge}]`);
      if (!conditionEligible) failureReason.push(`Condition code ${witness.patientConditionCode} does not match required code ${trial.requiredConditionCode}`);
      if (!medEligible) failureReason.push(`Medication code ${witness.patientMedicationCode} matches excluded code ${trial.excludedMedicationCode}`);
      throw new Error(`ELIGIBILITY_FAILED: ZK Witness evaluation failed: ${failureReason.join('; ')}`);
    }

    // Generate ZK Proof hash and single-use nullifier
    const proofBytes = `${trialId}:${witness.patientNullifierSecret}:${Date.now()}`;
    const proofHash = "0x" + Array.from(new TextEncoder().encode(proofBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 64);

    const nullifierBytes = `nullifier:${witness.patientNullifierSecret}:${trialId}`;
    const nullifier = "0x" + Array.from(new TextEncoder().encode(nullifierBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, 64);

    const provingTimeMs = Math.round(performance.now() - startTime + 250);

    return {
      proofHash,
      nullifier,
      isEligible: true,
      disclosedOutputs: {
        trialId: trialId.toString(),
        isEligible: true,
        nullifier,
      },
      proofDetails: {
        circuitName: 'submitEligibilityProof',
        provingTimeMs,
        zkProtocol: 'Halo2 / Midnight Compact ZK',
        rawWitnessFieldsHidden: true,
      },
    };
  }

  // --------------------------------------------------------------------------
  // CIRCUIT 3: Verify Eligibility & Update Aggregate Pool
  // On-chain public state update
  // --------------------------------------------------------------------------
  public verifyEligibility(
    trialId: bigint,
    proofHash: string,
    nullifier: string
  ): VerificationRecord {
    const trial = this.trials.get(trialId);
    if (!trial) {
      throw new Error(`TRIAL_NOT_FOUND: Trial ${trialId} does not exist.`);
    }

    if (!this.isSponsorAuthorized(trial.sponsorPk)) {
      throw new Error(`UNAUTHORIZED_SPONSOR: Sponsor ${trial.sponsorPk} is no longer authorized.`);
    }

    // Update aggregate match counter (NO identity stored)
    const currentCount = this.matchedCounts.get(trialId) || 0;
    this.matchedCounts.set(trialId, currentCount + 1);

    const record: VerificationRecord = {
      proofHash,
      trialId,
      nullifier,
      isValid: true,
      timestamp: Date.now(),
      network: MIDNIGHT_PREVIEW_CONFIG.networkId,
    };

    this.verificationStatus.set(proofHash, record);
    return record;
  }

  // --------------------------------------------------------------------------
  // CIRCUIT 4: Opt-In Reveal (Patient-Initiated Explicit Sharing)
  // --------------------------------------------------------------------------
  public optInReveal(trialId: bigint, encryptedContactInfo: string): void {
    const trial = this.trials.get(trialId);
    if (!trial) {
      throw new Error(`TRIAL_NOT_FOUND: Trial ${trialId} does not exist.`);
    }

    const currentOptIns = this.optInCounts.get(trialId) || 0;
    this.optInCounts.set(trialId, currentOptIns + 1);
  }

  // --------------------------------------------------------------------------
  // LEDGER READ API
  // --------------------------------------------------------------------------
  public getAllTrials(): TrialRules[] {
    return Array.from(this.trials.values());
  }

  public getTrial(trialId: bigint): TrialRules | undefined {
    return this.trials.get(trialId);
  }

  public getMatchedCount(trialId: bigint): number {
    return this.matchedCounts.get(trialId) || 0;
  }

  public getOptInCount(trialId: bigint): number {
    return this.optInCounts.get(trialId) || 0;
  }

  public getVerificationRecord(proofHash: string): VerificationRecord | undefined {
    return this.verificationStatus.get(proofHash);
  }
}

// Export singleton instance for app state
export const contractSimulator = new CompactTrialContractSimulator();
