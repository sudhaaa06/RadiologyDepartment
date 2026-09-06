import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

const OVERRIDE_REASONS = [
  "Wrong anatomy",
  "Wrong modality",
  "Wrong condition",
  "Too old",
  "External study unavailable",
  "Report context mismatch",
  "Better comparison exists",
  "Other"
];

export default function OverrideModal({ prior, onClose, onSubmit }) {
  const [selectedReason, setSelectedReason] = useState(OVERRIDE_REASONS[0]);
  const [customText, setCustomText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedReason) {
      setError('Please select an override reason.');
      return;
    }
    if (selectedReason === 'Other' && !customText.trim()) {
      setError('Please provide custom reason text when selecting "Other".');
      return;
    }

    onSubmit({
      override_reason: selectedReason,
      custom_reason_text: customText.trim() || null
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={20} /> Override Recommendation: Study #{prior.study_id}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            To maintain clinical auditability, please select the primary reason for overriding this recommendation.
          </p>

          <div className="form-group">
            <label className="form-label">Override Reason *</label>
            <select 
              className="form-select"
              value={selectedReason}
              onChange={(e) => {
                setSelectedReason(e.target.value);
                setError('');
              }}
            >
              {OVERRIDE_REASONS.map((r, idx) => (
                <option key={idx} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {selectedReason === 'Other' && (
            <div className="form-group">
              <label className="form-label">Custom Explanation *</label>
              <input 
                type="text"
                className="form-input"
                placeholder="Specify clinical rationale..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />
            </div>
          )}

          {error && (
            <p style={{ color: 'var(--accent-rose)', fontSize: '0.8rem', fontWeight: 600 }}>{error}</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn" onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-amber">
              Record Override in Audit Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
