// ============================================================================
// WALLET ABSTRACTION LAYER TYPES
// Standardized Provider Registry & Adapter Pattern for Lace and 1AM Wallets
// Midnight Blockchain - Preprod & Preview Network Support
// ============================================================================

import { NetworkId } from '../config/network';

export type WalletType = 'lace' | '1am';

export interface WalletAccount {
  address: string;
  coinPublicKey: string;
  networkId: NetworkId;
  balance: {
    night: bigint;
    dust: bigint;
  };
}

export interface MidnightTransaction {
  txHash: string;
  status: 'submitted' | 'confirmed' | 'failed';
  blockHeight?: number;
  timestamp: number;
}

export interface ProvingProvider {
  generateProof(circuitName: string, publicInputs: any, privateWitness: any): Promise<any>;
}

export interface WalletAdapter {
  id: WalletType;
  name: string;
  icon: string;
  description: string;
  websiteUrl: string;
  isInstalled(): boolean;
  connect(): Promise<WalletAccount>;
  disconnect(): Promise<void>;
  getAccount(): Promise<WalletAccount | null>;
  signAndBalanceTransaction(txData: any): Promise<MidnightTransaction>;
  getProvingProvider(): Promise<ProvingProvider | null>;
}

declare global {
  interface Window {
    midnight?: {
      lace?: any;
      mnLace?: any;
      '1am'?: any;
      oneAm?: any;
      [key: string]: any;
    };
  }
}
