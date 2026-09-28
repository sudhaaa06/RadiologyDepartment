import React, { useState } from 'react';
import { ScanSearch, FileText, X, Zap, CheckCircle, AlertCircle, ChevronRight, ClipboardPaste, RotateCcw } from 'lucide-react';
import { scanReport } from '../api.js';

// ── Sample reports for quick testing ─────────────────────────────────────────
const SAMPLE_REPORTS = [
  {
    label: 'CT Chest – Lung Nodule',
    text: `CLINICAL HISTORY: 63-year-old male, ex-smoker. 
Indication: Follow-up of right upper lobe pulmonary nodule identified 6 months ago.
Examination: CT chest with contrast.
Findings: 8mm nodule in the right upper lobe, previously 6mm. Stable mediastinum. No pleural effusion.
Impression: Enlarging pulmonary nodule — recommend short-interval follow-up CT in 3 months.`
  },
  {
    label: 'MRI Brain – Stroke Follow-up',
    text: `INDICATION: Left MCA infarct diagnosed 3 weeks ago. Follow-up MRI brain requested STAT.
Modality: MRI without contrast.
Findings: Established left MCA territory infarction with ex-vacuo change. No haemorrhagic transformation. Stable compared to prior.
Impression: Stable ischemic stroke. Continue current management.`
  },
  {
    label: 'MRI Knee – Fracture',
    text: `Clinical indication: Left knee pain following fall. Query tibial plateau fracture.
URGENT examination requested.
Modality: MRI left knee without contrast.
Findings: Non-displaced lateral tibial plateau fracture. Associated bone marrow oedema. Intact cruciate ligaments.
Impression: Left tibial plateau fracture follow-up recommended at 6 weeks.`
  }
];

// ── Confidence badge helper ───────────────────────────────────────────────────
const ConfidenceBadge = ({ confidence }) => {
  const cfg = {
    HIGH:   { color: 'var(--accent-green)',  label: 'HIGH' },
    MEDIUM: { color: 'var(--accent-amber)',  label: 'MED' },
    LOW:    { color: 'var(--text-muted)',    label: 'LOW' },
    NONE:   { color: 'rgba(255,255,255,0.2)', label: '—' },
  }[confidence] || { color: 'var(--text-muted)', label: '?' };

  return (
    <span style={{
      fontSize: '0.65rem',
      fontWeight: 700,
      padding: '0.1rem 0.4rem',
      borderRadius: '0.25rem',
      background: cfg.color + '22',
      color: cfg.color,
      border: `1px solid ${cfg.color}44`,
      letterSpacing: '0.05em'
    }}>
      {cfg.label}
    </span>
  );
};

