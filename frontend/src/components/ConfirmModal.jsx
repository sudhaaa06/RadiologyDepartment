import React from 'react';
import { ShieldAlert, CheckCircle2, X } from 'lucide-react';

export default function ConfirmModal({ prior, currentStudy, onClose, onConfirm }) {
  if (!prior || !currentStudy) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={20} /> Confirm Prior Study Comparison
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            You are confirming that this study is appropriate for clinical comparison against active Study <strong>#{currentStudy.study_id}</strong>.
          </p>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.85rem', borderRadius: '0.375rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>
              Suggested Prior: Study #{prior.study_id} ({prior.study_date})
            </div>
            <div style={{ color: 'var(--text-primary)' }}>
              {prior.modality} • {prior.body_region} • {prior.condition_concept}
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Evidence Rule Breakdown:
            </div>
            <ul className="evidence-list">
              {prior.evidence?.slice(0, 4).map((ev, idx) => (
                <li key={idx} className="evidence-item" style={{ color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={13} style={{ color: 'var(--accent-green)', minWidth: 13 }} />
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mandatory Human-in-the-Loop Safety Disclaimer */}
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.75rem', borderRadius: '0.375rem', color: 'var(--accent-amber)', fontSize: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <ShieldAlert size={16} style={{ minWidth: 16, marginTop: 2 }} />
            <span>
              <strong>SAFETY BOUNDARY:</strong> This action does NOT represent a diagnosis, treatment recommendation, or clinical management decision. It strictly records historical study comparison relevance.
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button type="button" className="btn" onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
            Cancel
          </button>
          <button type="button" className="btn btn-green" onClick={onConfirm}>
            <CheckCircle2 size={15} /> Confirm Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
