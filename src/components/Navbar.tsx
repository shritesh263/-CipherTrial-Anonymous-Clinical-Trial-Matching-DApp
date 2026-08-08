import React from 'react';
import { useWallet } from '../providers/WalletContext';
import { useMidnight } from '../providers/MidnightContext';
import { NetworkId } from '../config/network';
import { ShieldCheck, Wallet, Sparkles, Building2, UserCheck, Globe, Droplets, Search, Award } from 'lucide-react';

export type NavTab = 'discovery' | 'patient' | 'matched' | 'sponsor';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { account, activeAdapter, isConnected, setShowWalletModal, disconnectWallet } = useWallet();
  const { networkConfig, activeNetworkId, switchNetwork } = useMidnight();

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#101415]/90 border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <div className="relative group cursor-pointer" onClick={() => setActiveTab('discovery')}>
              <div className="absolute -inset-1 bg-gradient-to-r from-[#44e2cd] via-[#03c6b2] to-[#6d70fb] rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative w-12 h-12 bg-[#1d2022] border border-[#44e2cd]/40 rounded-xl flex items-center justify-center text-[#44e2cd] shadow-inner">
                <ShieldCheck className="w-7 h-7 animate-pulse text-[#44e2cd]" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-geist font-extrabold text-2xl tracking-tight text-[#e0e3e5]">
                  Midnight Health
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#03c6b2]/10 text-[#44e2cd] border border-[#44e2cd]/30 uppercase">
                  <Sparkles className="w-3 h-3 mr-1 text-[#44e2cd]" />
                  ZKP Matcher
                </span>
              </div>
              <p className="text-xs text-[#c6c6cd] font-medium">Private Clinical Trial Matching dApp</p>
            </div>
          </div>

          {/* Center Navigation Tabs (Stitch Style) */}
          <div className="hidden lg:flex items-center p-1 rounded-2xl bg-[#1d2022] border border-white/10 shadow-inner space-x-1">
            <button
              onClick={() => setActiveTab('discovery')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-xs uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'discovery'
                  ? 'bg-[#44e2cd] text-[#003731] font-bold shadow-lg shadow-[#03c6b2]/30'
                  : 'text-[#c6c6cd] hover:text-[#e0e3e5] hover:bg-white/5'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Discover Trials</span>
            </button>

            <button
              onClick={() => setActiveTab('patient')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-xs uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'patient'
                  ? 'bg-[#44e2cd] text-[#003731] font-bold shadow-lg shadow-[#03c6b2]/30'
                  : 'text-[#c6c6cd] hover:text-[#e0e3e5] hover:bg-white/5'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>ZK Patient Vault</span>
            </button>

            <button
              onClick={() => setActiveTab('matched')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-xs uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'matched'
                  ? 'bg-[#44e2cd] text-[#003731] font-bold shadow-lg shadow-[#03c6b2]/30'
                  : 'text-[#c6c6cd] hover:text-[#e0e3e5] hover:bg-white/5'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Matched Trials</span>
            </button>

            <button
              onClick={() => setActiveTab('sponsor')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-xs uppercase tracking-wider transition-all duration-200 ${
                activeTab === 'sponsor'
                  ? 'bg-[#6d70fb] text-white font-bold shadow-lg shadow-[#6d70fb]/30'
                  : 'text-[#c6c6cd] hover:text-[#e0e3e5] hover:bg-white/5'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Sponsor Dashboard</span>
            </button>
          </div>

          {/* Right Action Items: Network Selector, Faucet & Wallet */}
          <div className="flex items-center space-x-3">
            
            {/* Midnight Network Switcher Dropdown */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#1d2022] border border-white/10 text-xs font-mono">
              <Globe className="w-3.5 h-3.5 text-[#44e2cd]" />
              <select
                value={activeNetworkId}
                onChange={(e) => switchNetwork(e.target.value as NetworkId)}
                className="bg-transparent text-[#44e2cd] font-semibold focus:outline-none cursor-pointer"
              >
                <option value="preprod" className="bg-[#1d2022] text-[#44e2cd]">Preprod</option>
                <option value="preview" className="bg-[#1d2022] text-[#44e2cd]">Preview</option>
              </select>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#44e2cd] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#44e2cd]"></span>
              </span>
            </div>

            {/* Faucet Link Button */}
            <a
              href={networkConfig.faucetUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#03c6b2]/10 border border-[#44e2cd]/30 text-[#44e2cd] text-xs font-medium hover:bg-[#03c6b2]/20 transition"
              title="Request Testnet tDUST Faucet Tokens"
            >
              <Droplets className="w-3.5 h-3.5 text-[#44e2cd]" />
              <span>Faucet</span>
            </a>

            {/* Wallet Button */}
            {isConnected && account ? (
              <div className="relative group">
                <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-[#1d2022] border border-[#44e2cd]/30 text-[#e0e3e5] hover:border-[#44e2cd]/60 transition-all">
                  <span className="text-lg">{activeAdapter?.icon}</span>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-[#44e2cd] flex items-center gap-1">
                      {activeAdapter?.name}
                    </div>
                    <div className="text-xs font-mono text-[#c6c6cd]">
                      {formatAddress(account.address)}
                    </div>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    title="Disconnect Wallet"
                    className="ml-2 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 px-2 py-1 rounded border border-rose-800/40 transition"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                className="relative group overflow-hidden rounded-xl p-[1px] font-semibold text-sm focus:outline-none"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#44e2cd] via-[#03c6b2] to-[#6d70fb] rounded-xl animate-pulse"></span>
                <span className="relative flex items-center space-x-2 px-5 py-2.5 rounded-[11px] bg-[#101415] text-[#44e2cd] group-hover:bg-opacity-80 transition font-mono text-xs uppercase tracking-wider font-bold">
                  <Wallet className="w-4 h-4 text-[#44e2cd]" />
                  <span>Connect Wallet</span>
                </span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
