import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, Lock } from 'lucide-react';

export default function PriorStudyCard({ prior, onConfirm, onOverride, userRole }) {
  const isTopRank = prior.rank === 1;
  const score = Math.round(prior.score);
  const isRadiologist = userRole === 'Radiologist';

  return (
    <div className={`prior-card ${isTopRank ? 'top-rank' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className={`badge ${isTopRank ? 'badge-cyan' : 'badge-amber'}`} style={{ fontSize: '0.85rem' }}>
            Rank #{prior.rank}
          </span>
          <span style={{ fontWeight: 700, fontSize: '1.05rem', color: isTopRank ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
            Study #{prior.study_id}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({prior.study_date})</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-green" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
            {score} / 100 Match
          </span>
        </div>
      </div>

      {/* Relevance explanation tag when clinical relevance > recency */}
      {prior.relevance_explanation_tag && (
        <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', color: 'var(--accent-cyan)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Info size={14} style={{ minWidth: 14 }} />
          <span>{prior.relevance_explanation_tag}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
        <span className="badge badge-cyan">{prior.modality}</span>
        <span className="badge badge-green">{prior.body_region}</span>
        {prior.anatomy && <span className="badge badge-green">{prior.anatomy}</span>}
        <span className="badge badge-amber">{prior.condition_concept}</span>
      </div>

      {/* 0-100 Score Breakdown */}
      {prior.score_breakdown && Object.keys(prior.score_breakdown).length > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
            Score Breakdown (Total: {score} / 100):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {Object.entries(prior.score_breakdown).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '0.2rem 0.4rem', borderRadius: '0.2rem' }}>
                <span>{k}:</span>
                <strong style={{ color: 'var(--text-primary)' }}>+{Math.round(v)}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positive & Negative Signals */}
      <div style={{ background: 'rgba(0,0,0,0.15)', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
          Positive & Negative Evidence Signals:
        </div>
        <ul className="evidence-list">
          {prior.positive_signals?.map((ev, idx) => (
            <li key={`pos-${idx}`} className="evidence-item" style={{ color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={13} style={{ color: 'var(--accent-green)', minWidth: 13 }} />
              <span>{ev}</span>
            </li>
          ))}
          {prior.negative_signals?.map((ev, idx) => (
            <li key={`neg-${idx}`} className="evidence-item" style={{ color: 'var(--accent-amber)' }}>
              <AlertTriangle size={13} style={{ color: 'var(--accent-amber)', minWidth: 13 }} />
              <span>{ev}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions / Enforced RBAC Restrictions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
        {isRadiologist ? (
          <>
            <button 
              className="btn btn-amber"
              onClick={() => onOverride(prior)}
            >
              <XCircle size={15} /> Override
            </button>

            <button 
              className="btn btn-green"
              onClick={() => onConfirm(prior)}
            >
              <CheckCircle2 size={15} /> Confirm Comparison
            </button>
          </>
        ) : (
          <div className="badge badge-amber" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', gap: '0.4rem' }}>
            <Lock size={14} /> Radiologist confirmation required
          </div>
        )}
      </div>
    </div>
  );
}
