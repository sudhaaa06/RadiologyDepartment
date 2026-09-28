import React from 'react';
import { PriorStudyCard } from './PriorStudyCard.jsx';
import { Layers, AlertCircle, FileSearch, ShieldCheck, RefreshCw } from 'lucide-react';

export const PriorStudyResults = ({
  priorStudies,
  selectedPriorId,
  onSelectPrior,
  onConfirmPrior,
  onOverridePrior,
  isLoading = false
}) => {
  // Loading State Skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 bg-[#111927] rounded animate-pulse" />
          <div className="h-5 w-24 bg-[#111927] rounded animate-pulse" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="bg-[#0D131D] border border-[#1D2A38] rounded-2xl p-5 space-y-3 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 bg-[#162234] rounded" />
              <div className="h-8 w-16 bg-[#162234] rounded-xl" />
            </div>
            <div className="h-6 w-3/4 bg-[#162234] rounded" />
            <div className="h-3 w-1/2 bg-[#162234] rounded" />
            <div className="grid grid-cols-5 gap-2 pt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="h-8 bg-[#111927] rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // NO PRIOR STUDIES FOUND (Empty State)
  if (!priorStudies || priorStudies.length === 0) {
    return (
      <div className="bg-[#0D131D] border border-[#1D2A38] rounded-2xl p-8 text-center shadow-panel">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
          <FileSearch className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white tracking-tight">
          No Historical Prior Studies Found
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
          The federated DICOM query across 4 regional archives returned zero historical imaging encounters for this patient.
        </p>

        <div className="mt-5 p-3.5 bg-[#090E17] border border-[#1D2A38] rounded-xl max-w-md mx-auto text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-cyan-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#00D9FF]" />
            <span>Designated as Baseline Index Examination</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            This study will serve as the initial chronological baseline. All future imaging orders for this MRN will automatically index against this scan.
          </p>
        </div>

        <div className="mt-4 text-[11px] text-slate-500 font-mono">
          Federated archives searched: Memorial General, St. Jude, Valley Health, Childrens Network
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-md bg-cyan-500/15 text-[#00D9FF]">
            <Layers className="w-4 h-4" />
          </span>
          <h2 className="text-base font-bold text-white tracking-tight">
            Ranked Prior Study Matches
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-[#111927] border border-[#1D2A38] text-xs font-mono text-cyan-300">
            {priorStudies.length} Found
          </span>
        </div>

        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
          Ranked by Multi-Factor Clinical Relevance
        </span>
      </div>

      {/* Cards List */}
      <div className="space-y-3.5">
        {priorStudies.map((prior) => (
          <PriorStudyCard
            key={prior.id}
            prior={prior}
            isSelected={selectedPriorId === prior.id}
            onSelect={() => onSelectPrior(prior.id)}
            onConfirm={() => onConfirmPrior(prior)}
            onOverride={() => onOverridePrior(prior)}
          />
        ))}
      </div>
    </div>
  );
};

export default PriorStudyResults;
