import React, { useState } from 'react';
import { Settings, X, Sliders, Shield, Database, Check } from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose }) => {
  const [minMatchThreshold, setMinMatchThreshold] = useState(65);
  const [autoLoadTopPrior, setAutoLoadTopPrior] = useState(true);
  const [windowPresetDefault, setWindowPresetDefault] = useState('LUNG');
  const [includeOutsideFacilities, setIncludeOutsideFacilities] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-[#0D131D] border-2 border-[#1D2A38] rounded-3xl p-5 sm:p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#1D2A38]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-[#00D9FF]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Radiology Workspace Settings
              </h3>
              <p className="text-xs text-slate-400">
                Configure PRIORIQ match engine and DICOM viewer preferences
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#162234] border border-[#1D2A38]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-200">Relevance Match Threshold</span>
              <span className="font-mono text-cyan-400 font-bold">{minMatchThreshold}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="90"
              value={minMatchThreshold}
              onChange={(e) => setMinMatchThreshold(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-[#162234] rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">
              Candidate studies below this threshold are flagged as ancillary/low-relevance.
            </span>
          </div>

          <div className="pt-2 border-t border-[#1D2A38] space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-semibold text-slate-200">Auto-Link Top Prior on Case Load</div>
                <div className="text-[11px] text-slate-400">Automatically designate Rank #1 prior as comparative target.</div>
              </div>
              <input
                type="checkbox"
                checked={autoLoadTopPrior}
                onChange={(e) => setAutoLoadTopPrior(e.target.checked)}
                className="w-4 h-4 text-cyan-500 rounded bg-[#070B12] border-[#1D2A38]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-semibold text-slate-200">Include Federated Outside Facilities</div>
                <div className="text-[11px] text-slate-400">Query regional Health Information Exchanges (HIE).</div>
              </div>
              <input
                type="checkbox"
                checked={includeOutsideFacilities}
                onChange={(e) => setIncludeOutsideFacilities(e.target.checked)}
                className="w-4 h-4 text-cyan-500 rounded bg-[#070B12] border-[#1D2A38]"
              />
            </label>
          </div>

          <div className="pt-2 border-t border-[#1D2A38]">
            <label className="block font-semibold text-slate-200 mb-1">Default DICOM Window Setting</label>
            <select
              value={windowPresetDefault}
              onChange={(e) => setWindowPresetDefault(e.target.value)}
              className="w-full bg-[#111927] border border-[#1D2A38] text-slate-200 text-xs rounded-xl p-2 focus:border-cyan-400 outline-none"
            >
              <option value="LUNG">Lung Window (W: 1500 / L: -600)</option>
              <option value="MEDIASTINUM">Mediastinal Soft Tissue (W: 350 / L: 40)</option>
              <option value="BONE">Bone Algorithm (W: 2000 / L: 500)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1D2A38]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#111927] text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 text-[#070B12] font-bold tracking-wide"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : null}
              <span>{savedSuccess ? 'Saved' : 'Save Preferences'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
