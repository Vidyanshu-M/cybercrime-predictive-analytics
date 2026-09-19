import React, { useEffect } from 'react';
import { TimeWindowFilterState, TimeWindowPreset } from '../../types';
import { Clock, Play, Pause, RotateCcw, FastForward, Calendar, Zap } from 'lucide-react';

interface TimeWindowFilterProps {
  filterState: TimeWindowFilterState;
  onChange: (newState: TimeWindowFilterState) => void;
  activeIncidentCount?: number;
}

export const TimeWindowFilter: React.FC<TimeWindowFilterProps> = ({
  filterState,
  onChange,
  activeIncidentCount = 0
}) => {
  // Simulation interval timer when playing
  useEffect(() => {
    if (!filterState.isSimulating) return;

    const intervalMs = Math.max(400, Math.floor(2000 / filterState.simulationSpeed));
    const timer = setInterval(() => {
      const current = filterState.selectedHour ?? 0;
      const nextHour = (current + 1) % 24;
      onChange({
        ...filterState,
        selectedHour: nextHour
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [filterState, onChange]);

  const handlePresetSelect = (preset: TimeWindowPreset) => {
    onChange({
      ...filterState,
      preset,
      selectedHour: undefined,
      isSimulating: false
    });
  };

  const handleSliderChange = (hour: number) => {
    onChange({
      ...filterState,
      selectedHour: hour
    });
  };

  const toggleSimulation = () => {
    onChange({
      ...filterState,
      isSimulating: !filterState.isSimulating,
      selectedHour: filterState.selectedHour ?? 0
    });
  };

  const resetToRealtime = () => {
    onChange({
      ...filterState,
      isSimulating: false,
      selectedHour: undefined,
      preset: '24h'
    });
  };

  const formatHourLabel = (hour?: number) => {
    if (hour === undefined) return 'Full 24-Hour Aggregate';
    const h = hour.toString().padStart(2, '0');
    if (hour >= 22 || hour <= 4) {
      return `${h}:00 (Nocturnal Mule Cash-Out Window)`;
    } else if (hour >= 6 && hour <= 11) {
      return `${h}:00 (Morning Complaint Spike Window)`;
    } else if (hour >= 18 && hour <= 21) {
      return `${h}:00 (Evening Surge Window)`;
    }
    return `${h}:00 Normal Operating Window`;
  };

  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyber-accent" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Temporal Surveillance & Horizon
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {filterState.selectedHour !== undefined && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyber-accent/15 text-cyber-accent border border-cyber-accent/30 font-semibold animate-pulse">
              Simulating Hour {filterState.selectedHour}:00
            </span>
          )}
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyber-850 text-slate-300 border border-slate-800">
            {activeIncidentCount} Events in Window
          </span>
        </div>
      </div>

      {/* Preset Time Windows */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
          Historical Observation Window:
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {(['1h', '6h', '24h', '7d', 'all'] as TimeWindowPreset[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePresetSelect(p)}
              className={`py-1 rounded-lg text-[11px] font-mono font-semibold transition-all border ${
                filterState.preset === p && filterState.selectedHour === undefined
                  ? 'bg-cyber-accent/20 border-cyber-accent text-cyber-accent shadow-sm'
                  : 'bg-cyber-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 24-Hour Temporal Scrubber with Play/Pause Simulation */}
      <div className="bg-cyber-950/80 p-3 rounded-xl border border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyber-accent" />
            <span className="text-[11px] font-bold text-white">24-Hour Forensic Playback Scrubber</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed toggle */}
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...filterState,
                  simulationSpeed: filterState.simulationSpeed === 1 ? 2 : filterState.simulationSpeed === 2 ? 5 : 1
                })
              }
              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 hover:text-white"
              title="Change Simulation Playback Speed"
            >
              {filterState.simulationSpeed}x
            </button>

            {/* Play / Pause button */}
            <button
              type="button"
              onClick={toggleSimulation}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                filterState.isSimulating
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/40 hover:bg-cyber-accent/30'
              }`}
            >
              {filterState.isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{filterState.isSimulating ? 'Pause' : 'Replay Timeline'}</span>
            </button>

            {/* Reset to live */}
            {filterState.selectedHour !== undefined && (
              <button
                type="button"
                onClick={resetToRealtime}
                title="Reset to Realtime All Day"
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Range slider 0 to 23 */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={23}
            step={1}
            value={filterState.selectedHour ?? 12}
            onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
            className="w-full accent-cyber-accent h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>00:00 (Night)</span>
            <span>06:00 (Dawn)</span>
            <span>12:00 (Noon)</span>
            <span>18:00 (Dusk)</span>
            <span>23:00 (Peak)</span>
          </div>
        </div>

        <p className="text-[11px] font-mono text-center text-slate-300 font-semibold bg-cyber-900/60 py-1 rounded border border-slate-800">
          Current Window: <strong className="text-cyber-accent">{formatHourLabel(filterState.selectedHour)}</strong>
        </p>
      </div>

      {/* Prediction Horizon Controls */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
          AI Risk Horizon Forecast Window:
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[1, 3, 6].map((hours) => (
            <button
              key={hours}
              type="button"
              onClick={() => onChange({ ...filterState, predictionHorizonHours: hours })}
              className={`py-1.5 rounded-lg text-[11px] font-mono font-semibold transition-all border ${
                filterState.predictionHorizonHours === hours
                  ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-sm'
                  : 'bg-cyber-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              +{hours} Hours {hours === 3 ? '(Recommended)' : ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
