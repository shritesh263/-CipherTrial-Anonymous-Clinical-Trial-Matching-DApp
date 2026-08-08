// ============================================================================
// MIDNIGHT NETWORK PROVIDER CONTEXT
// Target Networks: Midnight PREPROD Network & Midnight PREVIEW Network
// Handles network selection, ledger state queries, and ZK proof verification.
// ============================================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MIDNIGHT_NETWORKS, NetworkConfig, NetworkId } from '../config/network';
import {
  contractSimulator,
  TrialRules,
  PatientWitness,
  ProofGenerationResult,
  VerificationRecord,
} from '../contracts/simulator';

interface MidnightContextType {
  networkConfig: NetworkConfig;
  activeNetworkId: NetworkId;
  switchNetwork: (networkId: NetworkId) => void;
  trials: TrialRules[];
  sponsorAuthorized: boolean;
  refreshTrials: () => void;
  registerSponsor: (sponsorPk: string) => Promise<void>;
  checkSponsorAuthorization: (sponsorPk: string) => boolean;
  createTrial: (rules: Omit<TrialRules, 'active' | 'createdAt'>) => Promise<TrialRules>;
  generateAndSubmitProof: (trialId: bigint, witness: PatientWitness) => Promise<ProofGenerationResult>;
  verifyProofOnChain: (trialId: bigint, proofHash: string, nullifier: string) => Promise<VerificationRecord>;
  optInContactReveal: (trialId: bigint, encryptedContactInfo: string) => Promise<void>;
  getMatchedCount: (trialId: bigint) => number;
  getOptInCount: (trialId: bigint) => number;
  lastVerificationRecord: VerificationRecord | null;
}

const MidnightContext = createContext<MidnightContextType | undefined>(undefined);

export const MidnightProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeNetworkId, setActiveNetworkId] = useState<NetworkId>('preprod');
  const [trials, setTrials] = useState<TrialRules[]>([]);
  const [lastVerificationRecord, setLastVerificationRecord] = useState<VerificationRecord | null>(null);

  const networkConfig = MIDNIGHT_NETWORKS[activeNetworkId];

  const switchNetwork = (networkId: NetworkId) => {
    setActiveNetworkId(networkId);
    refreshTrials();
  };

  const refreshTrials = () => {
    const list = contractSimulator.getAllTrials();
    setTrials([...list]);
  };

  useEffect(() => {
    refreshTrials();
  }, [activeNetworkId]);

  const registerSponsor = async (sponsorPk: string) => {
    contractSimulator.registerSponsor(sponsorPk);
    refreshTrials();
  };

  const checkSponsorAuthorization = (sponsorPk: string): boolean => {
    return contractSimulator.isSponsorAuthorized(sponsorPk);
  };

  const createTrial = async (rules: Omit<TrialRules, 'active' | 'createdAt'>): Promise<TrialRules> => {
    const fullRules: TrialRules = {
      ...rules,
      active: true,
      createdAt: Date.now(),
    };
    contractSimulator.registerTrial(fullRules);
    refreshTrials();
    return fullRules;
  };

  const generateAndSubmitProof = async (
    trialId: bigint,
    witness: PatientWitness
  ): Promise<ProofGenerationResult> => {
    const result = await contractSimulator.submitEligibilityProof(trialId, witness);
    return result;
  };

  const verifyProofOnChain = async (
    trialId: bigint,
    proofHash: string,
    nullifier: string
  ): Promise<VerificationRecord> => {
    const record = contractSimulator.verifyEligibility(trialId, proofHash, nullifier);
    setLastVerificationRecord(record);
    refreshTrials();
    return record;
  };

  const optInContactReveal = async (trialId: bigint, encryptedContactInfo: string): Promise<void> => {
    contractSimulator.optInReveal(trialId, encryptedContactInfo);
    refreshTrials();
  };

  const getMatchedCount = (trialId: bigint): number => {
    return contractSimulator.getMatchedCount(trialId);
  };

  const getOptInCount = (trialId: bigint): number => {
    return contractSimulator.getOptInCount(trialId);
  };

  return (
    <MidnightContext.Provider
      value={{
        networkConfig,
        activeNetworkId,
        switchNetwork,
        trials,
        sponsorAuthorized: true,
        refreshTrials,
        registerSponsor,
        checkSponsorAuthorization,
        createTrial,
        generateAndSubmitProof,
        verifyProofOnChain,
        optInContactReveal,
        getMatchedCount,
        getOptInCount,
        lastVerificationRecord,
      }}
    >
      {children}
    </MidnightContext.Provider>
  );
};

export const useMidnight = (): MidnightContextType => {
  const context = useContext(MidnightContext);
  if (!context) {
    throw new Error('useMidnight must be used within a MidnightProvider');
  }
  return context;
};
