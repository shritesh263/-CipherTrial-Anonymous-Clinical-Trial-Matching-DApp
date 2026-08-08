// ============================================================================
// WALLET PROVIDER REGISTRY & ADAPTER MANAGER
// Midnight Blockchain - Preview Network Target
// Detects injected providers (Lace & 1AM), manages selection, and provides fallbacks.
// ============================================================================

import { WalletAdapter, WalletType } from './types';
import { LaceWalletAdapter } from './LaceAdapter';
import { OneAmWalletAdapter } from './OneAmAdapter';

export class WalletRegistry {
  private adapters: Map<WalletType, WalletAdapter> = new Map();

  constructor() {
    this.registerAdapter(new LaceWalletAdapter());
    this.registerAdapter(new OneAmWalletAdapter());
  }

  public registerAdapter(adapter: WalletAdapter): void {
    this.adapters.set(adapter.id, adapter);
  }

  public getAdapter(id: WalletType): WalletAdapter | undefined {
    return this.adapters.get(id);
  }

  public getAllAdapters(): WalletAdapter[] {
    return Array.from(this.adapters.values());
  }

  public getInstalledAdapters(): WalletAdapter[] {
    return this.getAllAdapters().filter(adapter => adapter.isInstalled());
  }

  /**
   * Automatically detects all injected Midnight wallet providers under window.midnight
   */
  public detectInjectedWallets(): { id: WalletType; name: string; installed: boolean }[] {
    return this.getAllAdapters().map(adapter => ({
      id: adapter.id,
      name: adapter.name,
      installed: adapter.isInstalled(),
    }));
  }
}

export const walletRegistry = new WalletRegistry();
