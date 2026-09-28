import React, { useState } from 'react';
import { normalizeTerminology } from '../api';

export default function NormalizationModal({
  isOpen,
  onClose,
  study = null,
  records = []
}) {
  const [activeTab, setActiveTab] = useState('study'); // 'study' or 'tester'
  
  // Interactive tester state
  const [testInput, setTestInput] = useState({
    modality: 'CAT Scan',
    body_region: 'CT thorax',
    clinical_indication: 'F/u RUL nodule',
    exam_type: 'CT Thorax Non-Contrast',
    condition_concept: 'Pulmonary Nodule'
  });
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const handleTest = async (e) => {
    e.preventDefault();
    setTesting(true);
    try {
      const res = await normalizeTerminology(testInput);
      setTestResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setTesting(false);
    }
  };

  const displayRecords = records.length > 0 ? records : (study?.normalization_records || []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">🔤</span>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Terminology Normalization Inspector</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Feature 7
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {study ? `Standardization mapping for Study ${study.study_id} (${study.source_centre || 'Main PACS'})` : 'Inspect canonical ontology mappings'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 mb-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('study')}
            className={`pb-2 px-3 border-b-2 transition ${activeTab === 'study' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Applied Normalization Rules ({displayRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`pb-2 px-3 border-b-2 transition ${activeTab === 'tester' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            Interactive Multi-Centre Tester
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {activeTab === 'study' ? (
            <div>
              {displayRecords.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800">
                  <div className="text-2xl mb-2">✓</div>
                  <div className="text-sm font-semibold text-white">All Fields Standardized</div>
                  <div className="text-xs text-slate-400 mt-1">
                    The fields in this study were entered using standard canonical nomenclature (e.g. {study?.modality || 'CT'}, {study?.body_region || 'Chest'}).
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayRecords.map((rec, idx) => (
                    <div key={idx} className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold uppercase tracking-wider text-[10px]">
                          {rec.category}
                        </span>
                        <span className="text-emerald-400 text-[11px] font-mono flex items-center gap-1">
                          ✓ Canonical Mapped
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-500 uppercase block font-semibold">Original Raw Term</span>
                          <span className="font-mono text-amber-300 font-bold mt-0.5 block">{rec.original}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40">
                          <span className="text-[10px] text-cyan-400 uppercase block font-semibold">Normalized Concept</span>
                          <span className="font-mono text-cyan-200 font-bold mt-0.5 block">{rec.normalized}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800/80 flex items-start space-x-2">
                        <span className="text-slate-500 font-bold">Rule:</span>
                        <span className="text-slate-300">{rec.rule_applied}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Explanatory note */}
              <div className="mt-4 p-3 rounded-lg bg-blue-950/20 border border-blue-900/30 text-xs text-slate-400 leading-relaxed">
                ℹ️ <strong>Multi-Centre Cross-Mapping:</strong> The assistant recognizes hospital-specific variants like <em>"CAT Scan"</em>, <em>"CT Thorax"</em>, <em>"CXR"</em>, and <em>"knee joint"</em>, mapping them to uniform ontology concepts before retrieval scoring.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleTest} className="space-y-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-semibold text-slate-300">Test Multi-Centre Terminology Mapping</div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Raw Modality (e.g. CAT Scan, CXR)</label>
                    <input
                      type="text"
                      value={testInput.modality}
                      onChange={(e) => setTestInput({ ...testInput, modality: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Raw Body Region (e.g. CT thorax, knee joint)</label>
                    <input
                      type="text"
                      value={testInput.body_region}
                      onChange={(e) => setTestInput({ ...testInput, body_region: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] text-slate-400 block mb-1">Raw Indication / Condition (e.g. F/u RUL nodule, Acute CVA)</label>
                    <input
                      type="text"
                      value={testInput.clinical_indication}
                      onChange={(e) => setTestInput({ ...testInput, clinical_indication: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={testing}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition disabled:opacity-50"
                >
                  {testing ? 'Normalizing...' : 'Run Normalization Rules'}
                </button>
              </form>

              {testResult && (
                <div className="space-y-2 bg-slate-950/90 p-3.5 rounded-xl border border-cyan-800/40 text-xs">
                  <div className="font-semibold text-cyan-300 mb-2">Normalized Output:</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Modality</span>
                      <strong className="text-white">{testResult.normalized_modality}</strong>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Body Region</span>
                      <strong className="text-white">{testResult.normalized_body_region}</strong>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Condition</span>
                      <strong className="text-white">{testResult.normalized_condition}</strong>
                    </div>
                  </div>

                  {testResult.records?.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <div className="text-[11px] font-medium text-slate-400">Rules Applied:</div>
                      {testResult.records.map((r, i) => (
                        <div key={i} className="text-[11px] bg-slate-900 p-2 rounded text-slate-300 font-mono">
                          • {r.rule_applied}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
