import React from 'react';
import { Sparkles, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function DemoModeSelector({ activePreset, onSelectPreset }) {
  const PRESETS = [
    {
      id: 'journey1_stat_brain',
      label: '1. STAT CT Brain (Journey 1)',
      urgency: 'STAT',
      desc: 'STAT acute stroke study with timeline stepper & #1 ranked prior CT Brain'
    },
    {
      id: 'journey2_routine_knee',
      label: '2. ROUTINE MRI Knee (Journey 2)',
      urgency: 'ROUTINE',
      desc: 'ROUTINE MRI Knee demonstrating radiologist override & "Better comparison exists"'
    },
    {
      id: 'external_centre_chest',
      label: '3. External-Centre CT Chest',
      urgency: 'ROUTINE',
      desc: 'Terminology variation ("CT thorax" / "CAT Scan") normalized seamlessly'
    },
    {
      id: 'missing_metadata',
      label: '4. Missing Metadata Case',
      urgency: 'ROUTINE',
      desc: 'Missing anatomy / condition fields triggering exam_type fallback'
    },
    {
      id: 'no_priors_available',
      label: '5. No Relevant Prior Case',
      urgency: 'ROUTINE',
      desc: 'Triggers low confidence warning: "Limited retrieval evidence"'
    }
  ];

  return (
    <div className="panel-card" style={{ marginBottom: '1.25rem' }}>
      <div className="panel-header">
        <h3 className="panel-title" style={{ color: 'var(--accent-cyan)' }}>
          <Sparkles size={18} /> Demo Mode — Selectable Evaluation Journeys
        </h3>
        <span className="badge badge-cyan">Evaluator Quick Select</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            className="btn"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '0.75rem',
              textAlign: 'left',
              background: activePreset === p.id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.02)',
              borderColor: activePreset === p.id ? 'var(--accent-cyan)' : 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
            onClick={() => onSelectPreset(p.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '0.2rem' }}>
              <strong style={{ fontSize: '0.85rem', color: activePreset === p.id ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                {p.label}
              </strong>
              <span className={`badge ${p.urgency === 'STAT' ? 'badge-rose' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
                {p.urgency}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {p.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
