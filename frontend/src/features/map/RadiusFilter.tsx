import React from 'react';
import { Filter, Layers, Navigation } from 'lucide-react';

interface RadiusFilterProps {
  selectedRadiusKm: number;
  onRadiusChange: (radius: number) => void;
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  districts: string[];
  showComplaints: boolean;
  onToggleComplaints: () => void;
  showRiskZones: boolean;
  onToggleRiskZones: () => void;
}

export const RadiusFilter: React.FC<RadiusFilterProps> = ({
  selectedRadiusKm,
  onRadiusChange,
  selectedDistrict,
  onDistrictChange,
  districts,
  showComplaints,
  onToggleComplaints,
  showRiskZones,
  onToggleRiskZones,
}) => {
  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
        <Filter className="w-4 h-4 text-cyber-accent" />
        <span>Geospatial Intelligence Query</span>
      </div>

      {/* District Selection */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
          <Navigation className="w-3 h-3 text-cyber-accent" />
          <span>District Jurisdiction</span>
        </label>
        <select
          value={selectedDistrict}
          onChange={(e) => onDistrictChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent"
        >
          <option value="ALL">All Districts (National View)</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Fraud Query Radius (1km or 3km as specified in blueprint) */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
          Fraud Spatial Radius Query: <strong className="text-cyber-accent font-mono">{selectedRadiusKm} km</strong>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[1, 3, 5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRadiusChange(r)}
              className={`py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                selectedRadiusKm === r
                  ? 'bg-cyber-accent/20 border-cyber-accent text-cyber-accent shadow-md'
                  : 'bg-cyber-850 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {r} km {r === 1 ? '(Near)' : r === 3 ? '(Cluster)' : '(Zone)'}
            </button>
          ))}
        </div>
      </div>

      {/* Layer Toggles */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
          <Layers className="w-3 h-3 text-cyber-accent" />
          <span>GIS Overlay Toggles</span>
        </label>

        <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
          <span>NCRP Complaint Markers</span>
          <input
            type="checkbox"
            checked={showComplaints}
            onChange={onToggleComplaints}
            className="rounded bg-cyber-950 border-slate-800 text-cyber-accent focus:ring-0"
          />
        </label>

        <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
          <span>Spatial Risk Heat Polygons</span>
          <input
            type="checkbox"
            checked={showRiskZones}
            onChange={onToggleRiskZones}
            className="rounded bg-cyber-950 border-slate-800 text-cyber-accent focus:ring-0"
          />
        </label>
      </div>
    </div>
  );
};
