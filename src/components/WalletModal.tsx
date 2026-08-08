import React from 'react';
import { useWallet } from '../providers/WalletContext';
import { WalletType } from '../wallet/types';
import { X, CheckCircle2, Shield, Zap, ExternalLink, Download, AlertTriangle } from 'lucide-react';

export const WalletModal: React.FC = () => {
  const { availableWallets, connectWallet, isConnecting, showWalletModal, setShowWalletModal } = useWallet();

  if (!showWalletModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/50">
        
        {/* Close Button */}
        <button
          onClick={() => setShowWalletModal(false)}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-cyan-950/60 border border-cyan-500/30 rounded-2xl text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-outfit text-white">Select Midnight Wallet</h3>
            <p className="text-xs text-slate-400">Targeting Midnight PREVIEW Network</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Connect your Midnight-compatible browser wallet to sign ZK proofs and balance transactions.
        </p>

        {/* Wallet Cards List */}
        <div className="space-y-4 mb-6">
          {availableWallets.map((wallet) => {
            const installed = wallet.isInstalled();
            return (
              <div
                key={wallet.id}
                onClick={() => connectWallet(wallet.id)}
                className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  installed
                    ? 'bg-slate-950/90 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/40 shadow-lg hover:shadow-cyan-950/40'
                    : 'bg-slate-950/40 border-slate-800/60 hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl p-2 bg-slate-900 rounded-xl border border-slate-800 group-hover:scale-105 transition">
                      {wallet.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-100 group-hover:text-cyan-300 transition">
                          {wallet.name}
                        </span>
                        {installed ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-500/40">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-teal-400" />
                            Detected
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-500/30">
                            Demo Mode / Install
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">{wallet.description}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                  <span className="text-cyan-400 font-medium group-hover:translate-x-1 transition">
                    {installed ? 'Click to Connect →' : 'Connect Simulation Mode →'}
                  </span>
                  <a
                    href={wallet.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center text-slate-400 hover:text-slate-200"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fallback Notice */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-slate-300 flex items-start space-x-3">
          <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-cyan-200">Midnight Multi-Wallet Support: </span>
            This dApp automatically detects both <strong>Lace Wallet</strong> (`window.midnight.mnLace`) and <strong>1AM Wallet</strong> (`window.midnight['1am']`). If neither extension is detected, you can test full circuit flows in connected simulation mode.
          </div>
        </div>

      </div>
    </div>
  );
};
