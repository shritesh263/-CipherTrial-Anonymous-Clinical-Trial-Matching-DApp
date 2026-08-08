import React, { useState } from 'react';
import { ProofGenerationResult } from '../contracts/simulator';
import { useMidnight } from '../providers/MidnightContext';
import { ShieldCheck, CheckCircle2, Lock, Copy, Sparkles, Share2, Download, Code2, Eye } from 'lucide-react';
import { OptInModal } from './OptInModal';

interface ProofConfirmationViewProps {
  proofResult: ProofGenerationResult;
  trialId: bigint;
  onReset: () => void;
}

export const ProofConfirmationView: React.FC<ProofConfirmationViewProps> = ({ proofResult, trialId, onReset }) => {
  const { trials, getMatchedCount, networkConfig } = useMidnight();
  const [showOptInModal, setShowOptInModal] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const trial = trials.find(t => t.trialId === trialId);
  const matchedCount = getMatchedCount(trialId);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const downloadProofJson = () => {
    const payload = {
      network: networkConfig.networkName,
      rpcEndpoint: networkConfig.rpcEndpoint,
      contractAddress: networkConfig.contractAddress,
      trialId: trialId.toString(),
      proofHash: proofResult.proofHash,
      nullifier: proofResult.nullifier,
      circuitValidity: proofResult.isEligible,
      proofDetails: proofResult.proofDetails,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zk-proof-trial-${trialId.toString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-4">
      
      {/* Main Success Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-emerald-500/40 p-8 sm:p-10 shadow-2xl shadow-emerald-950/40 text-center">
        
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
        
        {/* Animated Green Badge */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 mb-6 shadow-lg shadow-emerald-900/50">
          <ShieldCheck className="w-10 h-10 animate-pulse text-emerald-400" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold font-outfit text-white mb-2">
          Eligibility Proven in Zero-Knowledge!
        </h1>
        <p className="text-slate-300 text-sm max-w-xl mx-auto mb-6">
          Your private health attributes satisfied all eligibility criteria for <strong>{trial?.trialName}</strong>. The <strong>{networkConfig.networkName}</strong> confirmed your ZK proof and incremented the aggregate match counter.
        </p>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Compact ZK Proof Verified
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-cyan-400" />
            Zero Medical Data Disclosed
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-500/40 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Matched Pool Size: {matchedCount}
          </span>
        </div>

        {/* Proof Technical Details Grid */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-left space-y-4 mb-8 text-xs font-mono">
          
          <div>
            <div className="text-slate-500 mb-1 font-sans text-[11px] uppercase tracking-wider font-semibold">Proof Hash (On-Chain Reference)</div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
              <span className="truncate mr-2 text-cyan-300">{proofResult.proofHash}</span>
              <button
                onClick={() => copyToClipboard(proofResult.proofHash)}
                className="p-1.5 text-slate-400 hover:text-white rounded bg-slate-800 transition"
              >
                {copiedHash ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <div className="text-slate-500 mb-1 font-sans text-[11px] uppercase tracking-wider font-semibold">Pseudonymous Single-Use Nullifier</div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 truncate">
              {proofResult.nullifier}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800 font-sans text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">Proving Engine</span>
              <span className="font-semibold text-slate-200">{proofResult.proofDetails.zkProtocol}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Circuit Execution Time</span>
              <span className="font-semibold text-slate-200">{proofResult.proofDetails.provingTimeMs} ms</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Target Network</span>
              <span className="font-semibold text-cyan-300 uppercase">{networkConfig.networkId}</span>
            </div>
          </div>

        </div>

        {/* Export & Inspection Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            onClick={downloadProofJson}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-cyan-500/30 flex items-center space-x-1.5 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Proof Payload (.json)</span>
          </button>

          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showRawJson ? 'Hide Raw JSON' : 'Inspect Raw ZK JSON'}</span>
          </button>
        </div>

        {/* Collapsible Raw JSON Viewer */}
        {showRawJson && (
          <div className="mb-8 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left font-mono text-[11px] text-emerald-400 overflow-x-auto">
            <pre>
              {JSON.stringify(
                {
                  network: networkConfig.networkName,
                  rpcEndpoint: networkConfig.rpcEndpoint,
                  contractAddress: networkConfig.contractAddress,
                  trialId: trialId.toString(),
                  proofHash: proofResult.proofHash,
                  nullifier: proofResult.nullifier,
                  circuitValidity: proofResult.isEligible,
                  proofDetails: proofResult.proofDetails,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}

        {/* Action Buttons: Opt-in Share vs Back */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          
          <button
            onClick={() => setShowOptInModal(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold text-sm shadow-lg shadow-indigo-900/50 hover:opacity-90 transition flex items-center justify-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Opt-In: Share Encrypted Contact Info</span>
          </button>

          <button
            onClick={onReset}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition"
          >
            Check Another Trial
          </button>

        </div>

      </div>

      {/* Opt-In Modal Trigger */}
      <OptInModal
        isOpen={showOptInModal}
        onClose={() => setShowOptInModal(false)}
        trialId={trialId}
        trialName={trial?.trialName || 'Clinical Trial'}
        sponsorName={trial?.sponsorName || 'Trial Sponsor'}
      />

    </div>
  );
};
