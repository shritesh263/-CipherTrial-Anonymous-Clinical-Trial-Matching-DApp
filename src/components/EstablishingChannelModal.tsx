import React from 'react';
import { ShieldCheck, KeyRound, Lock, X } from 'lucide-react';
import { useMidnight } from '../providers/MidnightContext';
import { useWallet } from '../providers/WalletContext';

interface EstablishingChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const EstablishingChannelModal: React.FC<EstablishingChannelModalProps> = ({ isOpen, onClose, onComplete }) => {
  const { networkConfig } = useMidnight();
  const { isConnected, account, setShowWalletModal } = useWallet();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#101415]/80 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade-in">
      <div className="relative bg-[#272a2c] rounded-2xl border border-white/10 shadow-2xl w-full max-w-md overflow-hidden flex flex-col p-8">
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#44e2cd] to-transparent"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#c6c6cd] hover:text-[#e0e3e5] p-1 rounded-lg hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          
          <div className="mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-[#44e2cd]/20 blur-xl"></div>
            <div className="w-16 h-16 rounded-2xl bg-[#1d2022] border border-[#44e2cd]/40 flex items-center justify-center text-[#44e2cd]">
              <ShieldCheck className="w-9 h-9 animate-pulse text-[#44e2cd]" />
            </div>
          </div>

          <h2 className="text-xl font-bold font-geist text-[#e0e3e5] mb-1">
            Establish ZK Connection
          </h2>
          <p className="text-xs text-[#c6c6cd] mb-6 max-w-xs">
            This check requires your real Midnight wallet to be connected before generating a ZK proof for{' '}
            <strong>{networkConfig.networkName}</strong>.
          </p>

          {/* Requested Permissions Summary */}
          <div className="w-full bg-[#1d2022] rounded-xl p-4 mb-6 border border-white/5 text-left text-xs space-y-3">
            <div className="text-[10px] font-mono text-[#909097] uppercase tracking-wider font-bold">
              ZK Proof Requirements
            </div>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#44e2cd] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#e0e3e5]">Real Wallet Connection Required</div>
                  <div className="text-[10px] text-[#44e2cd] font-mono uppercase">Lace or 1AM Extension</div>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-[#c0c1ff] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#e0e3e5]">Public Key Nullifier Association</div>
                  <div className="text-[10px] text-[#c6c6cd] font-mono uppercase">On-Chain Pseudonymous</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Wallet status and action buttons */}
          <div className="w-full space-y-2">
            {isConnected && account ? (
              <>
                {/* Show real connected address */}
                <div className="p-3 rounded-xl bg-[#03c6b2]/10 border border-[#44e2cd]/30 text-xs font-mono text-[#44e2cd] text-left mb-1">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-[#909097] mb-1">Connected Wallet Address</div>
                  <div className="text-[#e0e3e5] break-all">{account.address}</div>
                </div>
                <button
                  onClick={onComplete}
                  className="w-full py-3 px-4 rounded-xl bg-[#44e2cd] text-[#003731] font-mono font-bold text-xs uppercase tracking-wider hover:bg-[#62fae3] transition shadow-lg"
                >
                  Proceed to ZK Patient Vault →
                </button>
              </>
            ) : (
              <>
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs font-mono text-amber-300 text-left mb-1">
                  No wallet connected — connect Lace or 1AM extension to proceed
                </div>
                <button
                  onClick={() => { onClose(); setShowWalletModal(true); }}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#44e2cd] to-[#03c6b2] text-[#003731] font-mono font-bold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-lg"
                >
                  Connect Wallet First
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl border border-white/10 text-[#c6c6cd] hover:text-[#e0e3e5] hover:bg-white/5 transition font-mono text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
