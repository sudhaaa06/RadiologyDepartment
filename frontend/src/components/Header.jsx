import React from 'react';
import { Activity, ShieldAlert, LayoutDashboard, FileSearch, History, BarChart3, UserCheck, LogOut, Star } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, user, onLogout }) {
  const getRoleBadgeClass = (role) => {
    if (role === 'Radiologist') return 'badge-cyan';
    if (role === 'Technician') return 'badge-amber';
    return 'badge-green';
  };

  return (
    <header>
      <div className="app-header">
        <div className="brand-title">
          <Activity size={24} style={{ color: '#06b6d4' }} />
          <span>Prior-Study Matching Assistant</span>
          <span className="brand-badge">Radiology AI Assistant</span>
        </div>

        <nav className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={16} inline /> Dashboard
          </button>
          <button 
            className={`nav-tab ${activeTab === 'workstation' ? 'active' : ''}`}
            onClick={() => setActiveTab('workstation')}
          >
            <FileSearch size={16} inline /> Workstation
          </button>
          <button 
            className={`nav-tab ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <History size={16} inline /> Audit Trail
          </button>
          <button 
            className={`nav-tab ${activeTab === 'evaluation' ? 'active' : ''}`}
            onClick={() => setActiveTab('evaluation')}
          >
            <BarChart3 size={16} inline /> Pilot Evaluation
          </button>
          <button 
            className={`nav-tab ${activeTab === 'validation' ? 'active' : ''}`}
            onClick={() => setActiveTab('validation')}
          >
            <Star size={16} inline /> Stakeholder Survey
          </button>
        </nav>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              <UserCheck size={16} style={{ color: 'var(--accent-cyan)' }} />
              <strong>{user.display_name}</strong>
              <span className={`badge ${getRoleBadgeClass(user.role)}`} style={{ fontSize: '0.65rem' }}>
                {user.role?.toUpperCase()}
              </span>
            </div>

            <button 
              className="btn btn-amber"
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
              onClick={onLogout}
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        )}
      </div>

      <div className="disclaimer-banner">
        <ShieldAlert size={16} style={{ minWidth: 16 }} />
        <span>
          <strong>SAFETY MANDATE:</strong> System is strictly a retrieval decision-support assistant. No autonomous diagnostic or treatment decisions are made. Human confirmation or override is required for every recommendation.
        </span>
      </div>
    </header>
  );
}
