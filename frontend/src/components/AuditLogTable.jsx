import React from 'react';
import { History, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AuditLogTable({ auditLogs }) {
  if (!auditLogs || auditLogs.length === 0) {
    return (
      <div className="panel-card" style={{ width: '100%' }}>
        <div className="panel-header">
          <h3 className="panel-title"><History size={18} /> Audit Log & Decision Trail</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No decisions recorded yet. Confirm or override a recommendation in the workstation to generate an immutable audit log.
        </p>
      </div>
    );
  }

  return (
    <div className="panel-card" style={{ width: '100%' }}>
      <div className="panel-header">
        <h3 className="panel-title"><History size={18} /> Immutable Clinical Audit Log</h3>
        <span className="badge badge-cyan">{auditLogs.length} Events Recorded</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="audit-table">
          <thead>
            <tr>
              <th>Audit ID</th>
              <th>Timestamp (UTC)</th>
              <th>Current Scan</th>
              <th>Prior Study</th>
              <th>Human Decision</th>
              <th>Override Reason</th>
              <th>Role</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => {
              const isConfirm = log.human_decision === 'CONFIRMED';
              return (
                <tr key={log.audit_id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{log.audit_id}</td>
                  <td>{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                  <td><strong>#{log.study_id}</strong></td>
                  <td>#{log.recommended_prior_id}</td>
                  <td>
                    <span className={`badge ${isConfirm ? 'badge-green' : 'badge-amber'}`}>
                      {isConfirm ? <ShieldCheck size={12} inline /> : <AlertCircle size={12} inline />}
                      {log.human_decision}
                    </span>
                  </td>
                  <td>
                    {log.override_reason ? (
                      <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>
                        {log.override_reason}
                        {log.custom_reason_text && ` (${log.custom_reason_text})`}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                    )}
                  </td>
                  <td>{log.user_role}</td>
                  <td style={{ fontWeight: 600 }}>{Math.round(log.score * 100)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
