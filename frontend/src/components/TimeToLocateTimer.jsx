import React, { useEffect, useState, useRef } from 'react';

export default function TimeToLocateTimer({
  isRunning = true,
  studyId = null,
  onDurationChange = () => {},
  finalDuration = null
}) {
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  // Auto-start or reset on study change
  useEffect(() => {
    if (finalDuration !== null) {
      setSeconds(finalDuration);
      setIsPaused(true);
      return;
    }

    setSeconds(0);
    setIsPaused(!isRunning);
    startTimeRef.current = Date.now();

    if (isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setSeconds(elapsed);
        onDurationChange(elapsed);
      }, 100);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [studyId, isRunning, finalDuration]);

  // Pause when isRunning transitions to false
  useEffect(() => {
    if (!isRunning && timerRef.current) {
      clearInterval(timerRef.current);
      setIsPaused(true);
    }
  }, [isRunning]);

  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    const tenths = Math.floor((totalSec % 1) * 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 shadow-lg flex items-center justify-between text-slate-200">
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center justify-center">
          <span className={`h-3 w-3 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-ping absolute opacity-75'}`} />
          <span className={`h-3 w-3 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500 relative'}`} />
        </div>
        <div>
          <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
            <span>⏱️ Time-to-Locate Timer</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono border border-slate-700">
              {isPaused ? 'LOCKED AT DECISION' : 'AUTO-MEASURING'}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {isPaused
              ? `Decision finalized in ${seconds.toFixed(1)}s (Benchmark target: <30s)`
              : 'Clock starts on case open and stops on confirm/override'}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="bg-slate-950/80 border border-slate-700 px-3.5 py-1.5 rounded-lg text-right font-mono">
          <div className={`text-xl font-bold tracking-tight ${isPaused ? 'text-amber-300' : 'text-emerald-400'}`}>
            {formatTime(seconds)}
          </div>
          <div className="text-[9px] text-slate-400">
            {seconds <= 30.0 ? '✓ Within Target (≤30s)' : '⚠️ Exceeded Target'}
          </div>
        </div>
      </div>
    </div>
  );
}
