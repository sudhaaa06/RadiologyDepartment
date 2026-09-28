import React, { useState } from 'react';
import { 
  CheckCircle2, X, ShieldCheck, AlertCircle, 
  FileText, Calendar, Building, Sparkles, Layers 
} from 'lucide-react';

export const ConfirmPriorModal = ({
  isOpen,
  onClose,
  prior,
  currentStudy,
  patient,
  onConfirm
}) => {
  const [attestationChecked, setAttestationChecked] = useState(false);
  const [physicianSignature, setPhysicianSignature] = useState('Dr. Elena Vance, MD');
  const [notes, setNotes] = useState('Optimal anatomical concordance and matching IV contrast timing for RUL nodule surveillance.');

  if (!isOpen || !prior) return null;

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (!attestationChecked) return;

    onConfirm({
      priorId: prior.id,
      priorName: prior.studyName,
      matchScore: prior.matchScore,
      signature: physicianSignature,
      notes: notes,
      attestation: 'Physician attests clinical relevance of selected prior study for comparative evaluation.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-[#0D131D] border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-cyan-950/40 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#1D2A38]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-[#00D9FF]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#00D9FF] font-bold uppercase">
                HUMAN VERIFICATION GATEWAY
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Confirm Prior Study Selection
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

        {/* Selected Study Card */}
        <div className="mt-4 bg-[#090E17] border border-[#1D2A38] rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-[#00D9FF] border border-cyan-500/30">
              Rank #{prior.rank} • {prior.matchScore}% Match Score
            </span>
            <span className="text-xs font-mono text-slate-400">
              Acc: <strong className="text-slate-200">{prior.accession}</strong>
            </span>
          </div>

          <h3 className="text-base font-bold text-white">
            {prior.studyName}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-400 font-mono pt-1">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Study Date</span>
              <span className="text-slate-200 font-semibold">{prior.date}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Interval</span>
              <span className="text-cyan-300 font-semibold">{prior.interval}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 uppercase block">Facility</span>
              <span className="text-slate-300 truncate block">{prior.institution}</span>
            </div>
          </div>
        </div>

        {/* Clinical Evidence Summary Box */}
        <div className="mt-3.5 space-y-2">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Documented Matching Evidence</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-[#111927] p-2.5 rounded-xl border border-[#1D2A38]/70">
              <span className="text-cyan-300 font-semibold block">Anatomical Alignment</span>
              <span className="text-slate-400 text-[11px] mt-0.5 block">{prior.evidence.sameAnatomy}</span>
            </div>
            <div className="bg-[#111927] p-2.5 rounded-xl border border-[#1D2A38]/70">
              <span className="text-[#8B7CFF] font-semibold block">Protocol & Modality</span>
              <span className="text-slate-400 text-[11px] mt-0.5 block">{prior.evidence.sameModality}</span>
            </div>
            <div className="bg-[#111927] p-2.5 rounded-xl border border-[#1D2A38]/70">
              <span className="text-emerald-400 font-semibold block">Clinical Indication</span>
              <span className="text-slate-400 text-[11px] mt-0.5 block">{prior.evidence.similarIndication}</span>
            </div>
            <div className="bg-[#111927] p-2.5 rounded-xl border border-[#1D2A38]/70">
              <span className="text-amber-400 font-semibold block">Historical Finding Mention</span>
              <span className="text-slate-400 text-[11px] mt-0.5 block">{prior.evidence.previousCondition}</span>
            </div>
          </div>
        </div>

        {/* Human Attestation Form */}
        <form onSubmit={handleConfirmSubmit} className="mt-4 space-y-3">
          
          {/* Checkbox Attestation */}
          <label className="flex items-start gap-3 p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-xl cursor-pointer hover:bg-cyan-950/30 transition-colors">
            <input
              type="checkbox"
              checked={attestationChecked}
              onChange={(e) => setAttestationChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#1D2A38] text-[#00D9FF] focus:ring-0 focus:ring-offset-0 bg-[#070B12]"
            />
            <span className="text-xs text-slate-200 leading-relaxed font-medium">
              I certify that I have clinically inspected the candidate study and verified that this exam provides the appropriate anatomical and diagnostic comparative baseline for <strong className="text-white">{patient?.patientName}</strong> ({patient?.patientId}).
            </span>
          </label>

          {/* Attesting Radiologist Signature & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Attesting Radiologist
              </label>
              <input
                type="text"
                value={physicianSignature}
                onChange={(e) => setPhysicianSignature(e.target.value)}
                required
                className="w-full bg-[#111927] border border-[#1D2A38] text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-[#00D9FF] outline-none font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                Clinical Justification Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#111927] border border-[#1D2A38] text-slate-200 text-xs rounded-xl px-3 py-2 focus:border-[#00D9FF] outline-none"
              />
            </div>
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
              disabled={!attestationChecked}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-lg ${
                attestationChecked
                  ? 'bg-gradient-to-r from-[#00D9FF] to-[#00b4d8] text-[#070B12] hover:brightness-110 shadow-glow-cyan cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Log Audit Event</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default ConfirmPriorModal;
