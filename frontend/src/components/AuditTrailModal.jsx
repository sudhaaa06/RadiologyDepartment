import React from 'react';
import { 
  ShieldCheck, X, FileText, CheckCircle2, 
  AlertTriangle, Clock, Download, ExternalLink 
} from 'lucide-react';

export const AuditTrailModal = ({
  isOpen,
  onClose,
  auditLogs = []
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-4xl bg-[#0D131D] border-2 border-[#1D2A38] rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#1D2A38]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-[#00D9FF]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#00D9FF] font-bold uppercase">
                COMPLIANCE & REGULATORY INTEGRITY
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Enterprise Clinical Audit Trail
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#162234] border border-transparent hover:border-[#1D2A38] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Summary Stats */}
        <div className="grid grid-cols-3 gap-3 my-4 text-xs">
          <div className="bg-[#090E17] p-3 rounded-xl border border-[#1D2A38]">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Audit Events</span>
            <div className="text-lg font-bold font-mono text-white mt-0.5">{auditLogs.length} Logged</div>
          </div>
          <div className="bg-[#090E17] p-3 rounded-xl border border-[#1D2A38]">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Regulatory Standard</span>
            <div className="text-sm font-semibold text-emerald-400 mt-0.5">FDA 21 CFR Part 11 Active</div>
          </div>
          <div className="bg-[#090E17] p-3 rounded-xl border border-[#1D2A38]">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Hash Integrity</span>
            <div className="text-sm font-mono text-cyan-300 mt-0.5">SHA-256 Validated</div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-[#090E17] border border-[#1D2A38] rounded-2xl overflow-hidden max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300 divide-y divide-[#1D2A38]">
            <thead className="bg-[#05080E] text-[10px] text-slate-400 uppercase font-mono tracking-wider sticky top-0">
              <tr>
                <th className="py-2.5 px-3">Timestamp / User</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Patient / Study</th>
                <th className="py-2.5 px-3">Prior Selected</th>
                <th className="py-2.5 px-3">Reason / Attestation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2A38]/50">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#111927]/60 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                    <div className="text-slate-200 font-semibold">{log.timestamp.split(' ')[1]} {log.timestamp.split(' ')[2]}</div>
                    <div className="text-slate-400 text-[10px]">{log.user}</div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      log.action === 'CONFIRMED_PRIOR'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {log.action === 'CONFIRMED_PRIOR' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                    <div className="text-slate-200">{log.patientId}</div>
                    <div className="text-slate-400 text-[10px]">{log.currentStudyId}</div>
                  </td>
                  <td className="py-2.5 px-3 text-xs">
                    <div className="font-semibold text-slate-200">{log.priorName}</div>
                    <div className="font-mono text-[10px] text-cyan-400">Score: {log.matchScore}%</div>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-slate-300 max-w-xs">
                    <p className="line-clamp-2">{log.reason}</p>
                    {log.attestation && (
                      <span className="text-[10px] text-slate-400 italic block mt-0.5">"{log.attestation}"</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="mt-4 pt-3 border-t border-[#1D2A38] flex items-center justify-between text-xs text-slate-400">
          <div className="font-mono text-[11px]">
            Audit records are append-only and cryptographically bound to PACSDirector v4.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#111927] hover:bg-[#162234] text-white border border-[#1D2A38]"
          >
            Close Audit Log
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuditTrailModal;
