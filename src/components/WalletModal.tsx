import React, { useState } from 'react';
import { useWallet } from '../providers/WalletContext';
import { WalletType } from '../wallet/types';
import { X, CheckCircle2, Shield, ExternalLink, Key, Wallet, AlertCircle, RefreshCw } from 'lucide-react';

export const WalletModal: React.FC = () => {
  const { availableWallets, connectWallet, isConnecting, showWalletModal, setShowWalletModal } = useWallet();
  const [originalAddressInput, setOriginalAddressInput] = useState('');
  const [customPublicKeyInput, setCustomPublicKeyInput] = useState('');
  const [connectError, setConnectError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'extensions' | 'custom'>('extensions');

  if (!showWalletModal) return null;

  const handleConnectExtension = async (type: WalletType) => {
    setConnectError(null);
    try {
      await connectWallet(type);
    } catch (err: any) {
      setConnectError(err?.message || "Wallet connection was rejected or extension is not installed.");
    }
  };

  const handleConnectCustomAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnectError(null);
    if (!originalAddressInput.trim()) {
      setConnectError("Please enter a valid wallet address.");
      return;
    }
    try {
      await connectWallet('custom', originalAddressInput.trim(), customPublicKeyInput.trim());
    } catch (err: any) {
      setConnectError(err?.message || "Failed to connect wallet address.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0d0e]/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#14181a] border border-[#44e2cd]/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80">
        
        {/* Close Button */}
        <button
          onClick={() => { setConnectError(null); setShowWalletModal(false); }}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#909097] hover:text-[#e0e3e5] hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3.5 mb-6">
          <div className="p-3 bg-[#03c6b2]/10 border border-[#44e2cd]/30 rounded-2xl text-[#44e2cd]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-geist text-[#e0e3e5] tracking-tight">Connect Midnight Wallet</h3>
            <p className="text-xs font-mono text-[#a0a0ab]">Targeting Midnight Preprod & Preview Networks</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1 rounded-2xl bg-[#101415] border border-white/10 mb-6 space-x-1">
          <button
            type="button"
            onClick={() => { setConnectError(null); setActiveTab('extensions'); }}
            className={`flex-1 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition ${
              activeTab === 'extensions'
                ? 'bg-[#44e2cd] text-[#003731] shadow-md shadow-[#03c6b2]/20'
                : 'text-[#c6c6cd] hover:text-[#e0e3e5]'
            }`}
          >
            Extension Wallet Popup
          </button>
          <button
            type="button"
            onClick={() => { setConnectError(null); setActiveTab('custom'); }}
            className={`flex-1 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition ${
              activeTab === 'custom'
                ? 'bg-[#44e2cd] text-[#003731] shadow-md shadow-[#03c6b2]/20'
                : 'text-[#c6c6cd] hover:text-[#e0e3e5]'
            }`}
          >
            Direct Address Input
          </button>
        </div>

        {/* Connection Error Banner */}
        {connectError && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-start space-x-3 leading-relaxed">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-300">Wallet Authorization Notice:</p>
              <p className="mt-0.5">{connectError}</p>
            </div>
          </div>
        )}

        {activeTab === 'extensions' ? (
          /* Real Extension List */
          <div className="space-y-3.5 mb-4">
            {availableWallets
              .filter((w) => w.id !== 'custom')
              .map((wallet) => {
                const installed = wallet.isInstalled();
                return (
                  <div
                    key={wallet.id}
                    onClick={() => handleConnectExtension(wallet.id)}
                    className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      installed
                        ? 'bg-[#101415] border-[#44e2cd]/50 hover:border-[#44e2cd] hover:bg-[#1a2022] shadow-lg'
                        : 'bg-[#101415]/70 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3.5">
                        <div className="text-2xl p-2.5 bg-[#1d2022] rounded-xl border border-white/10 group-hover:scale-105 transition">
                          {wallet.icon}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-[#e0e3e5] group-hover:text-[#44e2cd] transition">
                              {wallet.name}
                            </span>
                            {installed && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#03c6b2]/10 text-[#44e2cd] border border-[#44e2cd]/30">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Extension Installed
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#a0a0ab] mt-1">{wallet.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-white/10 text-xs">
                      <span className="text-[#44e2cd] font-mono font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                        {isConnecting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Requesting Wallet Permission...</span>
                          </>
                        ) : (
                          <span>Trigger Wallet Popup Permission →</span>
                        )}
                      </span>
                      <a
                        href={wallet.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center text-[#909097] hover:text-[#e0e3e5]"
                      >
                        <span>Install Extension</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1" />
                      </a>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          /* Custom Address Input Form */
          <form onSubmit={handleConnectCustomAddress} className="space-y-4 mb-4">
            <div className="p-4 rounded-2xl bg-[#101415] border border-[#44e2cd]/30">
              <label className="block text-xs font-mono font-bold text-[#44e2cd] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-[#44e2cd]" />
                <span>Your Real Wallet Address</span>
              </label>
              <input
                type="text"
                value={originalAddressInput}
                onChange={(e) => setOriginalAddressInput(e.target.value)}
                placeholder="Paste your wallet address (e.g. 0x7a3f... or preprod1...)"
                required
                className="w-full bg-[#1d2022] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-[#e0e3e5] font-mono focus:outline-none focus:border-[#44e2cd] transition placeholder:text-[#80808a]"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#101415] border border-white/10">
              <label className="block text-xs font-mono font-semibold text-[#c6c6cd] uppercase tracking-wider mb-2">
                <span>Coin Public Key (Optional)</span>
              </label>
              <input
                type="text"
                value={customPublicKeyInput}
                onChange={(e) => setCustomPublicKeyInput(e.target.value)}
                placeholder="Optional coin public key (0x...)"
                className="w-full bg-[#1d2022] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#e0e3e5] font-mono focus:outline-none focus:border-[#44e2cd] transition placeholder:text-[#80808a]"
              />
            </div>

            <button
              type="submit"
              disabled={isConnecting || !originalAddressInput.trim()}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#44e2cd] to-[#03c6b2] text-[#003731] font-mono font-bold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-lg shadow-[#03c6b2]/30 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet Address</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
