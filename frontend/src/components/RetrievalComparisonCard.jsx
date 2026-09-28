import React from 'react';

export default function RetrievalComparisonCard({
  comparisonSummary,
  baselineTop,
  assistantTop,
  currentStudy,
  onSelectPrior = () => {}
}) {
  if (!comparisonSummary && !baselineTop && !assistantTop) {
    return null;
  }

  const isMatch = comparisonSummary?.rank_match;

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            ⚖️
          </div>
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <span>Baseline vs Proposed Assistant Comparison</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700">
                Feature 2
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Side-by-side evaluation of traditional recency rule vs explainable multi-signal engine
            </p>
          </div>
        </div>

        {/* Concordance Status Badge */}
        <div>
          {isMatch ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
              Concordant Rank #1 (Both Selected Same Prior)
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-400 mr-2" />
              Discordant Ranking (Engines Prioritized Differently)
            </span>
          )}
        </div>
      </div>

      {/* Side-by-side Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline Column */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>Classic Baseline PACS Rule</span>
                <span className="text-[10px] text-slate-500 font-normal">(Recency + Exact Filter)</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                Score: {baselineTop ? `${baselineTop.score}/100` : 'N/A'}
              </span>
            </div>

            {baselineTop ? (
              <div className="space-y-2 mt-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-sm font-bold text-white font-mono">
                    {baselineTop.study_id}
                  </div>
                  <div className="text-xs text-slate-400">
                    Date: {baselineTop.study_date}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <div><span className="text-slate-500">Modality:</span> {baselineTop.modality}</div>
                  <div><span className="text-slate-500">Region:</span> {baselineTop.body_region}</div>
                  <div className="col-span-2 truncate"><span className="text-slate-500">Indication:</span> {baselineTop.condition_concept}</div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded border border-slate-800/60 space-y-1">
                  <div className="font-medium text-slate-300">Baseline Filter Rationale:</div>
                  {baselineTop.evidence?.map((e, idx) => (
                    <div key={idx} className="text-slate-400">{e}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-6 text-center italic">
                No matching candidate found by baseline rule
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>Method: Timestamp Sort</span>
            <span>Est. Search Time: ~42.2s</span>
          </div>
        </div>

        {/* Assistant Column */}
        <div className="bg-gradient-to-b from-indigo-950/20 to-slate-950/60 border border-indigo-500/30 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-500/50 transition relative overflow-hidden">
          <div className="absolute top-0 right-0 px-2 py-0.5 bg-indigo-600 text-[10px] font-bold text-white uppercase rounded-bl-lg tracking-wider">
            Assistant Rank #1
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>Proposed Assistant Engine</span>
                <span className="text-[10px] text-indigo-300 font-normal">(7-Factor Multimodal)</span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Score: {assistantTop ? `${assistantTop.score}/100` : 'N/A'}
              </span>
            </div>

            {assistantTop ? (
              <div className="space-y-2 mt-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <span>{assistantTop.study_id}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {assistantTop.evidence_level}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Date: {assistantTop.study_date}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/90 p-2.5 rounded-lg border border-indigo-900/30">
                  <div><span className="text-slate-500">Modality:</span> {assistantTop.modality}</div>
                  <div><span className="text-slate-500">Region:</span> {assistantTop.body_region}</div>
                  <div className="col-span-2 truncate"><span className="text-slate-500">Matched Condition:</span> <strong className="text-indigo-300">{assistantTop.condition_concept}</strong></div>
                </div>

                <div className="text-[11px] text-slate-300 bg-indigo-950/30 p-2 rounded border border-indigo-900/40 space-y-1">
                  <div className="font-medium text-indigo-300">Top Supporting Signals:</div>
                  {assistantTop.positive_signals?.slice(0, 3).map((sig, idx) => (
                    <div key={idx} className="text-slate-300 truncate">{sig}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-6 text-center italic">
                No recommendation generated
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-indigo-900/30 flex items-center justify-between text-xs text-indigo-400">
            <span>Method: Multimodal Reasoning</span>
            <span>Est. Search Time: ~18.5s</span>
          </div>
        </div>
      </div>

      {/* Rationale Difference Callout */}
      {comparisonSummary?.rationale_difference && (
        <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start space-x-2.5">
          <span className="text-base mt-[-2px]">💡</span>
          <div>
            <span className="font-semibold text-white mr-1.5">Ranking Rationale Analysis:</span>
            <span>{comparisonSummary.rationale_difference}</span>
          </div>
        </div>
      )}
    </div>
  );
}
