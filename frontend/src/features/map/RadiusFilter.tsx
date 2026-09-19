import React from 'react';
import { Filter, Layers, Navigation, Building2, ShieldAlert, Flame, CircleDot, Sliders } from 'lucide-react';
import { MapLayerVisibility, RiskLevel } from '../../types';

interface RadiusFilterProps {
  selectedRadiusKm: number;
  onRadiusChange: (radius: number) => void;
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  districts: string[];
  selectedBank: string;
  onBankChange: (bank: string) => void;
  banks: string[];
  selectedRiskLevel: string;
  onRiskLevelChange: (level: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  layers: MapLayerVisibility;
  onToggleLayer: (layer: keyof MapLayerVisibility) => void;
  heatmapOpacity: number;
  onHeatmapOpacityChange: (opacity: number) => void;
}

export const RadiusFilter: React.FC<RadiusFilterProps> = ({
  selectedRadiusKm,
  onRadiusChange,
  selectedDistrict,
  onDistrictChange,
  districts,
  selectedBank,
  onBankChange,
  banks,
  selectedRiskLevel,
  onRiskLevelChange,
  selectedCategory,
  onCategoryChange,
  layers,
  onToggleLayer,
  heatmapOpacity,
  onHeatmapOpacityChange
}) => {
  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Filter className="w-4 h-4 text-cyber-accent" />
          <span>Spatial Intelligence Query</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">GIS FILTERS</span>
      </div>

      {/* District Jurisdiction */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
          <Navigation className="w-3 h-3 text-cyber-accent" />
          <span>District Jurisdiction</span>
        </label>
        <select
          value={selectedDistrict}
          onChange={(e) => onDistrictChange(e.target.value)}
          className="w-full px-3 py-1.5 rounded-lg bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent"
        >
          <option value="ALL">All Jurisdictions (National)</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Bank & Financial Institution Filter */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
          <Building2 className="w-3 h-3 text-cyber-accent" />
          <span>Bank Network</span>
        </label>
        <select
          value={selectedBank}
          onChange={(e) => onBankChange(e.target.value)}
          className="w-full px-3 py-1.5 rounded-lg bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent"
        >
          <option value="ALL">All Banking Networks</option>
          {banks.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Crime Category Filter */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-cyber-accent" />
          <span>Crime Classification</span>
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-3 py-1.5 rounded-lg bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent"
        >
          <option value="ALL">All Crime Categories</option>
          <option value="ATM_WITHDRAWAL_FRAUD">ATM Withdrawal Fraud</option>
          <option value="MONEY_MULE">Money Mule Cashouts</option>
          <option value="SIM_SWAP">SIM Swap Exploitation</option>
          <option value="PHISHING_LINK">Phishing Link Scams</option>
          <option value="VISHING_CALL">Vishing Calls</option>
          <option value="IDENTITY_THEFT">Identity Theft</option>
        </select>
      </div>

      {/* Risk Severity Threshold Filter */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
          Threat Severity Level:
        </label>
        <div className="grid grid-cols-4 gap-1">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onRiskLevelChange(lvl)}
              className={`py-1 rounded text-[10px] font-semibold font-mono border transition-all ${
                selectedRiskLevel === lvl
                  ? lvl === 'CRITICAL'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : lvl === 'HIGH'
                    ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                    : lvl === 'MEDIUM'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-cyber-accent/20 border-cyber-accent text-cyber-accent'
                  : 'bg-cyber-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Spatial Proximity Radius (1km, 3km, 5km) */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
          <span>Surveillance Proximity Radius:</span>
          <strong className="text-cyber-accent font-mono text-xs">{selectedRadiusKm} km</strong>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[1, 3, 5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRadiusChange(r)}
              className={`py-1.5 rounded-lg border text-xs font-semibold font-mono transition-all ${
                selectedRadiusKm === r
                  ? 'bg-cyber-accent/20 border-cyber-accent text-cyber-accent shadow-md'
                  : 'bg-cyber-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {r} km {r === 1 ? '(Near)' : r === 3 ? '(Cluster)' : '(Zone)'}
            </button>
          ))}
        </div>
      </div>

      {/* GIS Operational Layer Toggles */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyber-accent" />
            <span>GIS Operational Overlays</span>
          </span>
          <span className="text-[10px] text-cyber-accent font-mono">6 LAYERS</span>
        </label>

        {/* ATM Terminals */}
        <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-1.5 rounded-lg hover:bg-cyber-900/60">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>ATM Monitored Terminals</span>
          </span>
          <input
            type="checkbox"
            checked={layers.atms}
            onChange={() => onToggleLayer('atms')}
            className="rounded bg-cyber-950 border-slate-700 text-cyber-accent focus:ring-0"
          />
        </label>

        {/* NCRP Complaints */}
        <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-1.5 rounded-lg hover:bg-cyber-900/60">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>NCRP Crime Incident Pins</span>
          </span>
          <input
            type="checkbox"
            checked={layers.complaints}
            onChange={() => onToggleLayer('complaints')}
            className="rounded bg-cyber-950 border-slate-700 text-cyber-accent focus:ring-0"
          />
        </label>

        {/* Suspicious Withdrawals */}
        <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-1.5 rounded-lg hover:bg-cyber-900/60">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Mule Cash-Out Spikes</span>
          </span>
          <input
            type="checkbox"
            checked={layers.withdrawals}
            onChange={() => onToggleLayer('withdrawals')}
            className="rounded bg-cyber-950 border-slate-700 text-cyber-accent focus:ring-0"
          />
        </label>

        {/* AI Predictions */}
        <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-1.5 rounded-lg hover:bg-cyber-900/60">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>AI Predictive Hotspots</span>
          </span>
          <input
            type="checkbox"
            checked={layers.predictions}
            onChange={() => onToggleLayer('predictions')}
            className="rounded bg-cyber-950 border-slate-700 text-cyber-accent focus:ring-0"
          />
        </label>

        {/* Danger Zone Polygons */}
        <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-1.5 rounded-lg hover:bg-cyber-900/60">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded border border-orange-400 bg-orange-400/30"></span>
            <span>Surveillance Danger Polygons</span>
          </span>
          <input
            type="checkbox"
            checked={layers.riskZones}
            onChange={() => onToggleLayer('riskZones')}
            className="rounded bg-cyber-950 border-slate-700 text-cyber-accent focus:ring-0"
          />
        </label>

        {/* Dynamic Risk Heatmap */}
        <div className="space-y-1.5 pt-1 border-t border-slate-800">
          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-1.5 rounded-lg hover:bg-cyber-900/60">
            <span className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Spatial Risk Density Heatmap</span>
            </span>
            <input
              type="checkbox"
              checked={layers.heatmap}
              onChange={() => onToggleLayer('heatmap')}
              className="rounded bg-cyber-950 border-slate-700 text-cyber-accent focus:ring-0"
            />
          </label>

          {layers.heatmap && (
            <div className="px-2 pb-1 space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Heatmap Opacity:</span>
                <span className="font-mono text-cyber-accent">{Math.round(heatmapOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={heatmapOpacity}
                onChange={(e) => onHeatmapOpacityChange(parseFloat(e.target.value))}
                className="w-full accent-cyber-accent h-1 bg-slate-800 rounded cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
