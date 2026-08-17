// ============================================================================
// MIDNIGHT COMPACT CONTRACT INTERFACE & CLIENT RUNTIME
// Bridge module powering CipherTrial DApp with Compact 0.23 contract circuits
// ============================================================================

import {
  midnightContractEngine,
  witnessProvider,
  CompactTrialRecord,
  PatientPrivateWitness,
  CompactProofResult,
  CompactVerificationRecord,
} from '../midnight';
import { MIDNIGHT_PREPROD_CONFIG, NetworkId } from '../config/network';

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

export type ProofGenerationResult = CompactProofResult;

export interface VerificationRecord {
  proofHash: string;
  trialId: bigint;
  nullifier: string;
  isValid: boolean;
  timestamp: number;
  network: NetworkId;
}

export class CompactTrialContractSimulator {
  public registerSponsor(sponsorPk: string): void {
    midnightContractEngine.authorizeSponsor(sponsorPk);
  }

  public isSponsorAuthorized(sponsorPk: string): boolean {
    return midnightContractEngine.isSponsorAuthorized(sponsorPk);
  }

  public registerTrial(rules: TrialRules): void {
    midnightContractEngine.registerTrial({
      trialId: rules.trialId.toString(),
      sponsorKey: rules.sponsorPk,
      sponsorName: rules.sponsorName,
      trialName: rules.trialName,
      minAge: rules.minAge,
      maxAge: rules.maxAge,
      requiredConditionCode: rules.requiredConditionCode,
      requiredConditionName: rules.requiredConditionName,
      excludedMedCode: rules.excludedMedicationCode,
      excludedMedName: rules.excludedMedicationName,
    });
  }

  public async submitEligibilityProof(
    trialId: bigint,
    witness: PatientWitness
  ): Promise<ProofGenerationResult> {
    const compactWitness: PatientPrivateWitness = {
      patientAge: witness.patientAge,
      patientConditionCode: witness.patientConditionCode,
      patientMedCode: witness.patientMedicationCode,
      patientNullifierSeed: witness.patientNullifierSecret,
    };

    return await midnightContractEngine.submitEligibilityProof(trialId.toString(), compactWitness);
  }

  public verifyEligibility(
    trialId: bigint,
    proofHash: string,
    nullifier: string
  ): VerificationRecord {
    midnightContractEngine.verifyAndRecord(trialId.toString(), proofHash, nullifier);

    return {
      proofHash,
      trialId,
      nullifier,
      isValid: true,
      timestamp: Date.now(),
      network: MIDNIGHT_PREPROD_CONFIG.networkId,
    };
  }

  public optInReveal(trialId: bigint, encryptedContactInfo: string): void {
    midnightContractEngine.optInReveal(trialId.toString());
  }

  public getAllTrials(): TrialRules[] {
    const compactList = midnightContractEngine.getAllTrials();
    return compactList.map((t) => ({
      trialId: BigInt(t.trialId),
      trialName: t.trialName,
      sponsorPk: t.sponsorKey,
      sponsorName: t.sponsorName,
      minAge: t.minAge,
      maxAge: t.maxAge,
      requiredConditionCode: t.requiredConditionCode,
      requiredConditionName: t.requiredConditionName,
      excludedMedicationCode: t.excludedMedCode,
      excludedMedicationName: t.excludedMedName,
      active: t.isActive,
      createdAt: t.createdAt,
    }));
  }

  public getTrial(trialId: bigint): TrialRules | undefined {
    const all = this.getAllTrials();
    return all.find((t) => t.trialId === trialId);
  }

  public getMatchedCount(trialId: bigint): number {
    return midnightContractEngine.getMatchedCount(trialId.toString());
  }

  public getOptInCount(trialId: bigint): number {
    return midnightContractEngine.getOptInCount(trialId.toString());
  }

  public getVerificationRecord(proofHash: string): VerificationRecord | undefined {
    const rec = midnightContractEngine.getVerificationRecord(proofHash);
    if (!rec) return undefined;
    return {
      proofHash: rec.proofHash,
      trialId: BigInt(rec.trialId),
      nullifier: rec.nullifier,
      isValid: rec.isValid,
      timestamp: rec.timestamp,
      network: MIDNIGHT_PREPROD_CONFIG.networkId,
    };
  }
}

export const contractSimulator = new CompactTrialContractSimulator();
