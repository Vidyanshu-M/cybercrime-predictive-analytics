import React from 'react';

export const RiskLegend: React.FC = () => {
  const levels = [
    { label: 'CRITICAL (80-100%)', color: 'bg-rose-500', border: 'border-rose-400' },
    { label: 'HIGH (60-79%)', color: 'bg-orange-500', border: 'border-orange-400' },
    { label: 'MEDIUM (30-59%)', color: 'bg-amber-500', border: 'border-amber-400' },
    { label: 'LOW (0-29%)', color: 'bg-emerald-500', border: 'border-emerald-400' },
  ];

  return (
    <div className="glass-panel p-3 rounded-xl border border-slate-800 text-xs">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
        Geospatial Risk Spectrum
      </p>
      <div className="space-y-1.5">
        {levels.map((lvl) => (
          <div key={lvl.label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${lvl.color} border ${lvl.border} shadow-sm`}></span>
            <span className="text-[11px] text-slate-300 font-medium">{lvl.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Circles = 1km/3km Fraud Radius</span>
        <span>Pulse = Active Spike</span>
      </div>
    </div>
  );
};
