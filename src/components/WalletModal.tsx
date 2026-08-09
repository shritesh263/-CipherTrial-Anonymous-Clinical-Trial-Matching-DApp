import React, { useState } from 'react';
import { useWallet } from '../providers/WalletContext';
import { WalletType } from '../wallet/types';
import { X, CheckCircle2, Shield, ExternalLink, Key, Sparkles, Send, Wallet } from 'lucide-react';

export const WalletModal: React.FC = () => {
  const { availableWallets, connectWallet, isConnecting, showWalletModal, setShowWalletModal } = useWallet();
  const [originalAddressInput, setOriginalAddressInput] = useState('');
  const [customPublicKeyInput, setCustomPublicKeyInput] = useState('');
  const [selectedWalletType, setSelectedWalletType] = useState<WalletType>('custom');

  if (!showWalletModal) return null;

  const handleConnectWallet = (e?: React.FormEvent, typeOverride?: WalletType) => {
    if (e) e.preventDefault();
    const typeToConnect = typeOverride || selectedWalletType;

    // Connect with user's input address if provided
    connectWallet(
      typeToConnect,
      originalAddressInput.trim() || undefined,
      customPublicKeyInput.trim() || undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101415]/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#1d2022] border border-[#44e2cd]/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80">
        
        {/* Close Button */}
        <button
          onClick={() => setShowWalletModal(false)}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#909097] hover:text-[#e0e3e5] hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-[#03c6b2]/10 border border-[#44e2cd]/30 rounded-2xl text-[#44e2cd]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-geist text-[#e0e3e5]">Connect Your Original Wallet</h3>
            <p className="text-xs font-mono text-[#c6c6cd]">Midnight Preprod & Preview Networks</p>
          </div>
        </div>

        {/* Original Wallet Address Input Section */}
        <form onSubmit={(e) => handleConnectWallet(e, 'custom')} className="mb-6 space-y-4">
          <div className="p-4 rounded-2xl bg-[#101415] border border-[#44e2cd]/40">
            <label className="block text-xs font-mono font-bold text-[#44e2cd] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-[#44e2cd]" />
              <span>Enter Your Original Wallet Address</span>
            </label>
            <input
              type="text"
              value={originalAddressInput}
              onChange={(e) => setOriginalAddressInput(e.target.value)}
              placeholder="Paste your original wallet address (e.g. preprod1... or 0x7a3f...)"
              className="w-full bg-[#1d2022] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#e0e3e5] font-mono focus:outline-none focus:border-[#44e2cd] transition placeholder:text-[#909097]"
            />
            <p className="text-[11px] text-[#909097] mt-1.5 font-mono">
              Paste your exact testnet address to connect your original wallet.
            </p>
          </div>

          <button
            type="submit"
            disabled={isConnecting}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#44e2cd] to-[#03c6b2] text-[#003731] font-mono font-bold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-lg shadow-[#03c6b2]/30 flex items-center justify-center space-x-2"
          >
            <Wallet className="w-4 h-4" />
            <span>Connect Original Wallet</span>
          </button>
        </form>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-4 text-xs font-mono text-[#909097] uppercase">Or select extension</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Available Extension Options */}
        <div className="space-y-3">
          {availableWallets
            .filter((w) => w.id !== 'custom')
            .map((wallet) => {
              const installed = wallet.isInstalled();
              return (
                <div
                  key={wallet.id}
                  onClick={() => handleConnectWallet(undefined, wallet.id)}
                  className={`group relative p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                    installed
                      ? 'bg-[#101415] border-[#44e2cd]/40 hover:border-[#44e2cd] hover:bg-white/5'
                      : 'bg-[#101415]/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl p-2 bg-[#1d2022] rounded-xl border border-white/10">
                      {wallet.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-[#e0e3e5] group-hover:text-[#44e2cd] transition">
                          {wallet.name}
                        </span>
                        {installed && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#03c6b2]/10 text-[#44e2cd] border border-[#44e2cd]/30">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                            Extension Detected
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#c6c6cd] mt-0.5">{wallet.description}</p>
                    </div>
                  </div>

                  <span className="text-xs text-[#44e2cd] font-mono font-bold group-hover:translate-x-1 transition">
                    Connect →
                  </span>
                </div>
              );
            })}
        </div>

      </div>
    </div>
  );
};
