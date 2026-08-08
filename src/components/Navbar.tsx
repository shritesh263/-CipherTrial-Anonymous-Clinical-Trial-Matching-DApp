import React from 'react';
import { useWallet } from '../providers/WalletContext';
import { useMidnight } from '../providers/MidnightContext';
import { NetworkId } from '../config/network';
import { ShieldCheck, Wallet, Sparkles, Building2, UserCheck, Globe, Droplets } from 'lucide-react';

interface NavbarProps {
  activeTab: 'patient' | 'sponsor';
  setActiveTab: (tab: 'patient' | 'sponsor') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { account, activeAdapter, isConnected, setShowWalletModal, disconnectWallet } = useWallet();
  const { networkConfig, activeNetworkId, switchNetwork } = useMidnight();

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/80 border-b border-cyan-500/20 shadow-2xl shadow-cyan-950/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-500 rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative w-12 h-12 bg-slate-900 border border-cyan-400/40 rounded-xl flex items-center justify-center text-cyan-400 shadow-inner">
                <ShieldCheck className="w-7 h-7 animate-pulse text-cyan-300" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-outfit font-extrabold text-2xl tracking-tight bg-gradient-to-r from-cyan-300 via-teal-200 to-indigo-300 bg-clip-text text-transparent">
                  CipherTrial
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/90 text-cyan-300 border border-cyan-500/30">
                  <Sparkles className="w-3 h-3 mr-1 text-cyan-400" />
                  ZK Compact
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Anonymous Clinical Trial Matching dApp</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <div className="hidden md:flex items-center p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveTab('patient')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'patient'
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Patient Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('sponsor')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === 'sponsor'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Sponsor Dashboard</span>
            </button>
          </div>

          {/* Right Action Items: Network Selector, Faucet & Wallet */}
          <div className="flex items-center space-x-3">
            
            {/* Midnight Network Switcher Dropdown */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 text-xs font-mono">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={activeNetworkId}
                onChange={(e) => switchNetwork(e.target.value as NetworkId)}
                className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="preprod" className="bg-slate-900 text-cyan-300">Preprod</option>
                <option value="preview" className="bg-slate-900 text-cyan-300">Preview</option>
              </select>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
            </div>

            {/* Faucet Link Button */}
            <a
              href={networkConfig.faucetUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 text-xs font-medium hover:bg-cyan-900/50 transition"
              title="Request Testnet tDUST Faucet Tokens"
            >
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>Faucet</span>
            </a>

            {/* Wallet Button */}
            {isConnected && account ? (
              <div className="relative group">
                <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-slate-900 border border-cyan-500/30 text-slate-200 hover:border-cyan-400/60 transition-all">
                  <span className="text-lg">{activeAdapter?.icon}</span>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1">
                      {activeAdapter?.name}
                    </div>
                    <div className="text-xs font-mono text-slate-400">
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
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 rounded-xl animate-pulse"></span>
                <span className="relative flex items-center space-x-2 px-5 py-2.5 rounded-[11px] bg-slate-950 text-cyan-200 group-hover:bg-opacity-80 transition">
                  <Wallet className="w-4 h-4 text-cyan-400" />
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
