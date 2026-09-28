import React, { useState } from 'react';
import { 
  AlertTriangle, X, ShieldAlert, ArrowRight, 
  HelpCircle, CheckCircle2, RotateCcw 
} from 'lucide-react';

export const OverrideModal = ({
  isOpen,
  onClose,
  prior,
  allPriors = [],
  patient,
  onOverrideSubmit
}) => {
  const [selectedReason, setSelectedReason] = useState('Wrong anatomy');
  const [detailedNotes, setDetailedNotes] = useState('');
  const [alternativePriorId, setAlternativePriorId] = useState(
    allPriors.find(p => p.id !== prior?.id)?.id || ''
  );
  const [physicianName, setPhysicianName] = useState('Dr. Elena Vance, MD');

  if (!isOpen || !prior) return null;

  const overrideReasons = [
    { id: 'Wrong anatomy', label: 'Wrong anatomy', desc: 'Scan volume does not sufficiently encompass the target anatomical structure.' },
    { id: 'Wrong modality', label: 'Wrong modality', desc: 'Technique or sequence mismatch (e.g. 2D XR vs volumetric thin-slice CT).' },
    { id: 'Insufficient evidence', label: 'Insufficient evidence', desc: 'Prior report lacks resolution or measurement specifics for target lesion.' },
    { id: 'Clinically irrelevant', label: 'Clinically irrelevant', desc: 'Prior exam addressed an unrelated acute symptom or non-target pathology.' },
    { id: 'Other', label: 'Other', desc: 'Custom clinical justification (specify below).' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onOverrideSubmit({
      priorId: prior.id,
      priorName: prior.studyName,
      reason: selectedReason,
      detailedNotes: detailedNotes || `Override rationale: ${selectedReason}`,
      alternativePriorId: alternativePriorId,
      user: physicianName,
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-[#0D131D] border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-amber-950/30 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Amber accent blur */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#1D2A38]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold uppercase">
                CLINICAL DISCRETION OVERRIDE
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Override System Prior Match
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#162234] border border-transparent hover:border-[#1D2A38] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Study Being Overridden */}
        <div className="mt-4 bg-[#090E17] border border-[#1D2A38] rounded-2xl p-3.5 flex items-center justify-between text-xs">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Overriding Prior Study:</div>
            <div className="text-white font-bold text-sm mt-0.5">{prior.studyName}</div>
            <div className="text-slate-400 font-mono text-[11px] mt-0.5">{prior.date} • {prior.institution}</div>
          </div>
          <div className="text-right">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Rank #{prior.rank} ({prior.matchScore}%)
            </span>
          </div>
        </div>

        {/* Override Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Reason Radio Group */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Primary Reason for Override (Mandatory)
            </label>
            
            <div className="space-y-1.5">
              {overrideReasons.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedReason === r.id
                      ? 'bg-amber-500/10 border-amber-500/50 text-white'
                      : 'bg-[#111927] border-[#1D2A38] text-slate-300 hover:bg-[#162234] hover:text-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="overrideReason"
                    value={r.id}
                    checked={selectedReason === r.id}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="mt-0.5 w-4 h-4 text-amber-500 focus:ring-0 bg-[#070B12] border-[#1D2A38]"
                  />
                  <div>
                    <div className="text-xs font-semibold">{r.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Alternative Prior Selection */}
          {allPriors.length > 1 && (
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Designate Alternative Candidate (Optional)
              </label>
              <select
                value={alternativePriorId}
                onChange={(e) => setAlternativePriorId(e.target.value)}
                className="w-full bg-[#111927] border border-[#1D2A38] text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-amber-400 outline-none"
              >
                <option value="">-- No alternative (Manual Baseline) --</option>
                {allPriors
                  .filter(p => p.id !== prior.id)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      Rank #{p.rank}: {p.studyName} ({p.date.split(' ')[0]} - {p.matchScore}%)
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Free Text Clinical Notes */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Physician Narrative / Justification
            </label>
            <textarea
              rows={2}
              value={detailedNotes}
              onChange={(e) => setDetailedNotes(e.target.value)}
              placeholder="Explain why this prior match was overridden for audit documentation..."
              className="w-full bg-[#111927] border border-[#1D2A38] text-slate-200 text-xs rounded-xl p-2.5 focus:border-amber-400 outline-none"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1D2A38]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#111927] hover:bg-[#162234] border border-[#1D2A38] text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg bg-amber-500 hover:bg-amber-400 text-[#070B12] shadow-glow-amber cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Record Override & Save Audit Log</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default OverrideModal;
