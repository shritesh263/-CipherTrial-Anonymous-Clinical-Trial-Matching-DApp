import React, { useState } from 'react';
import { WalletProvider } from './providers/WalletContext';
import { MidnightProvider } from './providers/MidnightContext';
import { Navbar } from './components/Navbar';
import { WalletModal } from './components/WalletModal';
import { PatientView } from './components/PatientView';
import { SponsorDashboard } from './components/SponsorDashboard';
import { ProofConfirmationView } from './components/ProofConfirmationView';
import { ProofGenerationResult } from './contracts/simulator';
import { ShieldCheck, Cpu, ExternalLink, Activity, Sparkles, Droplets, Info } from 'lucide-react';
import { MIDNIGHT_PREVIEW_CONFIG } from './config/network';

const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'patient' | 'sponsor'>('patient');
  const [confirmedProof, setConfirmedProof] = useState<{
    result: ProofGenerationResult;
    trialId: bigint;
  } | null>(null);

  const handleProofSuccess = (result: ProofGenerationResult, trialId: bigint) => {
    setConfirmedProof({ result, trialId });
  };

  const handleResetProof = () => {
    setConfirmedProof(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Preview Network Announcement Bar */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border-b border-cyan-500/20 py-2 px-4 text-center text-xs text-cyan-200">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>Targeting <strong>Midnight PREVIEW Network</strong> (`{MIDNIGHT_PREVIEW_CONFIG.rpcEndpoint}`)</span>
          <span className="text-slate-500">|</span>
          <a
            href={MIDNIGHT_PREVIEW_CONFIG.faucetUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-cyan-300 hover:text-white underline font-semibold"
          >
            <Droplets className="w-3.5 h-3.5 mr-1 text-cyan-400" />
            Get Test NIGHT/DUST from Preview Faucet
          </a>
        </div>
      </div>

      {/* Main Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={(tab) => { setConfirmedProof(null); setActiveTab(tab); }} />

      {/* View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {confirmedProof ? (
          <ProofConfirmationView
            proofResult={confirmedProof.result}
            trialId={confirmedProof.trialId}
            onReset={handleResetProof}
          />
        ) : activeTab === 'patient' ? (
          <PatientView onProofSuccess={handleProofSuccess} />
        ) : (
          <SponsorDashboard />
        )}
      </main>

      {/* Global Wallet Connection Modal */}
      <WalletModal />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/90 py-8 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-200">CipherTrial dApp</span>
              <span className="text-slate-500 ml-2">Built with Midnight Compact & React</span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <a
              href="https://docs.midnight.network"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-300 transition flex items-center space-x-1"
            >
              <span>Compact Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={MIDNIGHT_PREVIEW_CONFIG.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-300 transition flex items-center space-x-1"
            >
              <span>Preview Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>
      </footer>

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <WalletProvider>
      <MidnightProvider>
        <MainAppContent />
      </MidnightProvider>
    </WalletProvider>
  );
};

export default App;
