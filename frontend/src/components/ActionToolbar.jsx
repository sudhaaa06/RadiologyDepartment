import React from 'react';
import { 
  CheckCircle2, XCircle, Maximize2, ShieldCheck, 
  AlertTriangle, ArrowRight, Sparkles 
} from 'lucide-react';

export const ActionToolbar = ({
  activePrior,
  onViewFullStudy,
  onConfirmPrior,
  onOverrideMatch
}) => {
  const hasPrior = Boolean(activePrior);

  return (
    <div className="sticky bottom-10 z-30 w-full mt-6">
      <div className="bg-[#0D131D]/95 backdrop-blur-xl border-2 border-[#1D2A38] rounded-2xl p-3 sm:p-4 shadow-2xl shadow-black/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Selected Prior Summary Pill */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-[#00D9FF] hidden sm:block">
            <ShieldCheck className="w-5 h-5" />
          </div>

          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Designated Comparative Prior:
              </span>
              {hasPrior ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-[#00D9FF]">
                  {activePrior.matchScore}% Match
                </span>
              ) : (
                <span className="text-[10px] font-mono text-amber-400">
                  None Selected (Baseline)
                </span>
              )}
            </div>

            <div className="text-xs font-semibold text-white truncate max-w-[280px] sm:max-w-[360px] mt-0.5">
              {hasPrior ? activePrior.studyName : 'No comparative prior assigned'}
            </div>
          </div>
        </div>

        {/* The 3 Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          
          {/* 1. VIEW FULL STUDY */}
          <button
            onClick={onViewFullStudy}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#111927] hover:bg-[#162234] border border-[#1D2A38] hover:border-cyan-500/40 text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Maximize2 className="w-4 h-4 text-[#00D9FF]" />
            <span>VIEW FULL STUDY</span>
          </button>

          {/* 2. OVERRIDE MATCH */}
          <button
            onClick={onOverrideMatch}
            disabled={!hasPrior}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              hasPrior
                ? 'bg-[#111927] hover:bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60 text-amber-300'
                : 'bg-[#111927]/50 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>OVERRIDE MATCH</span>
          </button>

          {/* 3. CONFIRM PRIOR */}
          <button
            onClick={onConfirmPrior}
            disabled={!hasPrior}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-lg ${
              hasPrior
                ? 'bg-gradient-to-r from-[#00D9FF] to-[#00b4d8] text-[#070B12] hover:brightness-110 shadow-glow-cyan cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>CONFIRM PRIOR</span>
          </button>

        </div>

      </div>
    </div>
  );
};

export default ActionToolbar;
