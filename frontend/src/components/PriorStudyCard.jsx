import React from 'react';
import { 
  CheckCircle2, Sparkles, Building, Calendar, 
  Clock, ShieldAlert, ChevronRight, Layers, Activity 
} from 'lucide-react';

export const PriorStudyCard = ({ 
  prior, 
  isSelected, 
  onSelect, 
  onConfirm, 
  onOverride 
}) => {
  const isTopMatch = prior.rank === 1;

  // Subscores mapping
  const subscores = [
    { label: 'Anatomy', val: prior.scores.anatomy, color: 'bg-[#00D9FF]' },
    { label: 'Modality', val: prior.scores.modality, color: 'bg-[#8B7CFF]' },
    { label: 'Condition', val: prior.scores.condition, color: 'bg-emerald-400' },
    { label: 'Report Context', val: prior.scores.reportContext, color: 'bg-[#00D9FF]' },
    { label: 'Temporal', val: prior.scores.temporal, color: 'bg-[#FFB547]' }
  ];

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-2xl p-4 transition-all duration-200 cursor-pointer select-none ${
        isSelected
          ? isTopMatch
            ? 'bg-[#0D131D] border-2 border-[#00D9FF] shadow-glow-cyan'
            : 'bg-[#0D131D] border-2 border-violet-500/70 shadow-glow-violet'
          : isTopMatch
            ? 'bg-[#0D131D] border border-cyan-500/40 hover:border-[#00D9FF] shadow-panel'
            : 'bg-[#0D131D]/80 border border-[#1D2A38] hover:border-slate-700 hover:bg-[#111927]'
      }`}
    >
      {/* Top Match Visual Tag */}
      {isTopMatch && (
        <div className="absolute -top-2.5 left-5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#00D9FF] to-[#8B7CFF] text-[#070B12] text-[9px] font-extrabold tracking-wider uppercase flex items-center gap-1 shadow-md">
          <Sparkles className="w-2.5 h-2.5 fill-current" />
          <span>Recommended Primary Prior</span>
        </div>
      )}

      {/* Main Card Content */}
      <div className="flex items-center justify-between gap-3">
        
        {/* Left: #1 CT Chest (matching wireframe) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
              isTopMatch 
                ? 'bg-cyan-500/20 text-[#00D9FF] border border-cyan-500/40' 
                : 'bg-[#162234] text-slate-300 border border-[#1D2A38]'
            }`}>
              #{prior.rank}
            </span>

            <h3 className="text-base font-bold text-white tracking-tight truncate">
              {prior.shortName || prior.studyName}
            </h3>

            <span className="text-[10px] font-mono text-slate-400">
              ({prior.year || prior.date.split('-')[0]})
            </span>

            {isSelected && (
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-400 text-[9px] font-bold border border-cyan-500/30">
                ACTIVE
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
            <span>{prior.date.split(' ')[0]}</span>
            <span>•</span>
            <span className="text-cyan-300 font-mono">{prior.interval}</span>
            <span>•</span>
            <span className="truncate max-w-[200px] text-slate-500">{prior.institution.split('-')[0]}</span>
          </div>
        </div>

        {/* Right: Exact Percentage Score (e.g. 92%, 87%, 61%) */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
              isTopMatch ? 'text-[#00D9FF]' : prior.matchScore >= 80 ? 'text-violet-300' : 'text-amber-400'
            }`}>
              {prior.matchScore}%
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
              isSelected
                ? 'bg-cyan-500 text-[#070B12] border-cyan-400 font-bold'
                : 'bg-[#111927] hover:bg-[#162234] text-slate-300 border-[#1D2A38]'
            }`}
          >
            {isSelected ? 'Active' : 'Select'}
          </button>
        </div>

      </div>

      {/* 5 Similarity Sub-bars */}
      <div className="mt-3 pt-2.5 border-t border-[#1D2A38] grid grid-cols-2 sm:grid-cols-5 gap-2">
        {subscores.map((sub, idx) => (
          <div key={idx} className="bg-[#090E17] p-1.5 rounded-lg border border-[#1D2A38]/60">
            <div className="flex items-center justify-between text-[10px] mb-0.5">
              <span className="text-slate-400">{sub.label}</span>
              <span className="font-mono text-slate-200 font-semibold">{sub.val}%</span>
            </div>
            <div className="w-full bg-[#162234] h-1 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${sub.color}`}
                style={{ width: `${sub.val}%` }}
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default PriorStudyCard;
