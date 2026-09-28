import React, { useState } from 'react';
import { 
  Check, CheckCircle2, ChevronDown, ChevronUp, Layers, 
  Clock, FileText, Activity, ShieldCheck, Sparkles, AlertTriangle, Maximize2 
} from 'lucide-react';

export const WhyThisMatchEvidence = ({ 
  activePrior, 
  currentStudy,
  onConfirmPrior,
  onOverrideMatch,
  onViewFullStudy
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!activePrior || !activePrior.evidence) {
    return null;
  }

  const { evidence, reportExcerpt, documentedMeasurements, scores } = activePrior;

  // The 4 core evidence dimensions from wireframe + detailed metrics
  const checklist = [
    { id: 'anatomy', label: 'Same anatomy', desc: evidence.sameAnatomy, score: scores.anatomy },
    { id: 'modality', label: 'Same modality', desc: evidence.sameModality, score: scores.modality },
    { id: 'condition', label: 'Similar condition', desc: evidence.similarIndication, score: scores.condition },
    { id: 'report', label: 'Report context', desc: evidence.reportTerminology, score: scores.reportContext },
    { id: 'finding', label: 'Previous condition mention', desc: evidence.previousCondition, score: scores.condition },
    { id: 'time', label: 'Temporal relevance', desc: evidence.timeRelevance, score: scores.temporal }
  ];

  return (
    <div className="bg-[#0D131D] border border-[#1D2A38] rounded-2xl p-4 lg:p-5 shadow-panel transition-all">
      
      {/* Header: WHY THIS MATCH? */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-[#1D2A38]"
      >
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-cyan-500/15 text-[#00D9FF]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white tracking-tight uppercase">
              WHY THIS MATCH?
            </h2>
            <p className="text-[11px] text-slate-400">
              Transparent clinical concordance for #{activePrior.rank} {activePrior.shortName || activePrior.studyName} ({activePrior.matchScore}%)
            </p>
          </div>
        </div>

        <button 
          className="p-1.5 rounded-lg bg-[#111927] border border-[#1D2A38] text-slate-400 hover:text-white transition-colors"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3.5 space-y-4 animate-fadeIn">
          
          {/* Wireframe Checkmark List (✓ Same anatomy, ✓ Same modality, ✓ Similar condition, ✓ Report context) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {checklist.map((item) => (
              <div 
                key={item.id}
                className="bg-[#090E17] border border-[#1D2A38] rounded-xl p-3 flex items-start gap-2.5 hover:border-slate-700 transition-colors"
              >
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mt-0.5 flex-shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-100">
                      {item.label}
                    </span>
                    <span className="font-mono text-[11px] text-[#00D9FF] font-semibold">
                      {item.score}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Report Context Snippet */}
          {reportExcerpt && (
            <div className="bg-[#090E17] border border-[#1D2A38] rounded-xl p-3">
              <div className="flex items-center justify-between mb-1.5 text-[11px]">
                <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  Historical Report Lexical Evidence
                </span>
                <span className="font-mono text-slate-500 text-[10px]">
                  {reportExcerpt.title}
                </span>
              </div>
              <div className="text-xs text-slate-300 font-mono bg-[#05080E] p-2.5 rounded-lg border border-[#1D2A38]/70 leading-relaxed">
                "{reportExcerpt.text}"
              </div>
            </div>
          )}

          {/* ACTION BUTTONS DIRECTLY IN CENTER FLOW: [CONFIRM] [OVERRIDE] [VIEW FULL STUDY] */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#1D2A38]">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Attestation required for clinical PACS sign-off</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onViewFullStudy}
                className="px-3.5 py-2 rounded-xl bg-[#111927] hover:bg-[#162234] border border-[#1D2A38] text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#00D9FF]" />
                <span>Full Study</span>
              </button>

              <button
                onClick={onOverrideMatch}
                className="px-4 py-2 rounded-xl bg-[#111927] hover:bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>OVERRIDE</span>
              </button>

              <button
                onClick={onConfirmPrior}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#00D9FF] to-[#00b4d8] text-[#070B12] text-xs font-extrabold tracking-wider flex items-center gap-1.5 shadow-glow-cyan hover:brightness-110 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRM</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default WhyThisMatchEvidence;
