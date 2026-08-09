import React from 'react';
import { useWallet } from '../providers/WalletContext';
import { WalletType } from '../wallet/types';
import { X, CheckCircle2, Shield, ExternalLink, AlertCircle, RefreshCw, Download, AlertTriangle } from 'lucide-react';

export const WalletModal: React.FC = () => {
  const {
    availableWallets,
    installedWallets,
    connectWallet,
    isConnecting,
    showWalletModal,
    setShowWalletModal,
    connectionError,
    clearConnectionError,
  } = useWallet();

  if (!showWalletModal) return null;

  const handleConnect = async (type: WalletType) => {
    clearConnectionError();
    try {
      await connectWallet(type);
    } catch (err: any) {
      // Error handled in WalletContext
    }
  };

  const hasInstalledWallets = installedWallets.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0d0e]/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#14181a] border border-[#44e2cd]/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80">
        
        {/* Close Button */}
        <button
          onClick={() => { clearConnectionError(); setShowWalletModal(false); }}
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
            <p className="text-xs font-mono text-[#a0a0ab]">Midnight Preprod & Preview Networks</p>
          </div>
        </div>

        {/* Connection Error Banner */}
        {connectionError && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-start space-x-3 leading-relaxed">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-300">Wallet Authorization Failed:</p>
              <p className="mt-0.5">{connectionError}</p>
            </div>
          </div>
        )}

        {!hasInstalledWallets && (
          /* No Installed Wallet Warning Banner */
          <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
            <div className="flex items-center space-x-2 font-bold text-amber-300 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>No Injected Wallet Extension Detected</span>
            </div>
            <p>
              No active Midnight wallet extension was detected in your browser (<code className="font-mono text-[#44e2cd]">window.midnight</code>). Please install Lace Wallet or 1AM Wallet to connect.
            </p>
          </div>
        )}

        {/* Extension List */}
        <div className="space-y-3.5 mb-6">
          {availableWallets.map((wallet) => {
            const installed = wallet.isInstalled();
            return (
              <div
                key={wallet.id}
                onClick={() => handleConnect(wallet.id)}
                className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  installed
                    ? 'bg-[#101415] border-[#44e2cd]/50 hover:border-[#44e2cd] hover:bg-[#1a2022] shadow-lg'
                    : 'bg-[#101415]/50 border-white/10 opacity-75 hover:opacity-100 hover:border-amber-500/40'
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
                        {installed ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#03c6b2]/10 text-[#44e2cd] border border-[#44e2cd]/30">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Extension Installed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                            Extension Required
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
                        <span>Triggering Wallet Popup...</span>
                      </>
                    ) : installed ? (
                      <span>Trigger Extension Popup →</span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" />
                        Install Extension
                      </span>
                    )}
                  </span>
                  <a
                    href={wallet.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center text-[#909097] hover:text-[#e0e3e5]"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
