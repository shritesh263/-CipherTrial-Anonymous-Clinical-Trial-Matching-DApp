import React, { useState } from 'react';
import { WalletProvider } from './providers/WalletContext';
import { MidnightProvider, useMidnight } from './providers/MidnightContext';
import { Navbar, NavTab } from './components/Navbar';
import { WalletModal } from './components/WalletModal';
import { AvailableTrialsView } from './components/AvailableTrialsView';
import { PatientView } from './components/PatientView';
import { MatchedTrialsView } from './components/MatchedTrialsView';
import { SponsorDashboard } from './components/SponsorDashboard';
import { ProofConfirmationView } from './components/ProofConfirmationView';
import { EstablishingChannelModal } from './components/EstablishingChannelModal';
import { ProofGenerationResult } from './contracts/simulator';
import { ShieldCheck, ExternalLink, Droplets, Sparkles, Lock } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { networkConfig } = useMidnight();
  const [activeTab, setActiveTab] = useState<NavTab>('discovery');
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [targetTrialForHandshake, setTargetTrialForHandshake] = useState<bigint | null>(null);

  const [confirmedProof, setConfirmedProof] = useState<{
    result: ProofGenerationResult;
    trialId: bigint;
  } | null>(null);

  const handleSelectTrialForMatching = (trialId: bigint) => {
    setTargetTrialForHandshake(trialId);
    setShowChannelModal(true);
  };

  const handleHandshakeComplete = () => {
    setShowChannelModal(false);
    setActiveTab('patient');
  };

  const handleProofSuccess = (result: ProofGenerationResult, trialId: bigint) => {
    setConfirmedProof({ result, trialId });
  };

  const handleResetProof = () => {
    setConfirmedProof(null);
    setActiveTab('matched');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#101415] text-[#e0e3e5] selection:bg-[#44e2cd] selection:text-[#003731]">
      
      {/* Top Network Announcement Bar */}
      <div className="bg-[#1d2022] border-b border-white/10 py-2 px-4 text-center text-xs text-[#c6c6cd]">
        <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-[#44e2cd] animate-ping"></span>
          <span>Targeting <strong>{networkConfig.networkName}</strong> (`{networkConfig.rpcEndpoint}`)</span>
          <span className="text-white/20">|</span>
          <a
            href={networkConfig.faucetUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-[#44e2cd] hover:underline font-semibold"
          >
            <Droplets className="w-3.5 h-3.5 mr-1 text-[#44e2cd]" />
            Request Test Tokens from {networkConfig.networkId.toUpperCase()} Faucet
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
        ) : activeTab === 'discovery' ? (
          <AvailableTrialsView onSelectTrialForMatching={handleSelectTrialForMatching} />
        ) : activeTab === 'patient' ? (
          <PatientView onProofSuccess={handleProofSuccess} />
        ) : activeTab === 'matched' ? (
          <MatchedTrialsView onSelectTrialForMatching={handleSelectTrialForMatching} lastProofResult={null} />
        ) : (
          <SponsorDashboard />
        )}
      </main>

      {/* Establishing Secure Channel ZK Handshake Modal */}
      <EstablishingChannelModal
        isOpen={showChannelModal}
        onClose={() => setShowChannelModal(false)}
        onComplete={handleHandshakeComplete}
      />

      {/* Global Wallet Connection Modal */}
      <WalletModal />

      {/* Footer (Stitch Technical Style) */}
      <footer className="mt-auto border-t border-white/10 bg-[#101415] py-8 px-4 text-xs text-[#c6c6cd]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-[#1d2022] border border-[#44e2cd]/30 flex items-center justify-center text-[#44e2cd]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold font-geist text-[#e0e3e5]">Midnight Health — CipherTrial</span>
              <span className="text-[#909097] ml-2 font-mono">Zero-Knowledge Clinical Trial Matcher</span>
            </div>
          </div>

          <div className="flex items-center space-x-6 font-mono">
            <a
              href="https://docs.midnight.network"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#44e2cd] transition flex items-center space-x-1"
            >
              <span>Compact Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={networkConfig.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#44e2cd] transition flex items-center space-x-1"
            >
              <span>Midnight Explorer</span>
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