// ── Individual extracted field row ────────────────────────────────────────────
const FieldRow = ({ label, detail, icon: Icon }) => {
  const hasValue = detail?.value != null && detail.value !== '' && detail.value !== 'N/A';
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.375rem',
      background: hasValue ? 'rgba(34,211,238,0.05)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${hasValue ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.06)'}`,
      marginBottom: '0.4rem'
    }}>
      {Icon && <Icon size={13} style={{ color: hasValue ? 'var(--accent-cyan)' : 'var(--text-muted)', flexShrink: 0 }} />}
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '130px', flexShrink: 0 }}>{label}</span>
      <span style={{
        flex: 1,
        fontSize: '0.85rem',
        fontWeight: hasValue ? 600 : 400,
        color: hasValue ? 'var(--text-primary)' : 'var(--text-muted)',
        fontStyle: hasValue ? 'normal' : 'italic'
      }}>
        {hasValue ? String(detail.value) : 'Not detected'}
      </span>
      <ConfidenceBadge confidence={detail?.confidence || 'NONE'} />
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export default function ReportScannerModal({ onClose, onSearchWithFields }) {
  const [reportText, setReportText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [sampleOpen, setSampleOpen] = useState(false);

  const handleScan = async () => {
    if (!reportText.trim()) return;
    setScanning(true);
    setError(null);
    setResult(null);
    try {
      const data = await scanReport(reportText);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Scan failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const handleUseFiled = () => {
    if (!result) return;
    onSearchWithFields({
      modality: result.modality || 'CT',
      body_region: result.body_region || 'Unknown',
      laterality: result.laterality || 'N/A',
      condition_concept: result.condition_concept || '',
      clinical_indication: result.clinical_indication || reportText.slice(0, 200),
      contrast_used: result.contrast_used,
      urgency: result.urgency || 'ROUTINE',
      exam_type: result.modality || '',
      report_summary: reportText.slice(0, 500),
    });
    onClose();
  };

  const handleSampleSelect = (sample) => {
    setReportText(sample.text);
    setSampleOpen(false);
    setResult(null);
    setError(null);
  };

  const scoreColor = (score) => {
    if (score >= 70) return 'var(--accent-green)';
    if (score >= 40) return 'var(--accent-amber)';
    return 'var(--accent-rose)';
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: '0.75rem',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-primary)',
          background: 'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, transparent 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '0.5rem',
              background: 'rgba(34,211,238,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ScanSearch size={18} style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Report Scanner
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Paste a free-text radiology report to extract structured search fields
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '0.25rem',
            borderRadius: '0.375rem', display: 'flex', alignItems: 'center'
          }}>
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Textarea + controls */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={13} /> Report / Referral Text
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {/* Sample reports picker */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setSampleOpen(!sampleOpen)}
                    style={{
                      fontSize: '0.75rem', padding: '0.3rem 0.75rem',
                      background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                      borderRadius: '0.375rem', color: '#a5b4fc', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.3rem'
                    }}
                  >
                    <ClipboardPaste size={12} /> Sample Reports
                  </button>
                  {sampleOpen && (
                    <div style={{
                      position: 'absolute', right: 0, top: '2rem', zIndex: 10,
                      background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)',
                      borderRadius: '0.5rem', padding: '0.25rem', minWidth: '200px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                    }}>
                      {SAMPLE_REPORTS.map((s, i) => (
                        <button key={i} onClick={() => handleSampleSelect(s)} style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '0.5rem 0.75rem', background: 'none', border: 'none',
                          color: 'var(--text-secondary)', cursor: 'pointer',
                          fontSize: '0.8rem', borderRadius: '0.375rem',
                          transition: 'background 0.15s'
                        }}
                          onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.06)'}
                          onMouseLeave={e => e.target.style.background = 'none'}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clear button */}
                {reportText && (
                  <button onClick={() => { setReportText(''); setResult(null); setError(null); }} style={{
                    fontSize: '0.75rem', padding: '0.3rem 0.6rem',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.375rem', color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.3rem'
                  }}>
                    <RotateCcw size={11} /> Clear
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={reportText}
              onChange={e => { setReportText(e.target.value); setResult(null); setError(null); }}
              placeholder={"Paste a radiology report, referral note, or clinical summary here...\n\nExample:\n  Indication: Follow-up of right upper lobe pulmonary nodule.\n  CT chest with contrast.\n  Findings: 8mm nodule, previously 6mm..."}
              rows={9}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '0.85rem 1rem',
                background: 'var(--bg-primary)', border: '1px solid var(--border-primary)',
                borderRadius: '0.5rem', color: 'var(--text-primary)',
                fontSize: '0.85rem', lineHeight: 1.6,
                resize: 'vertical', fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-cyan)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-primary)'}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {reportText.length} characters
              </span>
              <button
                onClick={handleScan}
                disabled={!reportText.trim() || scanning}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.6rem 1.25rem',
                  background: !reportText.trim() || scanning
                    ? 'rgba(255,255,255,0.05)'
                    : 'linear-gradient(135deg, var(--accent-cyan), #0ea5e9)',
                  border: 'none', borderRadius: '0.5rem',
                  color: !reportText.trim() || scanning ? 'var(--text-muted)' : '#000',
                  fontWeight: 700, fontSize: '0.875rem', cursor: !reportText.trim() || scanning ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Zap size={15} />
                {scanning ? 'Scanning...' : 'Scan Report'}
              </button>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div style={{
              display: 'flex', gap: '0.5rem', alignItems: 'flex-start',
              padding: '0.75rem 1rem',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '0.5rem', color: '#fca5a5', fontSize: '0.85rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          {/* Results panel */}
          {result && (
            <div style={{
              border: '1px solid var(--border-primary)',
              borderRadius: '0.625rem',
              overflow: 'hidden',
              animation: 'fadeIn 0.3s ease'
            }}>
              {/* Results header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.04)',
                borderBottom: '1px solid var(--border-primary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle size={15} style={{ color: 'var(--accent-green)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    Extraction Complete — {result.extracted_fields.length} field(s) detected
                  </span>
                </div>

                {/* Confidence arc / score */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confidence</span>
                  <span style={{
                    fontSize: '1rem', fontWeight: 800,
                    color: scoreColor(result.confidence_score)
                  }}>
                    {result.confidence_score}%
                  </span>
                </div>
              </div>

              {/* Confidence bar */}
              <div style={{ height: 4, background: 'var(--border-primary)' }}>
                <div style={{
                  height: '100%',
                  width: `${result.confidence_score}%`,
                  background: scoreColor(result.confidence_score),
                  transition: 'width 0.6s ease',
                  borderRadius: '0 2px 2px 0'
                }} />
              </div>

              {/* Field rows */}
              <div style={{ padding: '1rem' }}>
                <FieldRow label="Modality"            detail={result.details?.modality}            icon={ScanSearch} />
                <FieldRow label="Body Region"         detail={result.details?.body_region}         icon={ScanSearch} />
                <FieldRow label="Laterality"          detail={result.details?.laterality}          icon={ScanSearch} />
                <FieldRow label="Condition / Concept" detail={result.details?.condition_concept}   icon={ScanSearch} />
                <FieldRow label="Clinical Indication" detail={result.details?.clinical_indication} icon={FileText}   />
                <FieldRow label="Contrast Used"       detail={result.details?.contrast_used != null ? {
                  value: result.details.contrast_used.value === true ? 'Yes — with contrast'
                        : result.details.contrast_used.value === false ? 'No — without contrast'
                        : 'Not detected',
                  confidence: result.details.contrast_used.confidence
                } : { value: null, confidence: 'NONE' }} icon={ScanSearch} />
                <FieldRow label="Urgency"             detail={result.details?.urgency}             icon={ScanSearch} />

                {/* Low confidence warning */}
                {result.confidence_score < 40 && (
                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.6rem 0.875rem',
                    background: 'rgba(245,158,11,0.08)',
                    border: '1px solid rgba(245,158,11,0.25)',
                    borderRadius: '0.375rem',
                    fontSize: '0.78rem', color: 'var(--accent-amber)',
                    display: 'flex', gap: '0.5rem', alignItems: 'flex-start'
                  }}>
                    <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                    Low extraction confidence. Consider manually verifying the fields below before running the search.
                  </div>
                )}

                {/* Use fields button */}
                <button
                  onClick={handleUseFiled}
                  style={{
                    marginTop: '1rem', width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.7rem 1rem',
                    background: result.confidence_score >= 40
                      ? 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(14,165,233,0.2))'
                      : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${result.confidence_score >= 40 ? 'rgba(34,211,238,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '0.5rem',
                    color: result.confidence_score >= 40 ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    if (result.confidence_score >= 40) e.currentTarget.style.background = 'rgba(34,211,238,0.15)';
                  }}
                  onMouseLeave={e => {
                    if (result.confidence_score >= 40) e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(14,165,233,0.2))';
                  }}
                >
                  <ChevronRight size={16} />
                  Search Prior Studies with These Fields
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}
