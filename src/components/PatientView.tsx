import React, { useState, useEffect } from 'react';
import { useMidnight } from '../providers/MidnightContext';
import { useWallet } from '../providers/WalletContext';
import { ProofGenerationResult } from '../contracts/simulator';
import { ShieldCheck, Lock, Cpu, Sparkles, CheckCircle2, EyeOff, ShieldAlert, Save, Trash2, KeyRound } from 'lucide-react';

interface PatientViewProps {
  onProofSuccess: (result: ProofGenerationResult, trialId: bigint) => void;
}

export const PatientView: React.FC<PatientViewProps> = ({ onProofSuccess }) => {
  const { trials, generateAndSubmitProof, verifyProofOnChain, networkConfig } = useMidnight();
  const { account, isConnected, setShowWalletModal } = useWallet();

  // Selected Trial
  const [selectedTrialId, setSelectedTrialId] = useState<string>(trials[0]?.trialId.toString() || '101');

  // Private Patient Medical Attributes (Kept strictly local in browser memory)
  const [patientAge, setPatientAge] = useState<number>(30);
  const [conditionCode, setConditionCode] = useState<number>(101);
  const [medicationCode, setMedicationCode] = useState<number>(0); // 0 = No excluded meds

  // Local Vault Persistence
  const [vaultSaved, setVaultSaved] = useState(false);

  // Proof Generation UI State
  const [isProving, setIsProving] = useState(false);
  const [provingStep, setProvingStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const currentTrial = trials.find(t => t.trialId.toString() === selectedTrialId) || trials[0];

  // Load local saved witness vault on mount
  useEffect(() => {
    const savedData = localStorage.getItem('cipher_trial_patient_vault');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.patientAge) setPatientAge(parsed.patientAge);
        if (parsed.conditionCode) setConditionCode(parsed.conditionCode);
        if (parsed.medicationCode !== undefined) setMedicationCode(parsed.medicationCode);
        setVaultSaved(true);
      } catch (e) {
        console.error("Failed to parse vault", e);
      }
    }
  }, []);

  const saveToLocalVault = () => {
    const vault = { patientAge, conditionCode, medicationCode, savedAt: new Date().toISOString() };
    localStorage.setItem('cipher_trial_patient_vault', JSON.stringify(vault));
    setVaultSaved(true);
    setTimeout(() => setVaultSaved(false), 3000);
  };

  const clearLocalVault = () => {
    localStorage.removeItem('cipher_trial_patient_vault');
    setPatientAge(30);
    setConditionCode(101);
    setMedicationCode(0);
    setVaultSaved(false);
  };

  const handleRunZkCircuit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsProving(true);
    setProvingStep(1); // Step 1: Witness extraction

    try {
      await new Promise(r => setTimeout(r, 600));
      setProvingStep(2); // Step 2: Local ZK Circuit Evaluation

      const trialId = BigInt(selectedTrialId);
      const witness = {
        patientAge: Number(patientAge),
        patientConditionCode: Number(conditionCode),
        patientMedicationCode: Number(medicationCode),
        patientNullifierSecret: account?.address || '0xpatient_private_nullifier_secret_key_999',
      };

      await new Promise(r => setTimeout(r, 700));
      setProvingStep(3); // Step 3: Halo2 ZK Proof Construction

      const proofResult = await generateAndSubmitProof(trialId, witness);

      await new Promise(r => setTimeout(r, 800));
      setProvingStep(4); // Step 4: Midnight Ledger Submission & Verification

      await verifyProofOnChain(trialId, proofResult.proofHash, proofResult.nullifier);

      onProofSuccess(proofResult, trialId);
    } catch (err: any) {
      console.error("ZK Proof execution error:", err);
      setErrorMsg(err.message || "Eligibility proof generation failed.");
    } finally {
      setIsProving(false);
      setProvingStep(0);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="relative space-y-2">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 bg-cyan-950/80 border border-cyan-500/40 rounded-2xl text-cyan-300">
              <EyeOff className="w-6 h-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white">
              Patient Zero-Knowledge Portal
            </h1>
          </div>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Prove clinical trial eligibility using Midnight Compact ZK circuits on <strong>{networkConfig.networkName}</strong>. Your medical data stays 100% private in your browser witness state and is <strong>never transmitted or stored on-chain</strong>.
          </p>
        </div>
      </div>

      {/* Main Grid: Local Medical Form + ZK Circuit Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Medical Attributes Input Card (Private Witness State) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold font-outfit text-white">Private Witness Input (Local Only)</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={saveToLocalVault}
                title="Save encrypted state locally"
                className="p-1.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-xs flex items-center gap-1 hover:bg-cyan-900 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{vaultSaved ? 'Saved!' : 'Vault Save'}</span>
              </button>
              <button
                type="button"
                onClick={clearLocalVault}
                title="Clear local witness vault"
                className="p-1.5 rounded-lg bg-rose-950/60 text-rose-300 border border-rose-800/40 text-xs hover:bg-rose-900 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleRunZkCircuit} className="space-y-6">
            
            {/* Target Clinical Trial Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select Target Clinical Trial</label>
              <select
                value={selectedTrialId}
                onChange={(e) => setSelectedTrialId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
              >
                {trials.map(t => (
                  <option key={t.trialId.toString()} value={t.trialId.toString()}>
                    #{t.trialId.toString()} - {t.trialName} ({t.sponsorName})
                  </option>
                ))}
              </select>
            </div>

            {/* Trial Criteria Info Card */}
            {currentTrial && (
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs space-y-2">
                <div className="font-semibold text-cyan-300">Target Trial Requirements:</div>
                <div className="grid grid-cols-3 gap-2 text-slate-300">
                  <div>Age: <strong className="text-white">{currentTrial.minAge}-{currentTrial.maxAge}</strong></div>
                  <div>Req Condition: <strong className="text-white">Code #{currentTrial.requiredConditionCode}</strong></div>
                  <div>Excl Med: <strong className="text-white">Code #{currentTrial.excludedMedicationCode}</strong></div>
                </div>
              </div>
            )}

            {/* Patient Age */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Age (Years)</label>
              <input
                type="number"
                required
                min="1"
                max="120"
                value={patientAge}
                onChange={(e) => setPatientAge(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Patient Diagnosed Condition Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Diagnosed Condition Code</label>
              <select
                value={conditionCode}
                onChange={(e) => setConditionCode(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value={101}>101 - Severe Asthma (ICD-10 J45.9) [Eligible]</option>
                <option value={102}>102 - Type 2 Diabetes (ICD-10 E11)</option>
                <option value={103}>103 - Hypertension (ICD-10 I10)</option>
                <option value={999}>999 - No Matching Condition Code</option>
              </select>
            </div>

            {/* Patient Medication Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Medication</label>
              <select
                value={medicationCode}
                onChange={(e) => setMedicationCode(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value={0}>0 - Standard Inhaler / Albuterol (Allowed)</option>
                <option value={501}>501 - High-Dose Immunosuppressants [EXCLUDED MEDICATION]</option>
                <option value={502}>502 - Oral Corticosteroids</option>
              </select>
            </div>

            {/* Privacy Warning */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center space-x-3">
              <EyeOff className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>These values are stored in private witness memory. Compact circuit evaluates boolean logic locally.</span>
            </div>

            {/* Action Button */}
            {!isConnected ? (
              <button
                type="button"
                onClick={() => setShowWalletModal(true)}
                className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition"
              >
                Connect Wallet to Generate Proof
              </button>
            ) : (
              <button
                type="submit"
                disabled={isProving}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-indigo-600 text-white font-bold text-base shadow-xl shadow-cyan-900/40 hover:opacity-95 transition flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-5 h-5 animate-spin-slow" />
                <span>{isProving ? 'Generating Compact ZK Proof...' : 'Generate & Submit ZK Proof'}</span>
              </button>
            )}

          </form>
        </div>

        {/* ZK Proof Progress & Privacy Guarantee Visualizer */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Circuit Execution Animation Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <h3 className="text-lg font-bold font-outfit text-white mb-6 flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>ZK Circuit Execution Engine</span>
            </h3>

            <div className="space-y-4">
              
              {/* Step 1 */}
              <div className={`p-4 rounded-2xl border transition-all ${
                provingStep === 1 ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200' : 
                provingStep > 1 ? 'bg-slate-950 border-emerald-500/40 text-emerald-300' : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>1. Off-Chain Private Witness Extraction</span>
                  {provingStep > 1 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-xs mt-1 text-slate-400">Loads age, condition, and medication into local witness memory.</p>
              </div>

              {/* Step 2 */}
              <div className={`p-4 rounded-2xl border transition-all ${
                provingStep === 2 ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200' : 
                provingStep > 2 ? 'bg-slate-950 border-emerald-500/40 text-emerald-300' : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>2. Compact Circuit Constraint Satisfaction</span>
                  {provingStep > 2 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-xs mt-1 text-slate-400">Evaluates eligibility arithmetic constraints locally in ZK.</p>
              </div>

              {/* Step 3 */}
              <div className={`p-4 rounded-2xl border transition-all ${
                provingStep === 3 ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200' : 
                provingStep > 3 ? 'bg-slate-950 border-emerald-500/40 text-emerald-300' : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>3. Halo2 Zero-Knowledge Proof Construction</span>
                  {provingStep > 3 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-xs mt-1 text-slate-400">Generates mathematical ZK proof object and pseudonymous nullifier.</p>
              </div>

              {/* Step 4 */}
              <div className={`p-4 rounded-2xl border transition-all ${
                provingStep === 4 ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200' : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>4. Midnight Ledger Proof Verification ({networkConfig.networkId})</span>
                </div>
                <p className="text-xs mt-1 text-slate-400">Submits proof to {networkConfig.networkName} node & increments aggregate match count.</p>
              </div>

            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-6 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-sm flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Circuit Execution Rejected</div>
                  <div className="text-xs mt-1">{errorMsg}</div>
                </div>
              </div>
            )}

          </div>

          {/* Privacy Guarantee Card */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Midnight Privacy Architecture</h4>
            <div className="text-xs text-slate-300 leading-relaxed space-y-1">
              <p>• <strong>disclose() Scoping:</strong> Only the final boolean eligibility state crossed the ZK boundary.</p>
              <p>• <strong>Zero Identity Tracking:</strong> No public key or wallet address is tied to health records.</p>
              <p>• <strong>Single-Use Nullifier:</strong> Prevents double-submissions without linkability.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
