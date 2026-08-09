import React, { useState } from 'react';
import { useWallet } from '../providers/WalletContext';
import { WalletType } from '../wallet/types';
import { X, CheckCircle2, Shield, ExternalLink, Key, Sparkles, Send } from 'lucide-react';

export const WalletModal: React.FC = () => {
  const { availableWallets, connectWallet, isConnecting, showWalletModal, setShowWalletModal } = useWallet();
  const [originalAddressInput, setOriginalAddressInput] = useState('');
  const [customPublicKeyInput, setCustomPublicKeyInput] = useState('');
  const [activeTab, setActiveTab] = useState<'extensions' | 'original'>('extensions');

  if (!showWalletModal) return null;

  const handleConnectOriginal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalAddressInput.trim()) return;
    connectWallet('custom', originalAddressInput.trim(), customPublicKeyInput.trim());
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
            <h3 className="text-xl font-bold font-geist text-[#e0e3e5]">Connect Midnight Wallet</h3>
            <p className="text-xs font-mono text-[#c6c6cd]">Targeting Midnight Preprod & Preview Networks</p>
          </div>
        </div>

        {/* Tab Switcher: Injected Extensions vs Original Wallet Input */}
        <div className="flex p-1 rounded-2xl bg-[#101415] border border-white/10 mb-6 space-x-1">
          <button
            type="button"
            onClick={() => setActiveTab('extensions')}
            className={`flex-1 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition ${
              activeTab === 'extensions'
                ? 'bg-[#44e2cd] text-[#003731] shadow-lg'
                : 'text-[#c6c6cd] hover:text-[#e0e3e5]'
            }`}
          >
            Browser Extensions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('original')}
            className={`flex-1 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition ${
              activeTab === 'original'
                ? 'bg-[#44e2cd] text-[#003731] shadow-lg'
                : 'text-[#c6c6cd] hover:text-[#e0e3e5]'
            }`}
          >
            Connect Original Address
          </button>
        </div>

        {activeTab === 'extensions' ? (
          /* Wallet Extension Cards List */
          <div className="space-y-4 mb-6">
            {availableWallets
              .filter((w) => w.id !== 'custom')
              .map((wallet) => {
                const installed = wallet.isInstalled();
                return (
                  <div
                    key={wallet.id}
                    onClick={() => connectWallet(wallet.id)}
                    className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      installed
                        ? 'bg-[#101415] border-[#44e2cd]/40 hover:border-[#44e2cd] hover:bg-white/5 shadow-lg'
                        : 'bg-[#101415]/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl p-2 bg-[#1d2022] rounded-xl border border-white/10 group-hover:scale-105 transition">
                          {wallet.icon}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-[#e0e3e5] group-hover:text-[#44e2cd] transition">
                              {wallet.name}
                            </span>
                            {installed ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#03c6b2]/10 text-[#44e2cd] border border-[#44e2cd]/30">
                                <CheckCircle2 className="w-3 h-3 mr-1 text-[#44e2cd]" />
                                Live Extension Detected
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                                Direct Connect
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#c6c6cd] mt-1 max-w-xs">{wallet.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                      <span className="text-[#44e2cd] font-mono font-bold group-hover:translate-x-1 transition">
                        {installed ? 'Connect Live Extension →' : 'Connect Original Wallet →'}
                      </span>
                      <a
                        href={wallet.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center text-[#909097] hover:text-[#e0e3e5]"
                      >
                        <span>Website</span>
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          /* Connect Original Wallet Address Input Form */
          <form onSubmit={handleConnectOriginal} className="space-y-4 mb-6">
            <div className="p-4 rounded-2xl bg-[#101415] border border-[#44e2cd]/30">
              <label className="block text-xs font-mono font-bold text-[#44e2cd] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-[#44e2cd]" />
                <span>Original Wallet Address (Preprod / Preview)</span>
              </label>
              <input
                type="text"
                value={originalAddressInput}
                onChange={(e) => setOriginalAddressInput(e.target.value)}
                placeholder="Paste your wallet address (e.g. 0x7a3f... or preprod1...)"
                required
                className="w-full bg-[#1d2022] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#e0e3e5] font-mono focus:outline-none focus:border-[#44e2cd] transition placeholder:text-[#909097]"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#101415] border border-white/10">
              <label className="block text-xs font-mono font-semibold text-[#c6c6cd] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#44e2cd]" />
                <span>Coin Public Key (Optional)</span>
              </label>
              <input
                type="text"
                value={customPublicKeyInput}
                onChange={(e) => setCustomPublicKeyInput(e.target.value)}
                placeholder="Optional coin public key (0x...)"
                className="w-full bg-[#1d2022] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#e0e3e5] font-mono focus:outline-none focus:border-[#44e2cd] transition placeholder:text-[#909097]"
              />
            </div>

            <button
              type="submit"
              disabled={isConnecting || !originalAddressInput.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#44e2cd] to-[#03c6b2] text-[#003731] font-mono font-bold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-lg shadow-[#03c6b2]/30 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Connect My Original Wallet Address</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
