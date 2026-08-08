// ============================================================================
// WALLET PROVIDER CONTEXT
// Handles wallet connection, active wallet selection (Lace vs 1AM),
// account details, transaction balancing & signing.
// ============================================================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletAccount, WalletAdapter, WalletType, MidnightTransaction } from '../wallet/types';
import { walletRegistry } from '../wallet/registry';

interface WalletContextType {
  activeAdapter: WalletAdapter | null;
  account: WalletAccount | null;
  isConnected: boolean;
  isConnecting: boolean;
  availableWallets: WalletAdapter[];
  installedWallets: WalletAdapter[];
  connectWallet: (type: WalletType) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  signAndBalance: (txData: any) => Promise<MidnightTransaction>;
  showWalletModal: boolean;
  setShowWalletModal: (show: boolean) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeAdapter, setActiveAdapter] = useState<WalletAdapter | null>(null);
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const availableWallets = walletRegistry.getAllAdapters();
  const installedWallets = walletRegistry.getInstalledAdapters();

  const connectWallet = async (type: WalletType) => {
    setIsConnecting(true);
    try {
      const adapter = walletRegistry.getAdapter(type);
      if (!adapter) throw new Error(`Wallet adapter ${type} not found.`);

      const acc = await adapter.connect();
      setActiveAdapter(adapter);
      setAccount(acc);
      setShowWalletModal(false);
    } catch (error) {
      console.error(`Failed to connect ${type} wallet:`, error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (activeAdapter) {
      await activeAdapter.disconnect();
      setActiveAdapter(null);
      setAccount(null);
    }
  };

  const signAndBalance = async (txData: any): Promise<MidnightTransaction> => {
    if (!activeAdapter) {
      throw new Error("No wallet connected for transaction signing.");
    }
    return activeAdapter.signAndBalanceTransaction(txData);
  };

  return (
    <WalletContext.Provider
      value={{
        activeAdapter,
        account,
        isConnected: !!account,
        isConnecting,
        availableWallets,
        installedWallets,
        connectWallet,
        disconnectWallet,
        signAndBalance,
        showWalletModal,
        setShowWalletModal,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
