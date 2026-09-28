import React, { useState } from 'react';
import { 
  History, Calendar, Clock, ChevronRight, ChevronDown, 
  Activity, TrendingUp, Layers, AlertCircle, ShieldAlert, FileText 
} from 'lucide-react';

export const ClinicalTimelineSidebar = ({
  priorStudies,
  selectedPriorId,
  onSelectPrior,
  changeOverTime
}) => {
  const [expandedTimelineId, setExpandedTimelineId] = useState(null);

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedTimelineId(expandedTimelineId === id ? null : id);
  };

  return (
    <aside className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0 flex flex-col gap-3.5">
      
      {/* SECTION: TIMELINE (matching wireframe) */}
      <div className="bg-[#0D131D] border border-[#1D2A38] rounded-2xl p-4 shadow-panel">
        
        <div className="flex items-center justify-between pb-2 border-b border-[#1D2A38]">
          <span className="text-[10px] font-mono tracking-widest text-[#00D9FF] font-bold uppercase flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-[#8B7CFF]" />
            TIMELINE
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {priorStudies?.length || 0} Studies
          </span>
        </div>

        {/* Timeline Items: 2025 CT 92%, 2024 CT 87%, 2023 X-Ray 61% */}
        {(!priorStudies || priorStudies.length === 0) ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No historical studies on record for this patient.
          </div>
        ) : (
          <div className="relative mt-3.5 space-y-3 before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-[#1D2A38]">
            {priorStudies.map((study) => {
              const isSelected = study.id === selectedPriorId;
              const isExpanded = expandedTimelineId === study.id;
              const year = study.year || study.date.split('-')[0];

              return (
                <div 
                  key={study.id}
                  onClick={() => onSelectPrior(study.id)}
                  className="relative pl-7 cursor-pointer select-none transition-all group"
                >
                  {/* Timeline Dot Node */}
                  <div className={`absolute left-1.5 top-2.5 w-3 h-3 rounded-full border-2 transition-all -translate-x-1/2 ${
                    isSelected
                      ? 'bg-[#00D9FF] border-[#070B12] ring-2 ring-[#00D9FF]/40 shadow-glow-cyan-sm'
                      : 'bg-[#111927] border-[#2A3B4D] group-hover:border-cyan-400'
                  }`} />

                  {/* Timeline Card Entry: 2025 CT - 92% */}
                  <div className={`p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500/50 shadow-sm'
                      : 'bg-[#111927]/90 border-[#1D2A38] hover:border-slate-700 hover:bg-[#162234]'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-white">
                        <span className="font-mono text-cyan-300 mr-1.5">{year}</span>
                        <span>{study.shortName || study.studyName}</span>
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded font-mono text-xs font-extrabold ${
                        study.matchScore >= 90
                          ? 'bg-cyan-500/20 text-[#00D9FF]'
                          : study.matchScore >= 80
                          ? 'bg-violet-500/20 text-[#8B7CFF]'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {study.matchScore}%
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between font-mono">
                      <span>{study.date.split(' ')[0]}</span>
                      <span className="text-slate-500">{study.interval}</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* SECTION: CHANGE OVER TIME (matching wireframe) */}
      <div className="bg-[#0D131D] border border-[#1D2A38] rounded-2xl p-4 shadow-panel">
        
        <div className="flex items-center justify-between pb-2 border-b border-[#1D2A38]">
          <span className="text-[10px] font-mono tracking-widest text-[#00D9FF] font-bold uppercase flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#00D9FF]" />
            CHANGE OVER TIME
          </span>
        </div>

        {/* Target Finding Title */}
        <div className="mt-2.5 bg-[#090E17] p-2 rounded-xl border border-[#1D2A38]">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block">
            Target Tracked Finding
          </span>
          <span className="text-xs font-bold text-cyan-300 block mt-0.5 truncate">
            {changeOverTime?.targetFinding || 'Nodule Progression'}
          </span>
        </div>

        {/* Documented Historical Findings Trajectory */}
        {changeOverTime?.timelinePoints && changeOverTime.timelinePoints.length > 0 ? (
          <div className="mt-3 space-y-2">
            <div className="space-y-1.5">
              {changeOverTime.timelinePoints.map((pt, idx) => (
                <div key={idx} className="bg-[#111927] p-2 rounded-xl border border-[#1D2A38]/70 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400 font-medium">{pt.year} • {pt.study}</span>
                    <span className={`font-bold ${
                      pt.sizeMm >= 8.0 
                        ? 'text-amber-400' 
                        : pt.sizeMm 
                        ? 'text-cyan-300' 
                        : 'text-slate-400'
                    }`}>
                      {pt.displaySize}
                    </span>
                  </div>

                  {pt.sizeMm && (
                    <div className="w-full bg-[#162234] h-1 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          pt.year === '2026' ? 'bg-[#FFB547]' : 'bg-[#00D9FF]'
                        }`}
                        style={{ width: `${Math.min(100, (pt.sizeMm / 10) * 100)}%` }}
                      />
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span className="truncate max-w-[160px]">"{pt.term}"</span>
                    <span className="text-slate-500 font-mono">{pt.mentions}x</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Documented Details */}
            <div className="mt-2.5 space-y-1.5">
              {changeOverTime.morphologyProgression?.map((item, idx) => (
                <div key={idx} className="text-[10px] bg-[#090E17] p-1.5 rounded-lg border border-[#1D2A38]/50">
                  <span className="text-slate-400 font-medium block">{item.label}</span>
                  <span className="text-slate-200 font-mono block mt-0.5">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-slate-400">
            No historical timeline progression available for baseline study.
          </div>
        )}

        {/* Safety Note */}
        <div className="mt-3 pt-2 border-t border-[#1D2A38] text-[10px] text-amber-300/80 flex items-center gap-1.5">
          <ShieldAlert className="w-3 h-3 text-amber-400 flex-shrink-0" />
          <span>Historical documented metrics only. Non-diagnostic.</span>
        </div>

      </div>

    </aside>
  );
};

export default ClinicalTimelineSidebar;
