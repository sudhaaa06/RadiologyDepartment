import React, { useState } from 'react';
import { 
  User, Calendar, Clock, Filter, Activity, FileText, 
  MapPin, Shield, CheckCircle2, ChevronRight, SlidersHorizontal,
  Building, Stethoscope, AlertTriangle, Layers, RotateCcw
} from 'lucide-react';

export const PatientCaseSidebar = ({
  allCases,
  currentCase,
  onSelectCase,
  filters,
  onUpdateFilters,
  onResetFilters
}) => {
  const [showFullIndication, setShowFullIndication] = useState(false);
  const study = currentCase?.currentStudy;

  return (
    <aside className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0 flex flex-col gap-3.5">
      
      {/* SECTION: PATIENT DETAILS */}
      <div className="bg-[#0D131D] border border-[#1D2A38] rounded-2xl p-4 shadow-panel relative overflow-hidden">
        
        <div className="flex items-center justify-between pb-2 border-b border-[#1D2A38]">
          <span className="text-[10px] font-mono tracking-widest text-[#00D9FF] font-bold uppercase flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            PATIENT DETAILS
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono font-medium">
            Active Read
          </span>
        </div>

        {/* Patient ID and Female, 52 (as requested in wireframe) */}
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-white tracking-tight font-mono">
            {currentCase.patientId}
          </div>
          <div className="text-sm font-semibold text-slate-300 mt-0.5">
            {currentCase.sex}, {currentCase.age}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {currentCase.patientName}
          </div>
        </div>

        {/* Clinical Exam Snapshot */}
        <div className="mt-3.5 pt-3 border-t border-[#1D2A38] space-y-2 text-xs">
          
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">
              Current Requisition
            </span>
            <span className="font-bold text-white text-sm mt-0.5 block">
              {study?.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Modality</span>
              <span className="font-mono text-cyan-300 font-medium">{study?.modality}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Accession</span>
              <span className="font-mono text-slate-300">{currentCase.accession.replace('ACC-2026-', '#')}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Anatomical Region</span>
            <span className="font-semibold text-slate-200">{study?.anatomy}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Study Date</span>
            <span className="font-mono text-slate-300 text-[11px]">{study?.dateTime}</span>
          </div>

          {/* Clinical Indication */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Clinical Indication</span>
              <button
                onClick={() => setShowFullIndication(!showFullIndication)}
                className="text-[10px] text-[#00D9FF] hover:underline"
              >
                {showFullIndication ? 'Less' : 'More'}
              </button>
            </div>
            <div className={`text-[11px] text-slate-300 bg-[#090E17] p-2 rounded-xl border border-[#1D2A38] mt-1 leading-relaxed ${
              showFullIndication ? '' : 'line-clamp-2'
            }`}>
              {study?.indication}
            </div>
          </div>

        </div>

        {/* Quick Patient Switcher Pills */}
        <div className="mt-3.5 pt-3 border-t border-[#1D2A38]">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1.5">
            Switch Patient Case:
          </span>
          <div className="grid grid-cols-3 gap-1">
            {allCases.map(c => {
              const isSelected = c.id === currentCase.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectCase(c)}
                  className={`py-1 text-center rounded-lg text-[10px] font-mono font-medium transition-all border ${
                    isSelected 
                      ? 'bg-cyan-500/20 text-[#00D9FF] border-cyan-500/40 font-bold'
                      : 'bg-[#111927] text-slate-400 border-[#1D2A38] hover:text-slate-200'
                  }`}
                >
                  {c.patientId}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* SECTION: FILTERS */}
      <div className="bg-[#0D131D] border border-[#1D2A38] rounded-2xl p-4 shadow-panel">
        
        <div className="flex items-center justify-between pb-2 border-b border-[#1D2A38]">
          <span className="text-[10px] font-mono tracking-widest text-[#00D9FF] font-bold uppercase flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            FILTERS
          </span>
          <button
            onClick={onResetFilters}
            className="text-[10px] text-slate-400 hover:text-cyan-400 flex items-center gap-1"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            Reset
          </button>
        </div>

        <div className="space-y-3 mt-3 text-xs">
          
          {/* Anatomy Filter */}
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              Anatomy
            </label>
            <select
              value={filters.anatomy}
              onChange={(e) => onUpdateFilters('anatomy', e.target.value)}
              className="w-full bg-[#111927] border border-[#1D2A38] text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:border-[#00D9FF] outline-none"
            >
              <option value="ALL">All Anatomical Regions</option>
              <option value="CHEST">Chest / Thorax</option>
              <option value="SPINE">Cervical Spine</option>
              <option value="ABDOMEN">Abdomen & Pelvis</option>
            </select>
          </div>

          {/* Modality Filter */}
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              Modality
            </label>
            <div className="grid grid-cols-4 gap-1">
              {['ALL', 'CT', 'MRI', 'XR'].map((mod) => (
                <button
                  key={mod}
                  onClick={() => onUpdateFilters('modality', mod)}
                  className={`py-1 text-center rounded-lg text-[11px] font-medium transition-colors border ${
                    filters.modality === mod
                      ? 'bg-cyan-500/20 text-[#00D9FF] border-cyan-500/40 font-semibold'
                      : 'bg-[#111927] text-slate-400 border-[#1D2A38] hover:text-slate-200'
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => onUpdateFilters('dateRange', e.target.value)}
              className="w-full bg-[#111927] border border-[#1D2A38] text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:border-[#00D9FF] outline-none"
            >
              <option value="ALL">All Historical Archives</option>
              <option value="12M">Past 12 Months</option>
              <option value="24M">Past 24 Months</option>
              <option value="5Y">Past 5 Years</option>
            </select>
          </div>

          {/* Min Match Score */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
              <span className="uppercase font-semibold tracking-wider">Min Relevance</span>
              <span className="font-mono text-[#00D9FF] font-bold">{filters.minScore}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={filters.minScore}
              onChange={(e) => onUpdateFilters('minScore', parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-[#162234] rounded-lg appearance-none cursor-pointer"
            />
          </div>

        </div>

      </div>

    </aside>
  );
};

export default PatientCaseSidebar;
