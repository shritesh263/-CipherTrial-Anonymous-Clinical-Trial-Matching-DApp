import React, { useState } from 'react';
import { useMidnight } from '../providers/MidnightContext';
import { Search, SlidersHorizontal, ShieldCheck, MapPin, Calendar, Activity, Fingerprint, Sparkles } from 'lucide-react';

interface AvailableTrialsViewProps {
  onSelectTrialForMatching: (trialId: bigint) => void;
}

export const AvailableTrialsView: React.FC<AvailableTrialsViewProps> = ({ onSelectTrialForMatching }) => {
  const { trials, networkConfig } = useMidnight();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'remote' | 'hybrid'>('all');

  const filteredTrials = trials.filter(t => {
    const matchesSearch = t.trialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.sponsorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.requiredConditionName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in py-2">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-[#44e2cd] mb-1">
            <span className="material-symbols-outlined text-sm">shield_person</span>
            <span className="uppercase tracking-wider font-semibold">Zero-Knowledge Private Match</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-geist text-[#e0e3e5] tracking-tight">
            Available Clinical Trials
          </h1>
          <p className="text-sm text-[#c6c6cd] mt-1 max-w-2xl">
            Discover clinical trials matching your private medical attributes. Your health data remains strictly encrypted on your device.
          </p>
        </div>

        {/* Target Network Pill */}
        <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#1d2022] border border-white/10 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#44e2cd] animate-ping"></span>
          <span className="text-[#c6c6cd]">Network:</span>
          <span className="text-[#44e2cd] font-bold uppercase">{networkConfig.networkName}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#909097]" />
          <input
            type="text"
            placeholder="Search by trial name, condition, or sponsor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-[#1d2022] border border-white/10 rounded-xl text-sm text-[#e0e3e5] focus:outline-none focus:border-[#44e2cd] font-medium"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
              filterCategory === 'all'
                ? 'bg-[#44e2cd] text-[#003731] font-bold shadow-lg shadow-[#03c6b2]/20'
                : 'bg-[#1d2022] text-[#c6c6cd] border border-white/5 hover:bg-[#272a2c]'
            }`}
          >
            All Trials
          </button>
          <button
            onClick={() => setFilterCategory('remote')}
            className={`px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
              filterCategory === 'remote'
                ? 'bg-[#44e2cd] text-[#003731] font-bold shadow-lg shadow-[#03c6b2]/20'
                : 'bg-[#1d2022] text-[#c6c6cd] border border-white/5 hover:bg-[#272a2c]'
            }`}
          >
            Remote / Hybrid
          </button>
        </div>
      </div>

      {/* Clinical Trials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTrials.map((trial) => (
          <article
            key={trial.trialId.toString()}
            className="glass-panel rounded-2xl p-6 flex flex-col justify-between gap-6 relative overflow-hidden border border-white/10 hover:border-[#44e2cd]/50 transition-all duration-300 group"
          >
            {/* Top Badge */}
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#03c6b2]/10 border border-[#44e2cd]/30 text-[#44e2cd] text-[11px] font-bold uppercase tracking-wider mb-2">
                  <span className="material-symbols-outlined text-xs">shield_lock</span>
                  ZK Private Match
                </span>
                <h3 className="text-xl font-bold font-geist text-[#e0e3e5] group-hover:text-[#44e2cd] transition-colors">
                  {trial.trialName}
                </h3>
                <p className="text-xs text-[#c6c6cd] mt-0.5 font-medium">Sponsor: {trial.sponsorName}</p>
              </div>
            </div>

            {/* Attributes Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#101415]/60 border border-white/5 space-y-1">
                <div className="text-[#909097] flex items-center gap-1 font-mono uppercase text-[10px] tracking-wider font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-[#44e2cd]" />
                  Age Requirement
                </div>
                <div className="font-mono text-[#e0e3e5] font-semibold">{trial.minAge} - {trial.maxAge} Years</div>
              </div>

              <div className="p-3 rounded-xl bg-[#101415]/60 border border-white/5 space-y-1">
                <div className="text-[#909097] flex items-center gap-1 font-mono uppercase text-[10px] tracking-wider font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#44e2cd]" />
                  Trial Location
                </div>
                <div className="font-mono text-[#e0e3e5] font-semibold">Remote / Decentralized</div>
              </div>

              <div className="col-span-2 p-3 rounded-xl bg-[#101415]/60 border border-white/5 space-y-1">
                <div className="text-[#909097] flex items-center gap-1 font-mono uppercase text-[10px] tracking-wider font-semibold">
                  <Activity className="w-3.5 h-3.5 text-[#44e2cd]" />
                  Diagnosis & Exclusion Rules
                </div>
                <div className="text-[#e0e3e5] font-medium leading-relaxed">
                  Requires <strong className="text-[#44e2cd]">{trial.requiredConditionName}</strong> (Excludes {trial.excludedMedicationName})
                </div>
              </div>
            </div>

            {/* Check Eligibility Button */}
            <button
              onClick={() => onSelectTrialForMatching(trial.trialId)}
              className="w-full py-3.5 px-4 bg-[#44e2cd] hover:bg-[#62fae3] text-[#003731] font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-[#03c6b2]/20 transition duration-200"
            >
              <Fingerprint className="w-4 h-4 text-[#003731]" />
              <span>Check Eligibility Privately (ZKP)</span>
            </button>
          </article>
        ))}
      </div>

    </div>
  );
};
