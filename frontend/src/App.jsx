import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage.jsx';
import RegisterPage from './components/RegisterPage.jsx';
import Header from './components/Header.jsx';
import DashboardView from './components/DashboardView.jsx';
import CurrentStudyCard from './components/CurrentStudyCard.jsx';
import PriorStudyCard from './components/PriorStudyCard.jsx';
import ConfirmModal from './components/ConfirmModal.jsx';
import OverrideModal from './components/OverrideModal.jsx';
import AuditLogTable from './components/AuditLogTable.jsx';
import EvaluationPanel from './components/EvaluationPanel.jsx';
import DemoModeSelector from './components/DemoModeSelector.jsx';
import StakeholderValidationPanel from './components/StakeholderValidationPanel.jsx';

import { fetchStudies, matchPriors, submitFeedback, fetchAuditLog, fetchPilotMetrics, logoutUser } from './api.js';
import { Search, Layers, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('pacs_user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [studies, setStudies] = useState([]);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [metrics, setMetrics] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [overrideTarget, setOverrideTarget] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activePreset, setActivePreset] = useState(null);

  useEffect(() => {
    if (currentUser) {
      loadWorklist();
      loadAuditTrail();
      loadMetrics();
    }
  }, [currentUser]);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('pacs_user_session', JSON.stringify(userData));
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    if (currentUser?.token) {
      try {
        await logoutUser(currentUser.token);
      } catch (err) {
        console.error(err);
      }
    }
    localStorage.removeItem('pacs_user_session');
    setCurrentUser(null);
  };

  const loadWorklist = async () => {
    setLoading(true);
    try {
      const data = await fetchStudies();
      setStudies(data);
      if (data.length > 0 && !selectedStudy) {
        handleSelectStudy(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditTrail = async () => {
    try {
      const data = await fetchAuditLog();
      setAuditLogs(data.entries || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMetrics = async () => {
    try {
      const data = await fetchPilotMetrics();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectStudy = async (study) => {
    setSelectedStudy(study);
    setLoading(true);
    try {
      const result = await matchPriors(study);
      setMatchData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (presetId) => {
    setActivePreset(presetId);
    let targetId = null;

    if (presetId === 'journey1_stat_brain') targetId = 'ST_JOURNEY1_STAT';
    else if (presetId === 'journey2_routine_knee') targetId = 'ST_JOURNEY2_ROUTINE';
    else if (presetId === 'external_centre_chest') targetId = 'ST_EC6_Q';
    else if (presetId === 'missing_metadata') targetId = 'ST_EC5_Q';
    else if (presetId === 'no_priors_available') targetId = 'ST_EC9_Q';

    if (targetId) {
      const found = studies.find(s => s.study_id === targetId);
      if (found) {
        handleSelectStudy(found);
      } else {
        fetchStudies().then(all => {
          const f = all.find(s => s.study_id === targetId);
          if (f) handleSelectStudy(f);
        });
      }
    }
    setActiveTab('workstation');
  };

  const handleConfirmSubmit = async () => {
    if (!confirmTarget || !selectedStudy) return;
    try {
      await submitFeedback({
        study_id: selectedStudy.study_id,
        recommended_prior_id: confirmTarget.study_id,
        human_decision: 'CONFIRMED',
        user_role: currentUser?.role || 'Radiologist'
      });
      setStatusMessage(`✅ Comparison confirmed with Prior Study #${confirmTarget.study_id}`);
      setConfirmTarget(null);
      loadAuditTrail();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOverrideSubmit = async (reasonPayload) => {
    if (!overrideTarget || !selectedStudy) return;
    try {
      await submitFeedback({
        study_id: selectedStudy.study_id,
        recommended_prior_id: overrideTarget.study_id,
        human_decision: 'OVERRIDDEN',
        override_reason: reasonPayload.override_reason,
        custom_reason_text: reasonPayload.custom_reason_text,
        user_role: currentUser?.role || 'Radiologist'
      });
      setStatusMessage(`⚠️ Override recorded for Study #${overrideTarget.study_id} (Reason: ${reasonPayload.override_reason})`);
      setOverrideTarget(null);
      loadAuditTrail();
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      alert(err.message);
    }
  };

  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  if (!currentUser) {
    if (authView === 'register') {
      return (
        <RegisterPage
          onLoginSuccess={handleLoginSuccess}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setAuthView('register')}
      />
    );
  }

  const filteredStudies = studies.filter(s => 
    s.study_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.patient_id_hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.modality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.body_region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.urgency && s.urgency.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="app-container">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={currentUser} 
        onLogout={handleLogout} 
      />

      <main className="main-content">
        {statusMessage && (
          <div className="badge badge-cyan" style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem', width: '100%', marginBottom: '1rem', justifyContent: 'space-between' }}>
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <DashboardView 
            user={currentUser} 
            metrics={metrics} 
            auditCount={auditLogs.length} 
            edgeCasesCount={33}
          />
        )}

        {activeTab === 'workstation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            {/* Demo Mode Preset Switcher */}
            <DemoModeSelector activePreset={activePreset} onSelectPreset={handlePresetSelect} />

            <div className="workstation-grid">
              {/* Column 1: Incoming Worklist */}
              <div className="panel-card">
                <div className="panel-header">
                  <h3 className="panel-title"><Layers size={18} /> Incoming Scans ({filteredStudies.length})</h3>
                  <button onClick={loadWorklist} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <RefreshCw size={16} />
                  </button>
                </div>

                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-muted)' }} />
                  <input 
                    type="text"
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '2rem' }}
                    placeholder="Search ID, Patient, Modality, STAT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 'calc(100vh - 340px)', overflowY: 'auto' }}>
                  {filteredStudies.map((st) => (
                    <div 
                      key={st.study_id}
                      className={`worklist-item ${selectedStudy?.study_id === st.study_id ? 'selected' : ''}`}
                      onClick={() => handleSelectStudy(st)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>#{st.study_id}</span>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          {st.urgency === 'STAT' && <span className="badge badge-rose" style={{ fontSize: '0.65rem' }}>STAT</span>}
                          <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{st.modality}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Patient: {st.patient_id_hash}</span>
                        <span>{st.study_date}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {st.clinical_indication}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Current Study View */}
              <CurrentStudyCard study={selectedStudy} />

              {/* Column 3: Recommended Priors */}
              <div className="panel-card">
                <div className="panel-header">
                  <h3 className="panel-title">
                    Suggested Prior Studies
                  </h3>
                  {matchData?.recommendations && (
                    <span className="badge badge-green">{matchData.recommendations.length} Candidate Priors</span>
                  )}
                </div>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Calculating multi-factor match scores & normalized evidence...
                  </div>
                ) : matchData?.low_confidence_warning ? (
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1rem', borderRadius: '0.375rem', color: 'var(--accent-amber)', fontSize: '0.85rem' }}>
                    <AlertTriangle size={16} inline /> <strong>Low Confidence Warning:</strong> {matchData.warning_message}
                  </div>
                ) : matchData?.recommendations?.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No historical prior studies retrieved for this patient.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: 'calc(100vh - 340px)', overflowY: 'auto' }}>
                    {matchData?.recommendations?.map((prior) => (
                      <PriorStudyCard 
                        key={prior.study_id}
                        prior={prior}
                        userRole={currentUser?.role}
                        onConfirm={(p) => setConfirmTarget(p)}
                        onOverride={(p) => setOverrideTarget(p)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <AuditLogTable auditLogs={auditLogs} />
        )}

        {activeTab === 'evaluation' && (
          <EvaluationPanel metrics={metrics} />
        )}

        {activeTab === 'validation' && (
          <StakeholderValidationPanel user={currentUser} />
        )}
      </main>

      {/* Confirmation Dialog Modal */}
      {confirmTarget && (
        <ConfirmModal 
          prior={confirmTarget}
          currentStudy={selectedStudy}
          onClose={() => setConfirmTarget(null)}
          onConfirm={handleConfirmSubmit}
        />
      )}

      {/* Override Dialog Modal */}
      {overrideTarget && (
        <OverrideModal 
          prior={overrideTarget}
          onClose={() => setOverrideTarget(null)}
          onSubmit={handleOverrideSubmit}
        />
      )}
    </div>
  );
}
