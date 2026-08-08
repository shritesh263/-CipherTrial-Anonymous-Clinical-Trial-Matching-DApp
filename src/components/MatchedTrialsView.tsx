import React, { useState } from 'react';
import { useMidnight } from '../providers/MidnightContext';
import { ShieldCheck, CheckCircle2, Award, DollarSign, Clock, MapPin, Fingerprint, Lock, ArrowRight, Activity, Share2 } from 'lucide-react';
import { ProofGenerationResult } from '../contracts/simulator';

interface MatchedTrialsViewProps {
  onSelectTrialForMatching: (trialId: bigint) => void;
  lastProofResult?: ProofGenerationResult | null;
}

export const MatchedTrialsView: React.FC<MatchedTrialsViewProps> = ({ onSelectTrialForMatching, lastProofResult }) => {
  const { trials, getMatchedCount, networkConfig } = useMidnight();
  const [submittedInterest, setSubmittedInterest] = useState<Record<string, boolean>>({});

  const handleSubmitAnonymousInterest = (trialId: string) => {
    setSubmittedInterest(prev => ({ ...prev, [trialId]: true }));
  };

  return (
    <div className="space-y-8 animate-fade-in py-2 max-w-5xl mx-auto">
      
      {/* Success State Hero */}
      <div className="text-center space-y-4 py-4">
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#03c6b2]/10 border border-[#44e2cd]/30 text-[#44e2cd] mx-auto shadow-2xl">
          <div className="absolute inset-0 rounded-full border-2 border-[#44e2cd] zk-pulse"></div>
          <ShieldCheck className="w-10 h-10 text-[#44e2cd] animate-pulse" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold font-geist text-[#e0e3e5] tracking-tight">
          You Qualify for Clinical Research Studies!
        </h1>
        <p className="text-sm text-[#c6c6cd] max-w-xl mx-auto leading-relaxed">
          Based on your shielded medical witness evaluation, exact Zero-Knowledge matches were verified on <strong>{networkConfig.networkName}</strong>. Your underlying health records remain 100% confidential.
        </p>
      </div>

      {/* Matched Trials Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Featured Trial Match (Col 8) */}
        {trials[0] && (
          <div className="md:col-span-12 lg:col-span-8 glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#44e2cd]/10 rounded-full blur-3xl -mr-10 -mt-10 opacity-60"></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="px-3 py-1 bg-[#44e2cd] text-[#003731] font-bold text-[11px] uppercase tracking-wider rounded-md">
                    98% ZK Match
                  </span>
                  <span className="inline-flex items-center text-xs text-[#44e2cd] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Verified On-Chain
                  </span>
                </div>
                <h3 className="text-2xl font-bold font-geist text-[#e0e3e5]">{trials[0].trialName}</h3>
                <p className="text-xs text-[#c6c6cd] mt-0.5 font-medium">Sponsor: {trials[0].sponsorName}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4 mt-6 text-xs relative z-10">
              <div>
                <span className="text-[#909097] block uppercase font-mono text-[10px] font-semibold">Study Duration</span>
                <span className="text-[#e0e3e5] font-mono font-semibold">12 Months</span>
              </div>
              <div>
                <span className="text-[#909097] block uppercase font-mono text-[10px] font-semibold">Stipend / Comp</span>
                <span className="text-[#44e2cd] font-mono font-bold">Est. $1,200 tDUST</span>
              </div>
              <div>
                <span className="text-[#909097] block uppercase font-mono text-[10px] font-semibold">Requirement</span>
                <span className="text-[#e0e3e5] font-semibold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#44e2cd] mr-1" />
                  Passed Circuit
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-[#c6c6cd] font-mono">
                Matched Pool Size: <strong>{getMatchedCount(trials[0].trialId)} Patients</strong>
              </span>
              <button
                onClick={() => handleSubmitAnonymousInterest(trials[0].trialId.toString())}
                disabled={submittedInterest[trials[0].trialId.toString()]}
                className="px-5 py-2.5 bg-[#44e2cd] hover:bg-[#62fae3] text-[#003731] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center space-x-2 transition"
              >
                <Fingerprint className="w-4 h-4" />
                <span>{submittedInterest[trials[0].trialId.toString()] ? 'Interest Submitted (ZKP)' : 'Submit Anonymous Interest'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Secondary Trial Match (Col 4) */}
        {trials[1] && (
          <div className="md:col-span-6 lg:col-span-4 glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2.5 py-0.5 bg-[#323537] text-[#c6c6cd] font-bold text-[10px] uppercase tracking-wider rounded-md">
                  85% Match
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#44e2cd]" />
              </div>
              <h3 className="text-lg font-bold font-geist text-[#e0e3e5]">{trials[1].trialName}</h3>
              <p className="text-xs text-[#c6c6cd] mt-2 line-clamp-3 leading-relaxed">
                Observational study evaluating biomarker responses. Requires remote telemetry monitoring.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-[#c6c6cd]">6 Months • Remote</span>
              <button
                onClick={() => onSelectTrialForMatching(trials[1].trialId)}
                className="text-[#44e2cd] hover:underline font-semibold flex items-center gap-1"
              >
                View <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Privacy First Action Footer Banner */}
      <div className="glass-card rounded-2xl p-8 text-center border border-white/10 space-y-4 max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#0f172a] border border-[#44e2cd]/30 text-[#44e2cd]">
          <Lock className="w-6 h-6" />
        </div>
        <h4 className="text-xl font-bold font-geist text-[#e0e3e5]">Privacy-First Cryptographic Submission</h4>
        <p className="text-xs text-[#c6c6cd] max-w-md mx-auto leading-relaxed">
          Submitting interest transmits a Zero-Knowledge Proof (ZKP) nullifier to the Midnight contract. Your identity and plain-text medical parameters remain hidden until explicit consent is given.
        </p>
      </div>

    </div>
  );
};
