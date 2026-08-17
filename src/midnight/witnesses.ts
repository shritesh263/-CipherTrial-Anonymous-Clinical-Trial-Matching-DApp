// ============================================================================
// MIDNIGHT COMPACT WITNESS PROVIDER
// Implements local off-chain witness extraction for Compact ZK circuits.
// Private patient health attributes are loaded strictly from browser memory/storage
// and never transmitted over network or written to ledger.
// ============================================================================

import { PatientPrivateWitness, MidnightWitnessContext } from './types';

const VAULT_STORAGE_KEY = 'ciphertrial_encrypted_patient_vault';

export class CompactWitnessProvider implements MidnightWitnessContext {
  private currentWitness: PatientPrivateWitness | null = null;
  private currentSponsorKey: string = '';

  constructor() {
    this.loadWitnessFromLocalVault();
  }

  public setWitness(witness: PatientPrivateWitness): void {
    this.currentWitness = { ...witness };
    this.persistToLocalVault(witness);
  }

  public setSponsorKey(sponsorKey: string): void {
    this.currentSponsorKey = sponsorKey;
  }

  public getWitness(): PatientPrivateWitness | null {
    if (!this.currentWitness) {
      this.loadWitnessFromLocalVault();
    }
    return this.currentWitness;
  }

  // Compact Witness Callbacks:
  public getPatientAge(): number {
    if (!this.currentWitness) {
      throw new Error("WITNESS_NOT_FOUND: Patient age is missing from local witness vault.");
    }
    return this.currentWitness.patientAge;
  }

  public getPatientConditionCode(): number {
    if (!this.currentWitness) {
      throw new Error("WITNESS_NOT_FOUND: Patient condition code is missing from local witness vault.");
    }
    return this.currentWitness.patientConditionCode;
  }

  public getPatientMedCode(): number {
    if (!this.currentWitness) {
      throw new Error("WITNESS_NOT_FOUND: Patient medication code is missing from local witness vault.");
    }
    return this.currentWitness.patientMedCode;
  }

  public getPatientNullifierSeed(): string {
    if (!this.currentWitness?.patientNullifierSeed) {
      // Generate secure 32-byte hex seed if missing
      const randSeed = "0x" + Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      if (this.currentWitness) {
        this.currentWitness.patientNullifierSeed = randSeed;
      }
      return randSeed;
    }
    return this.currentWitness.patientNullifierSeed;
  }

  public getSponsorKey(): string {
    return this.currentSponsorKey || "0x0000000000000000000000000000000000000000000000000000000000000000";
  }

  private persistToLocalVault(witness: PatientPrivateWitness): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(witness));
      }
    } catch {
      // Ignore sessionStorage exceptions
    }
  }

  private loadWitnessFromLocalVault(): void {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const raw = window.sessionStorage.getItem(VAULT_STORAGE_KEY);
        if (raw) {
          this.currentWitness = JSON.parse(raw);
        }
      }
    } catch {
      this.currentWitness = null;
    }
  }
}

export const witnessProvider = new CompactWitnessProvider();
