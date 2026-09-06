import React from 'react';
import { Calendar, Building, Tag, FileText } from 'lucide-react';

export default function CurrentStudyCard({ study }) {
  if (!study) {
    return (
      <div className="panel-card">
        <div className="panel-header">
          <h3 className="panel-title">Current Active Study</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select a study from the worklist to view details.</p>
      </div>
    );
  }

  return (
    <div className="panel-card">
      <div className="panel-header">
        <h3 className="panel-title">Current Study #{study.study_id}</h3>
        <span className="badge badge-cyan">{study.modality}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
          <span><Calendar size={14} inline /> Date: <strong>{study.study_date}</strong></span>
          <span>Patient: <strong>{study.patient_id_hash}</strong></span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="badge badge-green">Region: {study.body_region}</span>
          {study.anatomy && <span className="badge badge-green">Anatomy: {study.anatomy}</span>}
          {study.laterality && study.laterality !== 'N/A' && (
            <span className="badge badge-amber">Laterality: {study.laterality}</span>
          )}
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}>
          <div style={{ fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Tag size={14} /> Clinical Indication:
          </div>
          <p style={{ color: 'var(--text-primary)' }}>{study.clinical_indication}</p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Building size={14} /> Source & Department:
          </div>
          <p style={{ color: 'var(--text-primary)' }}>{study.source_centre} ({study.department || 'N/A'})</p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.65rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}>
          <div style={{ fontWeight: 600, color: 'var(--accent-teal)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <FileText size={14} /> Impression / Report Context:
          </div>
          <p style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>"{study.report_summary}"</p>
        </div>
      </div>
    </div>
  );
}
