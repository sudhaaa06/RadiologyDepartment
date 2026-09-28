import React, { useState, useEffect } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCcw, Crosshair, Play, Pause, 
  Maximize2, Sliders, Eye, EyeOff, Layers, Activity 
} from 'lucide-react';

export const DicomViewerPlaceholder = ({ 
  study, 
  isPrior = false, 
  onExpand, 
  activeFinding,
  label = "CURRENT STUDY"
}) => {
  const [sliceIndex, setSliceIndex] = useState(study?.currentSlice || 52);
  const [windowPreset, setWindowPreset] = useState('LUNG'); // LUNG, MEDIASTINUM, BONE
  const [invertContrast, setInvertContrast] = useState(false);
  const [showCrosshairs, setShowCrosshairs] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [isPlayingCine, setIsPlayingCine] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  const totalSlices = study?.totalSlices || 96;

  // Cine loop simulation
  useEffect(() => {
    let interval = null;
    if (isPlayingCine) {
      interval = setInterval(() => {
        setSliceIndex((prev) => (prev >= totalSlices ? 1 : prev + 1));
      }, 120);
    }
    return () => clearInterval(interval);
  }, [isPlayingCine, totalSlices]);

  // Handle window preset values
  const getWindowValues = () => {
    switch (windowPreset) {
      case 'LUNG': return { w: 1500, l: -600, name: 'Lung Window' };
      case 'MEDIASTINUM': return { w: 350, l: 40, name: 'Mediastinal Window' };
      case 'BONE': return { w: 2000, l: 500, name: 'Bone Kernel' };
      default: return { w: 1500, l: -600, name: 'Standard' };
    }
  };

  const win = getWindowValues();

  // Color filters based on window preset
  const getFilterStyle = () => {
    let brightness = 1;
    let contrast = 1.3;
    let hue = 0;

    if (windowPreset === 'MEDIASTINUM') {
      brightness = 0.85;
      contrast = 1.8;
    } else if (windowPreset === 'BONE') {
      brightness = 1.1;
      contrast = 2.4;
    }

    if (invertContrast) {
      return `invert(1) brightness(${brightness * 1.1}) contrast(${contrast})`;
    }
    return `brightness(${brightness}) contrast(${contrast})`;
  };

  return (
    <div className="relative flex flex-col bg-[#05080E] rounded-xl border border-[#1D2A38] overflow-hidden select-none group shadow-inner">
      {/* Viewer Top Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#090E17]/90 border-b border-[#1D2A38] text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase ${
            isPrior 
              ? 'bg-violet-500/20 text-[#8B7CFF] border border-violet-500/30' 
              : 'bg-cyan-500/20 text-[#00D9FF] border border-cyan-500/30'
          }`}>
            {label}
          </span>
          <span className="font-mono text-slate-300 font-medium truncate max-w-[200px]">
            {study?.name || 'CT Axial Reconstruct'}
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-slate-400">
            Slice: <strong className="text-slate-200">{sliceIndex}</strong>/{totalSlices}
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">
            W: {win.w} L: {win.l}
          </span>
        </div>
      </div>

      {/* Main DICOM Display Area */}
      <div className="relative w-full h-[280px] sm:h-[340px] flex items-center justify-center bg-[#04060A] overflow-hidden dicom-grid">
        
        {/* Medical Scan SVG Simulation Canvas */}
        <div 
          className="relative w-full h-full flex items-center justify-center transition-all duration-150"
          style={{ 
            filter: getFilterStyle(),
            transform: `scale(${zoomLevel})` 
          }}
        >
          {study?.modality === 'XR' ? (
            /* 2D Chest Radiograph SVG Representation */
            <svg viewBox="0 0 400 400" className="w-[85%] h-[85%] max-w-[340px] opacity-90">
              <defs>
                <radialGradient id="xrGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#070b12" />
                </radialGradient>
              </defs>
              {/* Thoracic cage outline */}
              <ellipse cx="200" cy="200" rx="150" ry="170" fill="url(#xrGlow)" stroke="#334155" strokeWidth="2" />
              {/* Spine */}
              <rect x="194" y="60" width="12" height="280" rx="3" fill="#cbd5e1" opacity="0.4" />
              {/* Clavicles */}
              <path d="M 80,100 Q 190,130 200,120" stroke="#94a3b8" strokeWidth="6" fill="none" opacity="0.7" />
              <path d="M 320,100 Q 210,130 200,120" stroke="#94a3b8" strokeWidth="6" fill="none" opacity="0.7" />
              {/* Rib arcs */}
              {[140, 170, 200, 230, 260, 290].map((y, i) => (
                <g key={i}>
                  <path d={`M 90,${y} Q 150,${y-15} 190,${y-5}`} stroke="#64748b" strokeWidth="4" fill="none" opacity="0.45" />
                  <path d={`M 310,${y} Q 250,${y-15} 210,${y-5}`} stroke="#64748b" strokeWidth="4" fill="none" opacity="0.45" />
                </g>
              ))}
              {/* Lung Fields (Darker on XR) */}
              <path d="M 120,130 C 100,200 110,290 140,310 C 170,290 180,240 180,140 Z" fill="#020617" opacity="0.85" />
              <path d="M 280,130 C 300,200 290,290 260,310 C 230,290 220,240 220,140 Z" fill="#020617" opacity="0.85" />
              {/* Heart Silhouette */}
              <path d="M 175,200 C 160,260 210,310 250,295 C 230,240 210,200 175,200 Z" fill="#475569" opacity="0.6" />
              {/* Diaphragm domes */}
              <path d="M 90,320 Q 150,285 200,310" stroke="#64748b" strokeWidth="3" fill="none" />
              <path d="M 310,320 Q 250,295 200,310" stroke="#64748b" strokeWidth="3" fill="none" />
              {/* Surgical Clips annotation */}
              <circle cx="160" cy="135" r="4" fill="#f8fafc" stroke="#00D9FF" strokeWidth="1" />
              <circle cx="168" cy="140" r="3" fill="#f8fafc" stroke="#00D9FF" strokeWidth="1" />
            </svg>
          ) : (
            /* Axial Volumetric CT Simulation */
            <svg viewBox="0 0 400 400" className="w-[90%] h-[90%] max-w-[340px]">
              {/* Body Contour / Subcutaneous fat */}
              <ellipse cx="200" cy="200" rx="165" ry="145" fill="#0a0f18" stroke="#1e293b" strokeWidth="3" />
              
              {/* Musculoskeletal Thoracic Wall */}
              <ellipse cx="200" cy="200" rx="150" ry="130" fill="none" stroke="#334155" strokeWidth="6" opacity="0.7" />
              
              {/* Sternum anterior */}
              <rect x="188" y="72" width="24" height="8" rx="2" fill="#cbd5e1" opacity="0.8" />
              
              {/* Vertebral Body posterior */}
              <g transform="translate(180, 275)">
                <path d="M 0,10 Q 20,0 40,10 Q 35,30 20,35 Q 5,30 0,10 Z" fill="#cbd5e1" opacity="0.85" />
                <circle cx="20" cy="22" r="6" fill="#020617" />
                {/* Spinous process */}
                <path d="M 15,35 L 20,55 L 25,35 Z" fill="#94a3b8" opacity="0.75" />
                {/* Transverse processes */}
                <path d="M 0,20 L -18,28 L -5,35 Z" fill="#94a3b8" opacity="0.75" />
                <path d="M 40,20 L 58,28 L 45,35 Z" fill="#94a3b8" opacity="0.75" />
              </g>

              {/* Bilateral Ribs in cross section */}
              {[
                { cx: 70, cy: 150 }, { cx: 60, cy: 200 }, { cx: 75, cy: 250 },
                { cx: 330, cy: 150 }, { cx: 340, cy: 200 }, { cx: 325, cy: 250 }
              ].map((rib, i) => (
                <ellipse key={i} cx={rib.cx} cy={rib.cy} rx="8" ry="5" fill="#cbd5e1" opacity="0.8" transform={`rotate(${rib.cx > 200 ? 15 : -15} ${rib.cx} ${rib.cy})`} />
              ))}

              {/* Lungs Parenchyma (Hypodense/Dark -700 HU) */}
              {/* Right Lung (Patient Right / Screen Left) */}
              <path 
                d="M 175,110 C 130,105 85,140 85,210 C 85,270 120,285 165,270 C 175,250 178,200 175,110 Z" 
                fill="#030712" 
                stroke="#1e293b" 
                strokeWidth="1.5" 
              />
              {/* Left Lung (Patient Left / Screen Right) */}
              <path 
                d="M 225,110 C 270,105 315,140 315,210 C 315,270 280,285 235,270 C 225,250 222,200 225,110 Z" 
                fill="#030712" 
                stroke="#1e293b" 
                strokeWidth="1.5" 
              />

              {/* Mediastinal Soft Tissues & Great Vessels / Heart */}
              {/* Ascending & Descending Aorta */}
              <circle cx="185" cy="145" r="16" fill="#334155" stroke="#475569" strokeWidth="2" opacity="0.9" />
              <circle cx="215" cy="245" r="14" fill="#334155" stroke="#475569" strokeWidth="2" opacity="0.9" />
              {/* Pulmonary Artery / Conus */}
              <path d="M 195,150 Q 230,165 220,195 Q 185,185 195,150 Z" fill="#475569" opacity="0.75" />

              {/* Pulmonary vascular branch markings */}
              <path d="M 140,200 Q 120,180 110,160" stroke="#334155" strokeWidth="2.5" fill="none" opacity="0.6" />
              <path d="M 140,210 Q 115,225 105,245" stroke="#334155" strokeWidth="2" fill="none" opacity="0.6" />
              <path d="M 260,200 Q 280,180 290,160" stroke="#334155" strokeWidth="2.5" fill="none" opacity="0.6" />
              <path d="M 260,210 Q 285,225 295,245" stroke="#334155" strokeWidth="2" fill="none" opacity="0.6" />

              {/* THE TARGET LESION: Right Upper Lobe Subsolid Nodule (Screen Left) */}
              <g transform="translate(132, 148)">
                {/* Ground glass halo */}
                <ellipse 
                  cx="0" 
                  cy="0" 
                  rx={isPrior ? "11" : "13"} 
                  ry={isPrior ? "10" : "12"} 
                  fill="#475569" 
                  opacity="0.45" 
                />
                {/* Part-solid core */}
                <circle 
                  cx="1" 
                  cy="-1" 
                  r={isPrior ? "4.5" : "6.5"} 
                  fill="#94a3b8" 
                  opacity="0.9" 
                />
                {/* Spiculation line */}
                <line x1="8" y1="-5" x2="16" y2="-9" stroke="#64748b" strokeWidth="1.5" opacity="0.7" />
              </g>

              {/* Visual Calipers & Annotation */}
              {showMeasurements && (
                <g transform="translate(132, 148)">
                  {/* Caliper Measurement Ring */}
                  <ellipse 
                    cx="0" 
                    cy="0" 
                    rx={isPrior ? "13" : "15"} 
                    ry={isPrior ? "12" : "14"} 
                    fill="none" 
                    stroke={isPrior ? "#8B7CFF" : "#00D9FF"} 
                    strokeWidth="1.5" 
                    strokeDasharray="3 2" 
                    className="animate-pulse"
                  />
                  {/* Caliper ticks */}
                  <line x1="-15" y1="0" x2="15" y2="0" stroke={isPrior ? "#8B7CFF" : "#00D9FF"} strokeWidth="1" />
                  <line x1="-15" y1="-3" x2="-15" y2="3" stroke={isPrior ? "#8B7CFF" : "#00D9FF"} strokeWidth="1" />
                  <line x1="15" y1="-3" x2="15" y2="3" stroke={isPrior ? "#8B7CFF" : "#00D9FF"} strokeWidth="1" />
                </g>
              )}
            </svg>
          )}

          {/* Crosshair Overlay */}
          {showCrosshairs && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-full h-[1px] bg-cyan-500/20" />
              <div className="h-full w-[1px] bg-cyan-500/20 absolute" />
              <div className="absolute w-8 h-8 rounded-full border border-cyan-500/25" />
            </div>
          )}
        </div>

        {/* Real-time Measurement HUD Tag */}
        {showMeasurements && (
          <div className={`absolute top-3 left-3 px-2 py-1 rounded backdrop-blur-md border text-[11px] font-mono ${
            isPrior 
              ? 'bg-[#0D131D]/85 border-violet-500/40 text-violet-300' 
              : 'bg-[#0D131D]/85 border-cyan-500/40 text-cyan-300'
          }`}>
            <div className="flex items-center gap-1.5 font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span>{isPrior ? 'PRIOR MEASUREMENT' : 'CURRENT TARGET'}</span>
            </div>
            <div className="text-[10px] text-slate-300 mt-0.5">
              {isPrior 
                ? (study?.documentedMeasurements?.dimension || '7.8 mm max diameter')
                : (study?.lesionMeasurement?.longestDiameter ? `${study.lesionMeasurement.longestDiameter} (Slice ${study.lesionMeasurement.sliceIndex})` : 'Target region')}
            </div>
          </div>
        )}

        {/* Anatomical Orientation Tags (DICOM Standard) */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-500 tracking-wider">A (Anterior)</div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-500 tracking-wider">P (Posterior)</div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500">R</div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500">L</div>

        {/* Bottom Right DICOM Parameters */}
        <div className="absolute bottom-2 right-3 text-right font-mono text-[9px] text-slate-400 leading-tight bg-[#070B12]/80 px-2 py-1 rounded border border-[#1D2A38]/50">
          <div>KV: {study?.kvp || '120'} | mA: {study?.mas || '180'}</div>
          <div>Thk: 1.0mm | Spacing: 1.0mm</div>
          <div className="text-slate-500">{study?.scanner || 'SOMATOM Force'}</div>
        </div>

        {/* Maximize Button overlay */}
        {onExpand && (
          <button
            onClick={onExpand}
            title="Open side-by-side DICOM comparison"
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#0D131D]/80 border border-[#1D2A38] text-slate-300 hover:text-[#00D9FF] hover:border-cyan-500/50 transition-colors shadow-md"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Interactive Controls Bar */}
      <div className="px-3 py-2 bg-[#090E17] border-t border-[#1D2A38] flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Slice Scrubber & Cine Controls */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <button
            onClick={() => setIsPlayingCine(!isPlayingCine)}
            className={`p-1 rounded border transition-colors ${
              isPlayingCine 
                ? 'bg-cyan-500/20 text-[#00D9FF] border-cyan-500/50' 
                : 'bg-[#111927] text-slate-300 border-[#1D2A38] hover:bg-[#162234]'
            }`}
            title={isPlayingCine ? "Pause Cine" : "Play Cine Loop"}
          >
            {isPlayingCine ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <input
            type="range"
            min="1"
            max={totalSlices}
            value={sliceIndex}
            onChange={(e) => {
              setIsPlayingCine(false);
              setSliceIndex(parseInt(e.target.value, 10));
            }}
            className="w-full h-1.5 bg-[#162234] rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Window Presets Buttons */}
        <div className="flex items-center gap-1 bg-[#05080E] p-0.5 rounded-lg border border-[#1D2A38]">
          <button
            onClick={() => setWindowPreset('LUNG')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              windowPreset === 'LUNG' 
                ? 'bg-cyan-500/20 text-[#00D9FF] font-semibold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lung
          </button>
          <button
            onClick={() => setWindowPreset('MEDIASTINUM')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              windowPreset === 'MEDIASTINUM' 
                ? 'bg-cyan-500/20 text-[#00D9FF] font-semibold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Med
          </button>
          <button
            onClick={() => setWindowPreset('BONE')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              windowPreset === 'BONE' 
                ? 'bg-cyan-500/20 text-[#00D9FF] font-semibold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bone
          </button>
        </div>

        {/* Tool Toggles */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setInvertContrast(!invertContrast)}
            className={`p-1 rounded border text-[11px] ${
              invertContrast 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-[#111927] text-slate-400 border-[#1D2A38] hover:text-slate-200'
            }`}
            title="Invert Contrast (LUT Negative)"
          >
            Inv
          </button>

          <button
            onClick={() => setShowCrosshairs(!showCrosshairs)}
            className={`p-1 rounded border ${
              showCrosshairs 
                ? 'bg-cyan-500/20 text-[#00D9FF] border-cyan-500/40' 
                : 'bg-[#111927] text-slate-500 border-[#1D2A38]'
            }`}
            title="Toggle Reticle Crosshair"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowMeasurements(!showMeasurements)}
            className={`p-1 rounded border ${
              showMeasurements 
                ? 'bg-cyan-500/20 text-[#00D9FF] border-cyan-500/40' 
                : 'bg-[#111927] text-slate-500 border-[#1D2A38]'
            }`}
            title="Toggle Measurement Calipers"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setZoomLevel((z) => (z >= 1.4 ? 1.0 : +(z + 0.2).toFixed(1)))}
            className="p-1 rounded border bg-[#111927] text-slate-400 border-[#1D2A38] hover:text-slate-200 font-mono text-[10px]"
            title="Toggle Zoom Factor"
          >
            {zoomLevel}x
          </button>
        </div>

      </div>
    </div>
  );
};

export default DicomViewerPlaceholder;
