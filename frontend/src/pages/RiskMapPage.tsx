import React, { useState, useEffect, useMemo } from 'react';
import { ATMMap } from '../features/map/ATMMap';
import { RadiusFilter } from '../features/map/RadiusFilter';
import { TimeWindowFilter } from '../features/map/TimeWindowFilter';
import { RiskLegend } from '../features/map/RiskLegend';
import { MapIntelligencePanel } from '../features/map/MapIntelligencePanel';
import { GISAnalyticsCharts } from '../features/map/GISAnalyticsCharts';
import { 
  ATM, 
  Complaint, 
  RiskZone, 
  Prediction, 
  Transaction, 
  MapLayerVisibility, 
  TimeWindowFilterState 
} from '../types';
import { predictionService } from '../services/predictionService';
import { complaintService } from '../services/complaintService';
import { transactionService } from '../services/transactionService';
import { websocketService } from '../services/websocketService';
import { MOCK_GIS_ANALYTICS } from '../services/mockData';
import { 
  MapPin, 
  ShieldAlert, 
  Activity, 
  Flame, 
  Radio, 
  BarChart3, 
  Clock, 
  CreditCard, 
  AlertTriangle 
} from 'lucide-react';

export const RiskMapPage: React.FC = () => {
  const [atms, setAtms] = useState<ATM[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedBank, setSelectedBank] = useState<string>('ALL');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(1);
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.65);

  // Layer Visibility
  const [layers, setLayers] = useState<MapLayerVisibility>({
    atms: true,
    complaints: true,
    withdrawals: true,
    predictions: true,
    heatmap: true,
    riskZones: true
  });

  // Time Window & Simulation State
  const [timeFilter, setTimeFilter] = useState<TimeWindowFilterState>({
    preset: '24h',
    selectedHour: undefined,
    predictionHorizonHours: 3,
    isSimulating: false,
    simulationSpeed: 1
  });

  // Selected Entities for Intelligence Dossier Panel
  const [selectedAtm, setSelectedAtm] = useState<ATM | null>(null);
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);

  useEffect(() => {
    async function loadMapData() {
      try {
        const [atmData, cmpData, wthData, zoneData, predData] = await Promise.all([
          predictionService.getATMs().catch(() => []),
          complaintService.getComplaints().catch(() => []),
          transactionService.getSuspiciousWithdrawals().catch(() => []),
          predictionService.getRiskZones().catch(() => []),
          predictionService.getPredictions().catch(() => [])
        ]);
        setAtms(atmData);
        setComplaints(cmpData);
        setWithdrawals(wthData);
        setRiskZones(zoneData);
        setPredictions(predData);

        // Pre-select CP ATM for instant intelligence briefing
        if (atmData.length > 0) {
          setSelectedAtm(atmData[0]);
        }
      } catch (err) {
        console.error('Failed to load map data', err);
      } finally {
        setLoading(false);
      }
    }
    loadMapData();
  }, []);

  // Filter complaints by selectedHour (simulation) or preset
  const temporallyFilteredComplaints = useMemo(() => {
    const list = Array.isArray(complaints) ? complaints : [];
    if (timeFilter.selectedHour !== undefined) {
      return list.filter((c) => {
        if (!c?.reportedAt) return true;
        const hour = new Date(c.reportedAt).getUTCHours();
        // Include events within +/- 1 hour of simulated hour for smooth demo playback
        return Math.abs(hour - timeFilter.selectedHour!) <= 1;
      });
    }
    return list;
  }, [complaints, timeFilter.selectedHour]);

  // Filter withdrawals by selectedHour (simulation) or preset
  const temporallyFilteredWithdrawals = useMemo(() => {
    const list = Array.isArray(withdrawals) ? withdrawals : [];
    if (timeFilter.selectedHour !== undefined) {
      return list.filter((w) => {
        if (!w?.transactionTime) return true;
        const hour = new Date(w.transactionTime).getUTCHours();
        return Math.abs(hour - timeFilter.selectedHour!) <= 1;
      });
    }
    return list;
  }, [withdrawals, timeFilter.selectedHour]);

  const districts = useMemo(() => {
    const list = Array.isArray(atms) ? atms : [];
    return Array.from(new Set(list.map((a) => a?.district).filter(Boolean) as string[])).sort();
  }, [atms]);

  const banks = useMemo(() => {
    const list = Array.isArray(atms) ? atms : [];
    return Array.from(new Set(list.map((a) => a?.bankName || a?.bankId).filter(Boolean) as string[])).sort();
  }, [atms]);

  const toggleLayer = (layerKey: keyof MapLayerVisibility) => {
    setLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  const handleTriggerDemoAlert = (atmCode: string, alertType: string) => {
    websocketService.triggerManualDemoAlert(atmCode);
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 rounded-full border-2 border-cyber-accent border-t-transparent animate-spin"></div>
        <span className="font-mono text-sm tracking-wider text-white">
          Initializing Geospatial GIS Intelligence Engine & Multi-Basemap Tiles...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header & Tactical Status Ribbon */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-mono text-cyber-accent font-bold uppercase tracking-wider">
              GIS Spatial Operations Command Center
            </span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
            <MapPin className="w-5 h-5 text-cyber-accent" />
            <span>Predictive Geospatial Intelligence & Crime Risk Map</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time multi-layer surveillance correlating NCRP fraud complaints, ATM telemetry, nocturnal cashouts, and XGBoost predictive hotspots.
          </p>
        </div>

        {/* Live KPI Metrics Pill Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-cyber-900 border border-slate-800 flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Monitored ATMs</span>
            <strong className="text-xs font-mono text-white">{atms.length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-800/60 flex items-center gap-2">
            <span className="text-[10px] text-purple-300 uppercase font-mono">Complaints</span>
            <strong className="text-xs font-mono text-purple-200">{temporallyFilteredComplaints.length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-center gap-2">
            <span className="text-[10px] text-amber-300 uppercase font-mono">Cashout Spikes</span>
            <strong className="text-xs font-mono text-amber-200">{temporallyFilteredWithdrawals.length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-center gap-2">
            <span className="text-[10px] text-rose-300 uppercase font-mono">AI Danger Corridors</span>
            <strong className="text-xs font-mono text-rose-200">{riskZones.length} Active</strong>
          </div>
        </div>
      </div>

      {/* Main Command Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Col (3/12): Filters & Time Scrubber */}
        <div className="lg:col-span-3 space-y-4">
          <RadiusFilter
            selectedRadiusKm={selectedRadiusKm}
            onRadiusChange={setSelectedRadiusKm}
            selectedDistrict={selectedDistrict}
            onDistrictChange={setSelectedDistrict}
            districts={districts}
            selectedBank={selectedBank}
            onBankChange={setSelectedBank}
            banks={banks}
            selectedRiskLevel={selectedRiskLevel}
            onRiskLevelChange={setSelectedRiskLevel}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            layers={layers}
            onToggleLayer={toggleLayer}
            heatmapOpacity={heatmapOpacity}
            onHeatmapOpacityChange={setHeatmapOpacity}
          />

          <TimeWindowFilter
            filterState={timeFilter}
            onChange={setTimeFilter}
            activeIncidentCount={temporallyFilteredComplaints.length + temporallyFilteredWithdrawals.length}
          />

          <RiskLegend />
        </div>

        {/* Center/Right (9/12): Leaflet Map Engine & Slide-Over Intelligence Panel */}
        <div className="lg:col-span-9 space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* Interactive Leaflet Map (fills 7 or 12 cols depending on intelligence dossier state) */}
            <div className={selectedAtm || selectedZone ? 'xl:col-span-7' : 'xl:col-span-12'}>
              <ATMMap
                atms={atms}
                complaints={temporallyFilteredComplaints}
                withdrawals={temporallyFilteredWithdrawals}
                predictions={predictions}
                riskZones={riskZones}
                layers={layers}
                selectedDistrict={selectedDistrict}
                selectedBank={selectedBank}
                selectedRiskLevel={selectedRiskLevel}
                selectedCategory={selectedCategory}
                selectedRadiusKm={selectedRadiusKm}
                heatmapOpacity={heatmapOpacity}
                height="680px"
                onAtmSelect={(atm) => {
                  setSelectedAtm(atm);
                  setSelectedZone(null);
                }}
                onZoneSelect={(zone) => {
                  setSelectedZone(zone);
                  setSelectedAtm(null);
                }}
                onComplaintSelect={(cmp) => {
                  const linkedAtm = atms.find((a) => a?.district && cmp?.district && a.district.toLowerCase() === cmp.district.toLowerCase()) || atms[0] || null;
                  setSelectedAtm(linkedAtm);
                }}
                onWithdrawalSelect={(txn) => {
                  const linkedAtm = atms.find((a) => a && (a.id === txn?.atmId || a.atmCode === txn?.atmId)) || atms[0] || null;
                  setSelectedAtm(linkedAtm);
                }}
              />
            </div>

            {/* Slide-Over GIS Intelligence Panel (fills 5 cols when active) */}
            {(selectedAtm || selectedZone) && (
              <div className="xl:col-span-5">
                <MapIntelligencePanel
                  selectedAtm={selectedAtm}
                  selectedZone={selectedZone}
                  prediction={selectedAtm ? predictions.find((p) => p.atmId === selectedAtm.id || (selectedAtm.atmCode && p.atmCode === selectedAtm.atmCode)) || null : null}
                  nearbyComplaints={
                    selectedAtm && selectedAtm.district
                      ? (Array.isArray(complaints) ? complaints : []).filter((c) => c?.district && c.district.toLowerCase() === selectedAtm.district.toLowerCase())
                      : (Array.isArray(complaints) ? complaints : [])
                  }
                  nearbyTransactions={
                    selectedAtm
                      ? (Array.isArray(withdrawals) ? withdrawals : []).filter((w) => w && (w.atmId === selectedAtm.id || (selectedAtm.atmCode && w.atmId === selectedAtm.atmCode)))
                      : (Array.isArray(withdrawals) ? withdrawals : [])
                  }
                  onClose={() => {
                    setSelectedAtm(null);
                    setSelectedZone(null);
                  }}
                  onTriggerAlert={handleTriggerDemoAlert}
                />
              </div>
            )}
          </div>

          {/* Embedded Recharts GIS Analytics Panel (Risk Distribution & 24h Temporal Pattern) */}
          <GISAnalyticsCharts data={MOCK_GIS_ANALYTICS} />
        </div>
      </div>
    </div>
  );
};
