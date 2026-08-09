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
    if (addr.length <= 14) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#101415]/95 border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3.5 cursor-pointer shrink-0" onClick={() => setActiveTab('discovery')}>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#44e2cd] via-[#03c6b2] to-[#6d70fb] rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative w-11 h-11 bg-[#1d2022] border border-[#44e2cd]/40 rounded-xl flex items-center justify-center text-[#44e2cd]">
                <ShieldCheck className="w-6 h-6 animate-pulse text-[#44e2cd]" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-geist font-extrabold text-xl sm:text-2xl tracking-tight text-[#e0e3e5]">
                  Midnight Health
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-[#03c6b2]/10 text-[#44e2cd] border border-[#44e2cd]/30 uppercase">
                  <Sparkles className="w-3 h-3 mr-1 text-[#44e2cd]" />
                  ZKP Matcher
                </span>
              </div>
              <p className="text-[11px] text-[#909097] font-medium hidden sm:block">Private Clinical Trial Matching dApp</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <div className="hidden lg:flex items-center p-1 rounded-2xl bg-[#1d2022] border border-white/10 shadow-inner space-x-1">
            <button
              onClick={() => setActiveTab('discovery')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all duration-200 ${
                activeTab === 'discovery'
                  ? 'bg-[#44e2cd] text-[#003731] shadow-lg shadow-[#03c6b2]/30'
                  : 'text-[#c6c6cd] hover:text-[#e0e3e5] hover:bg-white/5'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Discover Trials</span>
            </button>

            <button
              onClick={() => setActiveTab('patient')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all duration-200 ${
                activeTab === 'patient'
                  ? 'bg-[#44e2cd] text-[#003731] shadow-lg shadow-[#03c6b2]/30'
                  : 'text-[#c6c6cd] hover:text-[#e0e3e5] hover:bg-white/5'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>ZK Patient Vault</span>
            </button>

            <button
              onClick={() => setActiveTab('matched')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all duration-200 ${
                activeTab === 'matched'
                  ? 'bg-[#44e2cd] text-[#003731] shadow-lg shadow-[#03c6b2]/30'
                  : 'text-[#c6c6cd] hover:text-[#e0e3e5] hover:bg-white/5'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Matched Trials</span>
            </button>

            <button
              onClick={() => setActiveTab('sponsor')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all duration-200 ${
                activeTab === 'sponsor'
                  ? 'bg-[#6d70fb] text-white shadow-lg shadow-[#6d70fb]/30'
                  : 'text-[#c6c6cd] hover:text-[#e0e3e5] hover:bg-white/5'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Sponsor Dashboard</span>
            </button>
          </div>

          {/* Right Action Items */}
          <div className="flex items-center space-x-2.5">
            
            {/* Midnight Network Switcher Dropdown */}
            <div className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#1d2022] border border-white/10 text-xs font-mono">
              <Globe className="w-3.5 h-3.5 text-[#44e2cd]" />
              <select
                value={activeNetworkId}
                onChange={(e) => switchNetwork(e.target.value as NetworkId)}
                className="bg-transparent text-[#44e2cd] font-semibold focus:outline-none cursor-pointer text-xs"
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
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#03c6b2]/10 border border-[#44e2cd]/30 text-[#44e2cd] text-xs font-medium hover:bg-[#03c6b2]/20 transition"
              title="Request Testnet Tokens from Faucet"
            >
              <Droplets className="w-3.5 h-3.5 text-[#44e2cd]" />
              <span>Faucet</span>
            </a>

            {/* Wallet Button */}
            {isConnected && account ? (
              <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#1d2022] border border-[#44e2cd]/40 text-[#e0e3e5]" title={`Full address: ${account.address}`}>
                <span className="text-base">{activeAdapter?.icon}</span>
                <div className="text-left font-mono">
                  <div className="text-[11px] font-bold text-[#44e2cd] flex items-center gap-1">
                    {activeAdapter?.name}
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" title="Real extension connected" />
                  </div>
                  <div className="text-[10px] text-[#c6c6cd]" title={account.address}>
                    {formatAddress(account.address)}
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  title="Disconnect Wallet"
                  className="ml-2 text-[11px] font-mono font-bold text-rose-400 hover:text-rose-200 bg-rose-950/60 hover:bg-rose-900/80 px-2 py-1 rounded-lg border border-rose-800/40 transition"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                className="relative group overflow-hidden rounded-xl p-[1px] font-semibold text-xs focus:outline-none"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#44e2cd] via-[#03c6b2] to-[#6d70fb] rounded-xl animate-pulse"></span>
                <span className="relative flex items-center space-x-2 px-4 py-2.5 rounded-[11px] bg-[#101415] text-[#44e2cd] group-hover:bg-opacity-80 transition font-mono text-xs uppercase tracking-wider font-bold">
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
