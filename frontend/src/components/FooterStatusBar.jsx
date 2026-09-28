import React from 'react';
import { 
  ShieldAlert, ShieldCheck, Clock, Activity, 
  Cpu, AlertTriangle, FileText, Timer 
} from 'lucide-react';

export const FooterStatusBar = ({
  auditCount = 2,
  onOpenAuditTrail,
  timeToLocate = '1.8s'
}) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#070B12]/95 backdrop-blur-md border-t border-[#1D2A38] px-4 py-2 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 max-w-[1920px] mx-auto">
        
        {/* Left: ⏱ Time to Locate (as requested in wireframe) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-semibold">
            <Timer className="w-3.5 h-3.5 text-[#00D9FF]" />
            <span>⏱ Time to Locate: <strong className="text-white">{timeToLocate}</strong></span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
            (vs 4.2 min manual PACS search • 99.3% reduction)
          </span>
        </div>

        {/* Center: Human Review (as requested in wireframe) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 font-semibold text-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Human Review Required</span>
          </div>

          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline uppercase">
            No Autonomous Diagnosis
          </span>
        </div>

        {/* Right: Audit Trail Active (as requested in wireframe) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAuditTrail}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D131D] hover:bg-[#162234] border border-[#1D2A38] hover:border-cyan-500/40 text-slate-200 font-mono text-xs transition-colors cursor-pointer"
            title="Open Clinical Audit Trail"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#00D9FF]" />
            <span>Audit Trail Active ({auditCount})</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PACS Sync: Online</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default FooterStatusBar;
