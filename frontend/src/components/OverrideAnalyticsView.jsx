import React, { useEffect, useState } from 'react';
import { fetchOverrideAnalytics } from '../api';

export default function OverrideAnalyticsView() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await fetchOverrideAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load override analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="animate-spin text-3xl mb-3">⚙️</div>
        <div>Aggregating clinical override statistics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-12 text-center text-rose-400">
        Failed to load override analytics. Please ensure backend service is running.
      </div>
    );
  }

  const reasons = Object.entries(analytics.reason_distribution || {});
  const maxReasonCount = Math.max(...reasons.map(([_, count]) => count), 1);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📊 Override Reason Analytics & Error Analysis</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Feature 5
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated radiologist decision audit telemetry and error pattern distribution
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5"
        >
          <span>↻</span> Refresh Telemetry
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Decisions Recorded</div>
          <div className="text-3xl font-extrabold text-white mt-1 font-mono">{analytics.total_decisions}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {analytics.confirm_count} Confirmed · {analytics.override_count} Overridden
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Clinical Override Rate</div>
          <div className={`text-3xl font-extrabold mt-1 font-mono ${analytics.override_rate_pct > 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {analytics.override_rate_pct}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Target benchmark: &lt; 15% override rate
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Most Common Failure Reason</div>
          <div className="text-lg font-bold text-amber-300 mt-1 truncate">
            {analytics.most_common_failure_reason}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Primary driver of radiologist adjustment
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Median Time-to-Locate</div>
          <div className="text-xl font-bold text-white mt-1 font-mono">
            <span className="text-emerald-400">{analytics.median_confirm_duration_seconds}s</span>{' '}
            <span className="text-xs text-slate-500 font-normal">conf. /</span>{' '}
            <span className="text-amber-400">{analytics.median_override_duration_seconds}s</span>{' '}
            <span className="text-xs text-slate-500 font-normal">over.</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Baseline unassisted median: 42.2s
          </div>
        </div>
      </div>

      {/* Reason Distribution Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            <span>Distribution of Radiologist Override Reasons</span>
            <span className="text-xs text-slate-400 font-normal">8 Mandatory Categorizations</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Every clinical override requires a structured reason to power root cause analysis and ranking refinement
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {reasons.map(([reasonName, count]) => {
            const pctOfOverrides = analytics.override_count > 0 ? Math.round((count / analytics.override_count) * 100) : 0;
            const barWidth = Math.round((count / maxReasonCount) * 100);

            return (
              <div key={reasonName} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300">{reasonName}</span>
                  <div className="space-x-2 text-right">
                    <span className="font-mono font-bold text-white">{count}</span>
                    <span className="text-slate-500 font-mono text-[11px]">({pctOfOverrides}%)</span>
                  </div>
                </div>

                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      count > 0 ? 'bg-gradient-to-r from-indigo-500 to-cyan-400' : 'bg-transparent'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Analysis Matrix / Recent Overrides Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Error Analysis Table (Recent Overrides)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Detailed audit trail records of radiologist adjustments for model improvement
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Showing {analytics.recent_overrides?.length || 0} events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Study ID</th>
                <th className="py-2.5 px-3">Recommended Prior</th>
                <th className="py-2.5 px-3">Selected Prior</th>
                <th className="py-2.5 px-3">Override Reason</th>
                <th className="py-2.5 px-3">Radiologist Notes</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Reviewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {analytics.recent_overrides?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500 italic">
                    No override events recorded yet. Confirmations and overrides will appear here in real time.
                  </td>
                </tr>
              ) : (
                analytics.recent_overrides.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {row.timestamp ? new Date(row.timestamp).toLocaleTimeString() : 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">{row.study_id}</td>
                    <td className="py-2.5 px-3 text-slate-400">{row.recommended_prior_id || 'None'}</td>
                    <td className="py-2.5 px-3 text-amber-300 font-semibold">{row.selected_prior || 'None (Manual Search)'}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/10 text-rose-300 border border-rose-500/30 whitespace-nowrap">
                        {row.override_reason || 'Other'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate font-sans text-xs" title={row.override_notes || ''}>
                      {row.override_notes || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-300 whitespace-nowrap">
                      {row.duration_seconds !== null && row.duration_seconds !== undefined ? `${row.duration_seconds}s` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{row.user || 'Radiologist'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
