import React from 'react';
import { 
  FileText, Calendar, Clock, MapPin, Maximize2, 
  Layers, Activity, ShieldAlert, Sparkles 
} from 'lucide-react';
import DicomViewerPlaceholder from './DicomViewerPlaceholder.jsx';

export const CurrentStudyCard = ({ 
  study, 
  patient, 
  onViewFullStudy 
}) => {
  if (!study) return null;

  return (
    <div className="bg-[#0D131D] border border-[#1D2A38] rounded-2xl p-4 lg:p-5 shadow-panel relative overflow-hidden transition-all duration-200">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1D2A38]">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-[#00D9FF] font-bold uppercase block">
            CURRENT STUDY
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5 uppercase">
            {study.name}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 bg-[#090E17] px-2.5 py-1 rounded-lg border border-[#1D2A38]">
            {study.dateTime}
          </span>
          <button
            onClick={onViewFullStudy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111927] hover:bg-[#162234] border border-[#1D2A38] hover:border-cyan-500/40 text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#00D9FF]" />
            <span className="hidden sm:inline">Full Study</span>
          </button>
        </div>
      </div>

      {/* Clinical Metadata Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2.5 text-xs">
        <div className="bg-[#090E17] p-2 rounded-xl border border-[#1D2A38]/70">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Anatomical Region</span>
          <span className="font-semibold text-cyan-300 text-xs mt-0.5 block truncate">{study.anatomy}</span>
        </div>
        <div className="bg-[#090E17] p-2 rounded-xl border border-[#1D2A38]/70">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Modality / Protocol</span>
          <span className="font-mono text-slate-200 text-xs mt-0.5 block">{study.modality} • 1.0mm Thin-slice</span>
        </div>
        <div className="bg-[#090E17] p-2 rounded-xl border border-[#1D2A38]/70 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Contrast Agent</span>
          <span className="font-mono text-slate-300 text-xs mt-0.5 block truncate" title={study.contrast}>{study.contrast}</span>
        </div>
      </div>

      {/* Medical Scan Preview Placeholder */}
      <div className="mt-1">
        <DicomViewerPlaceholder 
          study={study}
          isPrior={false}
          label="SCAN PREVIEW"
          onExpand={onViewFullStudy}
        />
      </div>

    </div>
  );
};

export default CurrentStudyCard;
