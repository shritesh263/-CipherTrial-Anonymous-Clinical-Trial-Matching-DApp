import React, { useState } from 'react';
import { useMidnight } from '../providers/MidnightContext';
import { useWallet } from '../providers/WalletContext';
import { Building2, Plus, Users, ShieldCheck, CheckCircle2, Lock, Sparkles, Activity, FileText, AlertCircle } from 'lucide-react';

export const SponsorDashboard: React.FC = () => {
  const { trials, createTrial, registerSponsor, checkSponsorAuthorization, getMatchedCount, getOptInCount } = useMidnight();
  const { account, isConnected, setShowWalletModal } = useWallet();

  // Only use the real wallet's coinPublicKey — never a hardcoded fallback
  const sponsorPk = account?.coinPublicKey ?? null;
  const isAuthorized = sponsorPk ? checkSponsorAuthorization(sponsorPk) : false;

  // Form State
  const [trialName, setTrialName] = useState('');
  const [sponsorName, setSponsorName] = useState('Aetheria BioPharma');
  const [minAge, setMinAge] = useState<number>(18);
  const [maxAge, setMaxAge] = useState<number>(65);
  const [reqConditionCode, setReqConditionCode] = useState<number>(101);
  const [reqConditionName, setReqConditionName] = useState('Severe Asthma (ICD-10 J45.9)');
  const [exclMedCode, setExclMedCode] = useState<number>(501);
  const [exclMedName, setExclMedName] = useState('High-Dose Immunosuppressants (Rx 501)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuthorizeSponsor = async () => {
    try {
      await registerSponsor(sponsorPk!);
      setSuccessMsg(`Sponsor PK ${sponsorPk!.slice(0, 10)}... successfully registered in Authorized Sponsor Registry!`);
    } catch (err: any) {
      setErrorMsg(err.message || "Authorization failed.");
    }
  };

  const handleCreateTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const trialId = BigInt(Math.floor(100 + Math.random() * 900));
      await createTrial({
        trialId,
        trialName: trialName || "Phase II Oncology Biomarker Study",
        sponsorPk: sponsorPk!,
        sponsorName,
        minAge: Number(minAge),
        maxAge: Number(maxAge),
        requiredConditionCode: Number(reqConditionCode),
        requiredConditionName: reqConditionName || `Condition Code ${reqConditionCode}`,
        excludedMedicationCode: Number(exclMedCode),
        excludedMedicationName: exclMedName || `Medication Code ${exclMedCode}`,
      });

      setSuccessMsg(`Trial "${trialName}" successfully registered on Midnight Preview Network with ID ${trialId}!`);
      setTrialName('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create trial.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* WALLET CONNECTION GATE — no real wallet = no sponsor access */}
      {(!isConnected || !account || !sponsorPk) ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="p-5 bg-[#1d2022] border border-[#44e2cd]/30 rounded-3xl">
            <Building2 className="w-12 h-12 text-[#44e2cd]" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-[#e0e3e5] mb-2">Sponsor Access Requires Wallet</h2>
            <p className="text-sm text-[#a0a0ab] max-w-md">
              Connect a real Midnight browser wallet extension (Lace or 1AM) to access sponsor features.
              Your wallet&apos;s coin public key is used as your sponsor identity on-chain.
            </p>
          </div>
          <button
            onClick={() => setShowWalletModal(true)}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#44e2cd] to-[#03c6b2] text-[#003731] font-mono font-bold text-sm uppercase tracking-wider shadow-lg hover:opacity-90 transition"
          >
            Connect Wallet to Continue
          </button>
        </div>
      ) : (
      <>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/20 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="p-2.5 bg-indigo-950/80 border border-indigo-500/30 rounded-2xl text-indigo-400">
                <Building2 className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white">
                Sponsor Trial Management
              </h1>
            </div>
            <p className="text-sm text-slate-300 max-w-xl">
              Publish eligibility criteria on the Midnight ledger. Patients evaluate ZK proofs locally without revealing their raw medical data.
            </p>
          </div>

          {/* Sponsor Authorization Status Card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center space-x-4">
            <div>
              <div className="text-xs text-slate-400">Authorized Sponsor Registry</div>
              <div className="flex items-center space-x-2 mt-1">
                {isAuthorized ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-300">Verified Organization</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-300">Unregistered</span>
                  </>
                )}
              </div>
            </div>
            {!isAuthorized && (
              <button
                onClick={handleAuthorizeSponsor}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
              >
                Authorize Sponsor
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-sm flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Trial Creation Form + Active Trials List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Publish Trial Form */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <Plus className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold font-outfit text-white">Publish New Trial</h2>
          </div>

          <form onSubmit={handleCreateTrial} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Trial Name / Protocol Title</label>
              <input
                type="text"
                required
                value={trialName}
                onChange={(e) => setTrialName(e.target.value)}
                placeholder="e.g. Phase II Diabetes Biomarker Trial"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Age</label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={minAge}
                  onChange={(e) => setMinAge(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Maximum Age</label>
                <input
                  type="number"
                  min="18"
                  max="100"
                  value={maxAge}
                  onChange={(e) => setMaxAge(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Required Condition (ICD Code & Name)</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={reqConditionCode}
                  onChange={(e) => setReqConditionCode(Number(e.target.value))}
                  placeholder="Code (101)"
                  className="col-span-1 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 font-mono"
                />
                <input
                  type="text"
                  value={reqConditionName}
                  onChange={(e) => setReqConditionName(e.target.value)}
                  placeholder="Condition Name"
                  className="col-span-2 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Excluded Medication (Rx Code & Name)</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={exclMedCode}
                  onChange={(e) => setExclMedCode(Number(e.target.value))}
                  placeholder="Code (501)"
                  className="col-span-1 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 font-mono"
                />
                <input
                  type="text"
                  value={exclMedName}
                  onChange={(e) => setExclMedName(e.target.value)}
                  placeholder="Medication Name"
                  className="col-span-2 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold text-sm shadow-lg shadow-indigo-900/40 hover:opacity-90 transition"
            >
              {isSubmitting ? 'Deploying Trial Rules...' : 'Publish Trial to Ledger'}
            </button>
          </form>
        </div>

        {/* Active Trials List & Metrics */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-outfit text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Active Trials & Aggregate Anonymous Pool</span>
            </h2>
            <span className="text-xs text-slate-400">{trials.length} Active Trials</span>
          </div>

          <div className="space-y-4">
            {trials.map((trial) => {
              const matchedCount = getMatchedCount(trial.trialId);
              const optInCount = getOptInCount(trial.trialId);

              return (
                <div
                  key={trial.trialId.toString()}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/40 transition shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-500/30">
                          ID: #{trial.trialId.toString()}
                        </span>
                        <h3 className="font-bold text-slate-100 text-base">{trial.trialName}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Sponsor: {trial.sponsorName}</p>
                    </div>

                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                      Active
                    </span>
                  </div>

                  {/* Criteria Badge Grid */}
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px] font-semibold uppercase">Age Range</span>
                      <span className="font-mono text-cyan-300 font-semibold">{trial.minAge} - {trial.maxAge} yrs</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px] font-semibold uppercase">Required Condition</span>
                      <span className="text-slate-200 truncate block">{trial.requiredConditionName}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-500 block text-[10px] font-semibold uppercase">Excluded Medication</span>
                      <span className="text-slate-200 truncate block">{trial.excludedMedicationName}</span>
                    </div>
                  </div>

                  {/* Aggregate Counters Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span className="text-slate-400">Anonymous Matched Pool:</span>
                        <span className="font-bold text-cyan-300 text-sm">{matchedCount} Patients</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span className="text-slate-400">Opt-In Contact Shares:</span>
                        <span className="font-bold text-indigo-300 text-sm">{optInCount}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">No raw data on-chain</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      </>
      )}
    </div>
  );
};
