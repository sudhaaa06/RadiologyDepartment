import React, { useMemo } from 'react';
import {
  Layers, Zap, Clock, CheckCircle2, BarChart3, AlertTriangle, RotateCcw, TrendingUp
} from 'lucide-react';

// Animated count-up number
function StatCard({ icon: Icon, label, value, sub, accentColor, trend }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      padding: '0.9rem 1rem',
      background: 'rgba(255,255,255,0.025)',
      border: `1px solid ${accentColor}33`,
      borderLeft: `3px solid ${accentColor}`,
      borderRadius: '0.5rem',
      minWidth: 0,
      transition: 'background 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={e => e.currentTarget.style.background = `${accentColor}0d`}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Icon size={13} style={{ color: accentColor, flexShrink: 0 }} />
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {label}
        </span>
      </div>

      <div style={{
        fontSize: '1.45rem',
        fontWeight: 800,
        color: accentColor,
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
      }}>
        {value}
      </div>

      {sub && (
        <div style={{
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {sub}
        </div>
      )}

      {trend != null && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.68rem',
          color: trend >= 0 ? 'var(--accent-green)' : 'var(--accent-rose)',
          fontWeight: 600,
          marginTop: '0.1rem',
        }}>
          <TrendingUp size={10} />
          {trend >= 0 ? '+' : ''}{trend}% from baseline
        </div>
      )}
    </div>
  );
}

/**
 * WorklistStatsBar
 *
 * Props:
 *   studies       – full RadiologyStudy[] array (from GET /api/studies)
 *   auditLogs     – AuditLogEntry[] (from GET /api/audit-log)
 *   metrics       – pilot metrics object (from GET /api/metrics)
 *
 * Derived stats (all computed client-side, no extra API call):
 *   Total incoming studies
 *   STAT studies count
 *   Urgent studies count
 *   Routine studies count
 *   Studies waiting for review (no feedback in audit log)
 *   Prior-study matches completed
 *   Average time to locate prior
 *   Override rate
 */
export default function WorklistStatsBar({ studies = [], auditLogs = [], metrics = null, compact = false }) {
  const stats = useMemo(() => {
    const stat   = studies.filter(s => s.urgency === 'STAT').length;
    const urgent = studies.filter(s => s.urgency === 'URGENT').length;
    const routine = studies.filter(s => s.urgency === 'ROUTINE').length;

    const decisionsConfirmed = auditLogs.filter(l =>
      l.action === 'DECISION_CONFIRMED' || l.human_decision === 'CONFIRMED'
    ).length;
    const decisionsOverridden = auditLogs.filter(l =>
      l.action === 'DECISION_OVERRIDDEN' || l.human_decision === 'OVERRIDDEN'
    ).length;
    const matchEvents = auditLogs.filter(l =>
      l.action === 'RETRIEVAL_RUN_ASSISTANT' || l.action === 'RETRIEVAL_RUN_BASELINE'
    ).length;

    const totalDecisions = decisionsConfirmed + decisionsOverridden;
    const overrideRate = totalDecisions > 0
      ? ((decisionsOverridden / totalDecisions) * 100).toFixed(1)
      : '0.0';

    const decidedStudyIds = new Set(
      auditLogs
        .filter(l => l.human_decision === 'CONFIRMED' || l.human_decision === 'OVERRIDDEN')
        .map(l => l.study_id)
        .filter(Boolean)
    );
    const awaitingReview = Math.max(0, studies.length - decidedStudyIds.size);

    const timedLogs = auditLogs.filter(l =>
      (l.action === 'DECISION_CONFIRMED' || l.action === 'DECISION_OVERRIDDEN') &&
      l.duration_seconds && l.duration_seconds > 0
    );
    const avgTime = timedLogs.length > 0
      ? (timedLogs.reduce((sum, l) => sum + (l.duration_seconds || 0), 0) / timedLogs.length).toFixed(1)
      : metrics?.proposed_matching_assistant?.est_median_retrieval_time_seconds || '—';

    const avgTimeDisplay = timedLogs.length > 0 ? `${avgTime}s` : `~${avgTime}s`;

    return {
      total: studies.length,
      stat,
      urgent,
      routine,
      awaitingReview,
      matchesCompleted: matchEvents,
      decisionsTotal: totalDecisions,
      avgTime: avgTimeDisplay,
      overrideRate: `${overrideRate}%`,
      overrideRateNum: parseFloat(overrideRate),
    };
  }, [studies, auditLogs, metrics]);

  // ── Compact mode: horizontal pill strip ───────────────────────────────────
  if (compact) {
    const pills = [
      { label: 'Total', value: stats.total, color: '#22d3ee' },
      { label: 'STAT', value: stats.stat, color: '#f43f5e' },
      { label: 'Urgent', value: stats.urgent, color: '#f59e0b' },
      { label: 'Routine', value: stats.routine, color: '#6ee7b7' },
      { label: 'Awaiting Review', value: stats.awaitingReview, color: '#a78bfa' },
      { label: 'Matches', value: stats.matchesCompleted, color: '#34d399' },
      { label: 'Avg Locate', value: stats.avgTime, color: '#38bdf8' },
      { label: 'Override Rate', value: stats.overrideRate, color: stats.overrideRateNum > 20 ? '#fb923c' : '#4ade80' },
    ];
    return (
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center',
      }}>
        {pills.map(p => (
          <div key={p.label} style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.3rem 0.65rem',
            background: `${p.color}12`,
            border: `1px solid ${p.color}35`,
            borderRadius: '999px',
            fontSize: '0.75rem',
          }}>
            <span style={{ color: 'var(--text-muted)' }}>{p.label}</span>
            <span style={{ fontWeight: 700, color: p.color }}>{p.value}</span>
          </div>
        ))}
      </div>
    );
  }

  // ── Full grid mode ────────────────────────────────────────────────────────
  const CARDS = [
    { icon: Layers,       label: 'Total Incoming',    value: stats.total,            sub: 'studies in worklist',   color: '#22d3ee' },
    { icon: Zap,          label: 'STAT',              value: stats.stat,             sub: 'emergency priority',    color: '#f43f5e' },
    { icon: AlertTriangle,label: 'Urgent',            value: stats.urgent,           sub: 'high priority',         color: '#f59e0b' },
    { icon: RotateCcw,    label: 'Routine',           value: stats.routine,          sub: 'standard priority',     color: '#6ee7b7' },
    { icon: Clock,        label: 'Awaiting Review',   value: stats.awaitingReview,   sub: 'no decision yet',       color: '#a78bfa' },
    { icon: CheckCircle2, label: 'Matches Completed', value: stats.matchesCompleted, sub: 'retrieval runs',        color: '#34d399' },
    { icon: Clock,        label: 'Avg Time to Locate',value: stats.avgTime,          sub: 'per decision',          color: '#38bdf8' },
    { icon: BarChart3,    label: 'Override Rate',     value: stats.overrideRate,
      sub: `${stats.decisionsTotal} total decisions`,
      color: stats.overrideRateNum > 20 ? '#fb923c' : '#4ade80' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: '0.75rem',
      width: '100%',
    }}>
      {CARDS.map((c) => (
        <StatCard
          key={c.label}
          icon={c.icon}
          label={c.label}
          value={c.value}
          sub={c.sub}
          accentColor={c.color}
        />
      ))}
    </div>
  );
}
