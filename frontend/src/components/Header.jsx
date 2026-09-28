import React from 'react';
import { ShieldAlert, LayoutDashboard, FileSearch, History, BarChart3, UserCheck, Star } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, user, onRoleChange }) {
  const getRoleBadgeClass = (role) => {
    if (role === 'Radiologist') return 'badge-cyan';
    if (role === 'Technician') return 'badge-amber';
    return 'badge-green';
  };

  return (
    <header>
      <div className="app-header">
        <div className="brand-title" style={{ gap: '0.6rem' }}>
          {/* Radiology Center Logo */}
          <img
            src="/radiology_logo.jpg"
            alt="Radiology Center"
            style={{
              height: '48px',
              width: 'auto',
              borderRadius: '6px',
              objectFit: 'contain',
              background: '#fff',
              padding: '3px 6px',
              imageRendering: 'high-quality',
              filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>
              Prior-Study Matching Assistant
            </span>
            <span className="brand-badge" style={{ alignSelf: 'flex-start', fontSize: '0.6rem' }}>
              Radiology AI Assistant
            </span>
          </div>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Role:</span>
              <select 
                value={user.role} 
                onChange={(e) => onRoleChange && onRoleChange(e.target.value)}
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                <option value="Radiologist">Radiologist (MD)</option>
                <option value="Technician">Technician (RT)</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
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
