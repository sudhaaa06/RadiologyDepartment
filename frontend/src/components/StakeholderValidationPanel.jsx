import React, { useState, useEffect } from 'react';
import { UserCheck, Star, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { fetchValidationSummary, submitValidation } from '../api.js';

export default function StakeholderValidationPanel({ user }) {
  const [ratings, setRatings] = useState({
    ease_of_finding_priors: 5,
    clarity_of_recommendation: 5,
    usefulness_of_evidence: 5,
    confidence_in_ranking_rationale: 5,
    ease_of_override: 5,
    clarity_of_human_control: 5,
    comments: ''
  });

  const [summary, setSummary] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await fetchValidationSummary();
      setSummary(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitValidation({
        evaluator_name: user?.display_name || 'Dr. Demo',
        role: user?.role || 'Radiologist',
        ...ratings
      });
      setSubmitted(true);
      loadSummary();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const QUESTIONS = [
    { key: 'ease_of_finding_priors', label: '1. Ease of locating relevant prior studies' },
    { key: 'clarity_of_recommendation', label: '2. Clarity of recommendation display' },
    { key: 'usefulness_of_evidence', label: '3. Usefulness of evidence breakdown rules' },
    { key: 'confidence_in_ranking_rationale', label: '4. Confidence in understanding why a study was ranked' },
    { key: 'ease_of_override', label: '5. Ease of overriding recommendation' },
    { key: 'clarity_of_human_control', label: '6. Clarity that human radiologist retains control' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div className="panel-card">
        <div className="panel-header">
          <h3 className="panel-title"><UserCheck size={20} /> Prototype Usability & Stakeholder Evaluation Survey</h3>
          <span className="badge badge-cyan">1–5 Rating Scale</span>
        </div>

        {submitted ? (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1.25rem', borderRadius: '0.5rem', color: 'var(--accent-green)', textAlign: 'center' }}>
            <CheckCircle2 size={32} inline style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Evaluation Submitted Successfully!</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Thank you for evaluating the Prior Study Matching Assistant prototype.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {QUESTIONS.map((q) => (
                <div key={q.key} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '0.375rem', border: '1px solid var(--border-color)' }}>
                  <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.5rem', display: 'block' }}>
                    {q.label}
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="btn"
                        style={{
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.85rem',
                          background: ratings[q.key] === star ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)',
                          color: ratings[q.key] === star ? '#042f2e' : 'var(--text-secondary)',
                          borderColor: ratings[q.key] === star ? 'var(--accent-cyan)' : 'var(--border-color)'
                        }}
                        onClick={() => setRatings({ ...ratings, [q.key]: star })}
                      >
                        <Star size={14} fill={ratings[q.key] >= star ? 'currentColor' : 'none'} inline /> {star}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">Free-Text Feedback / Comments</label>
              <textarea 
                className="form-input"
                rows={3}
                placeholder="Share observations on search latency, score clarity, or override workflow..."
                value={ratings.comments}
                onChange={(e) => setRatings({ ...ratings, comments: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-green" disabled={loading}>
                <Send size={15} /> {loading ? 'Submitting...' : 'Submit Prototype Evaluation'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Evaluation Results Summary */}
      {summary && (
        <div className="panel-card">
          <div className="panel-header">
            <h3 className="panel-title"><Star size={18} /> Cumulative Stakeholder Ratings (N = {summary.total_evaluations})</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Evaluation Question</th>
                  <th>Average Rating (1–5 Scale)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1. Ease of finding prior studies</td>
                  <td><strong style={{ color: 'var(--accent-cyan)' }}>{summary.averages.ease_of_finding_priors} / 5.0</strong></td>
                </tr>
                <tr>
                  <td>2. Clarity of recommendation display</td>
                  <td><strong style={{ color: 'var(--accent-cyan)' }}>{summary.averages.clarity_of_recommendation} / 5.0</strong></td>
                </tr>
                <tr>
                  <td>3. Usefulness of evidence breakdown rules</td>
                  <td><strong style={{ color: 'var(--accent-cyan)' }}>{summary.averages.usefulness_of_evidence} / 5.0</strong></td>
                </tr>
                <tr>
                  <td>4. Confidence in understanding why a study was ranked</td>
                  <td><strong style={{ color: 'var(--accent-cyan)' }}>{summary.averages.confidence_in_ranking_rationale} / 5.0</strong></td>
                </tr>
                <tr>
                  <td>5. Ease of overriding recommendation</td>
                  <td><strong style={{ color: 'var(--accent-cyan)' }}>{summary.averages.ease_of_override} / 5.0</strong></td>
                </tr>
                <tr>
                  <td>6. Clarity that human radiologist retains control</td>
                  <td><strong style={{ color: 'var(--accent-green)' }}>{summary.averages.clarity_of_human_control} / 5.0</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          {summary.recent_comments?.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                <MessageSquare size={14} inline /> Evaluator Feedback Comments:
              </div>
              <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {summary.recent_comments.map((c, idx) => (
                  <li key={idx} style={{ marginBottom: '0.3rem' }}>"{c}"</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
