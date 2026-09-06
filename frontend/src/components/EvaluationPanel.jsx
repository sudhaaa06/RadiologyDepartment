import React from 'react';
import { BarChart3, Clock, CheckCircle, Zap, AlertTriangle } from 'lucide-react';

export default function EvaluationPanel({ metrics }) {
  if (!metrics) {
    return (
      <div className="panel-card" style={{ width: '100%' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading evaluation metrics...</p>
      </div>
    );
  }

  const baseline = metrics.baseline || {};
  const assistant = metrics.proposed_matching_assistant || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div className="panel-card">
        <div className="panel-header">
          <h3 className="panel-title"><BarChart3 size={20} /> Pilot Evaluation Benchmark Results</h3>
          <span className="badge badge-green">Tested on {metrics.total_test_cases} Synthetic Cases</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          {/* Baseline Card */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Baseline PACS Retrieval
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.5rem 0' }}>
              {baseline.top1_relevance_accuracy_pct || baseline.top1_accuracy_pct}% <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Top-1 Acc</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div><Clock size={14} inline /> Est. Median Time: <strong>{baseline.est_median_retrieval_time_seconds || baseline.mean_retrieval_time_seconds}s</strong></div>
              <div>Mean Candidates Reviewed: <strong>{baseline.mean_candidates_reviewed}</strong></div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', marginTop: '0.4rem' }}>
                ⚠️ Fails on terminology variations, cross-modality, and multi-scan patient histories.
              </div>
            </div>
          </div>

          {/* Assistant Card */}
          <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid var(--accent-cyan)', borderRadius: '0.5rem', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', fontWeight: 600 }}>
              Proposed Matching Assistant
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-cyan)', margin: '0.5rem 0' }}>
              {assistant.top1_relevance_accuracy_pct || assistant.top1_accuracy_pct}% <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Top-1 Acc</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              <div><CheckCircle size={14} inline style={{ color: 'var(--accent-green)' }} /> Top-3 Recall: <strong>{assistant.top3_relevance_recall_pct || assistant.top3_recall_pct}%</strong></div>
              <div><Clock size={14} inline style={{ color: 'var(--accent-cyan)' }} /> Est. Median Time: <strong>{assistant.est_median_retrieval_time_seconds || assistant.mean_retrieval_time_seconds}s</strong></div>
              <div>Mean Candidates Reviewed: <strong>{assistant.mean_candidates_reviewed}</strong></div>
              <div className="badge badge-green" style={{ marginTop: '0.4rem', width: 'fit-content' }}>
                <Zap size={14} inline /> {assistant.target_improvement_pct || assistant.target_improvement}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
