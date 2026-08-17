// ============================================================================
// MIDNIGHT COMPACT DAPP INTEGRATION TYPES
// Types, Interfaces, and Proof Artifacts for Midnight Blockchain (Compact 0.23)
// ============================================================================

export interface CompactTrialRecord {
  trialId: string;
  sponsorKey: string;
  sponsorName: string;
  trialName: string;
  minAge: number;
  maxAge: number;
  requiredConditionCode: number;
  requiredConditionName: string;
  excludedMedCode: number;
  excludedMedName: string;
  isActive: boolean;
  createdAt: number;
}

export interface PatientPrivateWitness {
  patientAge: number;
  patientConditionCode: number;
  patientMedCode: number;
  patientNullifierSeed: string;
}

export interface CompactProofResult {
  nullifier: string;
  proofHash: string;
  isEligible: boolean;
  circuitName: 'submitEligibilityProof' | 'evaluatePrivateWitness';
  zkProtocol: 'Halo2 / Midnight Compact ZK';
  disclosedOutputs: {
    trialId: string;
    isEligible: boolean;
    nullifier: string;
  };
  proofDetails: {
    circuitName: 'submitEligibilityProof' | 'evaluatePrivateWitness';
    provingTimeMs: number;
    zkProtocol: 'Halo2 / Midnight Compact ZK';
    rawWitnessFieldsHidden: boolean;
  };
  provingTimeMs: number;
  rawWitnessFieldsHidden: true;
}

export interface CompactVerificationRecord {
  proofHash: string;
  trialId: string;
  nullifier: string;
  isValid: boolean;
  timestamp: number;
  blockHeight?: number;
}

export interface MidnightWitnessContext {
  getPatientAge: () => number;
  getPatientConditionCode: () => number;
  getPatientMedCode: () => number;
  getPatientNullifierSeed: () => string;
  getSponsorKey: () => string;
}
