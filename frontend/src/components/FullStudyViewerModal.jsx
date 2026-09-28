import React, { useState } from 'react';
import { 
  X, Maximize2, Minimize2, SplitSquareVertical, 
  RotateCcw, Sliders, Layers, FileText, CheckCircle2 
} from 'lucide-react';
import DicomViewerPlaceholder from './DicomViewerPlaceholder.jsx';

export const FullStudyViewerModal = ({
  isOpen,
  onClose,
  currentStudy,
  priorStudy,
  patient
}) => {
  const [syncScroll, setSyncScroll] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-7xl h-[94vh] bg-[#070B12] border-2 border-[#1D2A38] rounded-3xl flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#0D131D] border-b border-[#1D2A38]">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-cyan-500/20 text-[#00D9FF] border border-cyan-500/30">
              SYNCHRONIZED DICOM VIEWPORT
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">
              {patient?.patientName} ({patient?.patientId})
            </h2>
            <span className="hidden md:inline text-xs font-mono text-slate-400">
              Current: {currentStudy?.name} vs Prior: {priorStudy?.studyName || 'Baseline'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer bg-[#111927] px-2.5 py-1.5 rounded-xl border border-[#1D2A38]">
              <input
                type="checkbox"
                checked={syncScroll}
                onChange={(e) => setSyncScroll(e.target.checked)}
                className="w-3.5 h-3.5 text-cyan-500 rounded bg-[#070B12] border-[#1D2A38]"
              />
              <span className="text-[11px] font-medium">Link Synchronized Pan/Scroll</span>
            </label>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#162234] border border-[#1D2A38] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dual Viewports Content Area */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 overflow-y-auto bg-[#05080E]">
          
          {/* Left Viewport: CURRENT STUDY */}
          <div className="flex flex-col bg-[#0D131D] border border-[#1D2A38] rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-[#1D2A38]">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00D9FF]" />
                CURRENT EXAM: {currentStudy?.name}
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {currentStudy?.dateTime}
              </span>
            </div>

            <div className="flex-1">
              <DicomViewerPlaceholder
                study={currentStudy}
                isPrior={false}
                label="INDEX SERIES (2026)"
              />
            </div>

            {/* Current Study Findings Box */}
            <div className="bg-[#090E17] p-2.5 rounded-xl border border-[#1D2A38] text-xs space-y-1">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Clinical Indication:</div>
              <div className="text-slate-300 text-[11px]">{currentStudy?.indication}</div>
              <div className="text-[10px] text-cyan-300 font-mono pt-1">
                Target: {currentStudy?.lesionMeasurement?.location} • Longest diameter: {currentStudy?.lesionMeasurement?.longestDiameter}
              </div>
            </div>
          </div>

          {/* Right Viewport: PRIOR STUDY */}
          <div className="flex flex-col bg-[#0D131D] border border-[#1D2A38] rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-[#1D2A38]">
              <span className="font-bold text-violet-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8B7CFF]" />
                PRIOR COMPARISON: {priorStudy?.studyName || 'Baseline (None)'}
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {priorStudy?.date || 'N/A'}
              </span>
            </div>

            <div className="flex-1">
              {priorStudy ? (
                <DicomViewerPlaceholder
                  study={priorStudy}
                  isPrior={true}
                  label={`PRIOR #${priorStudy.rank} (${priorStudy.matchScore}%)`}
                />
              ) : (
                <div className="h-full min-h-[300px] flex items-center justify-center bg-[#070B12] rounded-xl border border-[#1D2A38] text-slate-400 text-xs">
                  No prior study available for dual comparison.
                </div>
              )}
            </div>

            {/* Prior Study Report Excerpt Box */}
            {priorStudy?.reportExcerpt && (
              <div className="bg-[#090E17] p-2.5 rounded-xl border border-[#1D2A38] text-xs space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Prior Final Report:</div>
                <div className="text-slate-300 text-[11px] font-mono leading-relaxed">
                  "{priorStudy.reportExcerpt.text}"
                </div>
                <div className="text-[10px] text-violet-300 font-mono pt-1">
                  Documented: {priorStudy.documentedMeasurements?.dimension} (Solid: {priorStudy.documentedMeasurements?.solidCore})
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-5 py-2.5 bg-[#0D131D] border-t border-[#1D2A38] flex items-center justify-between text-xs text-slate-400">
          <div>
            Non-Diagnostic Multi-Planar Comparison View • Press ESC to exit
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#111927] hover:bg-[#162234] text-white border border-[#1D2A38]"
          >
            Close Full Viewer
          </button>
        </div>

      </div>
    </div>
  );
};

export default FullStudyViewerModal;
