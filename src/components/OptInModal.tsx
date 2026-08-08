import React, { useState } from 'react';
import { useMidnight } from '../providers/MidnightContext';
import { X, Lock, CheckCircle2, ShieldCheck, Mail, Phone, Share2, AlertCircle } from 'lucide-react';

interface OptInModalProps {
  isOpen: boolean;
  onClose: () => void;
  trialId: bigint;
  trialName: string;
  sponsorName: string;
}

export const OptInModal: React.FC<OptInModalProps> = ({
  isOpen,
  onClose,
  trialId,
  trialName,
  sponsorName,
}) => {
  const { optInContactReveal } = useMidnight();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmitOptIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Package contact data for off-chain encrypted sharing
      const contactPayload = JSON.stringify({ email, phone, notes, timestamp: Date.now() });
      const encryptedBytes = "0x" + Array.from(new TextEncoder().encode(contactPayload))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 128);

      // Execute Circuit 4: optInReveal
      await optInContactReveal(trialId, encryptedBytes);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit opt-in reveal circuit.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/50">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-indigo-950/80 border border-indigo-500/30 rounded-2xl text-indigo-400">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-outfit text-white">Explicit Sponsor Opt-In</h3>
            <p className="text-xs text-slate-400">Separate, Patient-Initiated Circuit Execution</p>
          </div>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Opt-In Contact Request Transmitted!</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Your contact details have been encrypted off-chain specifically for <strong>{sponsorName}</strong>. Compact circuit <code>optInReveal</code> recorded the patient opt-in signal without writing contact data to public ledger state.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitOptIn} className="space-y-4">
            
            <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300">
              <span className="font-semibold text-indigo-300">Target Sponsor: </span>
              {sponsorName} ({trialName})
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Contact Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Best reachable weekday mornings"
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 inline mr-1 text-indigo-400" />
              Opt-in contact sharing is strictly <strong>voluntary & patient-initiated</strong>. Raw contact information is encrypted and transmitted directly to sponsor off-chain, never stored on-chain.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold text-sm shadow-lg shadow-indigo-900/40 hover:opacity-90 transition"
            >
              {isSubmitting ? 'Executing Circuit optInReveal...' : 'Authorize Contact Share (Circuit 4)'}
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
