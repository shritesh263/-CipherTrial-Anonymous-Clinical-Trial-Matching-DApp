import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, KeyRound, CheckCircle2, Lock, X, RefreshCw } from 'lucide-react';
import { useMidnight } from '../providers/MidnightContext';

interface EstablishingChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const EstablishingChannelModal: React.FC<EstablishingChannelModalProps> = ({ isOpen, onClose, onComplete }) => {
  const { networkConfig } = useMidnight();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete();
          }, 400);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15 + 8);
      });
    }, 250);

    return () => clearInterval(timer);
  }, [isOpen, onComplete]);

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

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          
          <div className="mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-[#44e2cd]/20 blur-xl"></div>
            <div className="w-16 h-16 rounded-2xl bg-[#1d2022] border border-[#44e2cd]/40 flex items-center justify-center text-[#44e2cd]">
              <ShieldCheck className="w-9 h-9 animate-pulse text-[#44e2cd]" />
            </div>
          </div>

          <h2 className="text-xl font-bold font-geist text-[#e0e3e5] mb-1">
            Establishing ZK Connection
          </h2>
          <p className="text-xs text-[#c6c6cd] mb-6 max-w-xs">
            Connecting zero-knowledge proof channel to <strong>{networkConfig.networkName}</strong>.
          </p>

          {/* Animated Spinner & Progress Bar */}
          <div className="w-full space-y-3 mb-6">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#44e2cd] font-bold uppercase tracking-wider">Handshake Encryption</span>
              <span className="text-[#e0e3e5] font-bold">{Math.min(progress, 100)}%</span>
            </div>
            <div className="h-2 w-full bg-[#1d2022] rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-[#44e2cd] rounded-full transition-all duration-200"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Requested Permissions Summary */}
          <div className="w-full bg-[#1d2022] rounded-xl p-4 mb-6 border border-white/5 text-left text-xs space-y-3">
            <div className="text-[10px] font-mono text-[#909097] uppercase tracking-wider font-bold">
              Requested ZK Permissions
            </div>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#44e2cd] shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-[#e0e3e5]">Verify Medical Witness Identity</div>
                  <div className="text-[10px] text-[#44e2cd] font-mono uppercase">ZKP Evaluated Off-Chain</div>
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

          {/* Action Buttons */}
          <div className="w-full space-y-2">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl border border-white/10 text-[#c6c6cd] hover:text-[#e0e3e5] hover:bg-white/5 transition font-mono text-xs uppercase tracking-wider"
            >
              Cancel Handshake
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
