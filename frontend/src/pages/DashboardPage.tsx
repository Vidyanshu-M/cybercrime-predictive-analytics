import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  AlertTriangle, 
  Briefcase, 
  Clock, 
  TrendingUp, 
  Play, 
  ArrowRight, 
  FileText,
  Building2,
  CheckCircle
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { ATMMap } from '../features/map/ATMMap';
import { DashboardSummary, ATM, Prediction, Alert, RiskZone } from '../types';
import { analyticsService } from '../services/analyticsService';
import { predictionService } from '../services/predictionService';
import { websocketService } from '../services/websocketService';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [atms, setAtms] = useState<ATM[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [riskZones, setRiskZones] = useState<RiskZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [selectedAtmId, setSelectedAtmId] = useState<string>('ATM1023');
  const [windowMinutes, setWindowMinutes] = useState<number>(180);
  const [isPredicting, setIsPredicting] = useState(false);
  const [latestPrediction, setLatestPrediction] = useState<Prediction | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [sumData, atmData, predData, zoneData] = await Promise.all([
          analyticsService.getDashboardSummary(),
          predictionService.getATMs().catch(() => []),
          predictionService.getPredictions().catch(() => []),
          predictionService.getRiskZones().catch(() => [])
        ]);
        setSummary(sumData);
        setAtms(atmData);
        setPredictions(predData);
        setRiskZones(zoneData);
        if (atmData && atmData.length > 0) {
          setSelectedAtmId(atmData[0].atmCode || atmData[0].id);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();

    // Subscribe to STOMP WebSocket for real-time alert updates without page reload
    const unsubscribeWs = websocketService.subscribe((newAlert) => {
      setSummary((prev) => {
        if (!prev) return prev;
        const exists = prev.recentAlerts.some((a) => a.id === newAlert.id);
        if (exists) return prev;
        return {
          ...prev,
          pendingAlerts: prev.pendingAlerts + 1,
          recentAlerts: [newAlert, ...prev.recentAlerts.slice(0, 9)]
        };
      });
    });

    return () => {
      unsubscribeWs();
    };
  }, []);

  const handleRunPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPredicting(true);
    setPredictionError(null);
    try {
      const pred = await predictionService.runPrediction({
        atmId: selectedAtmId,
        predictionWindowMinutes: windowMinutes
      });
      setLatestPrediction(pred);
      setPredictions((prev) => [pred, ...prev]);

      // Refresh RiskZones to display newly generated/updated polygon on map
      try {
        const updatedZones = await predictionService.getRiskZones();
        setRiskZones(updatedZones);
      } catch (zoneErr) {
        console.warn('Failed to refresh risk zones', zoneErr);
      }
    } catch (err: any) {
      console.error('Prediction failed', err);
      setPredictionError(err.response?.data?.detail || err.response?.data?.message || 'Prediction execution failed. Please verify that the backend and ML services are reachable.');
    } finally {
      setIsPredicting(false);
    }
  };

  if (loading || !summary) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-cyber-accent border-t-transparent animate-spin"></div>
        <span>Initializing CyberTrace Intelligence Core...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              NATIONAL THREAT LEVEL: HIGH
            </span>
            <span className="text-xs text-slate-400">Refreshed 2 mins ago</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Command & Control Dashboard</h2>
          <p className="text-xs text-slate-400">Geospatial fraud prediction and active cybercrime incident monitoring.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRunModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyber-accent to-indigo-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyber-accent/20 hover:opacity-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Run Prediction</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total NCRP Complaints"
          value={summary.totalComplaints.toLocaleString()}
          subtext="Processed in platform"
          icon={FileText}
          trend={{ value: '+14.2%', isPositive: false }}
          accentColor="purple"
        />
        <StatCard
          title="Active Risk Hotspots"
          value={summary.activeHotspots}
          subtext="1km / 3km spatial clusters"
          icon={MapPin}
          trend={{ value: '+2 zones', isPositive: false }}
          accentColor="rose"
        />
        <StatCard
          title="Critical Risk ATMs"
          value={summary.highRiskATMs}
          subtext="Targeted cash-out nodes"
          icon={Building2}
          trend={{ value: '-3 terminals', isPositive: true }}
          accentColor="amber"
        />
        <StatCard
          title="Fraud Prevented (Est.)"
          value={`₹${(summary.fraudAmountPrevented / 100000).toFixed(1)} Lakh`}
          subtext="Saved by proactive alerts"
          icon={ShieldAlert}
          trend={{ value: '+28%', isPositive: true }}
          accentColor="emerald"
        />
      </div>

      {/* Main Grid: Mini Map + Live Alerts Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: GIS Interactive Mini Map */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyber-accent" />
                <span>Predictive Risk Map (Live Overview)</span>
              </h3>
              <p className="text-xs text-slate-400">Spatial visualization of active ATM risk pins & NCRP complaint clusters.</p>
            </div>
            <button
              onClick={() => navigate('/risk-map')}
              className="text-xs font-semibold text-cyber-accent hover:underline flex items-center gap-1"
            >
              <span>Full Screen Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ATMMap
            atms={atms}
            predictions={predictions}
            riskZones={riskZones}
            height="400px"
          />
        </div>

        {/* Right Col: High Priority Alert Feed */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Pending Command Alerts</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400">
              {summary.pendingAlerts} UNREAD
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
            {summary.recentAlerts.map((alt) => (
              <div
                key={alt.id}
                onClick={() => navigate(`/alerts/${alt.id}`)}
                className="glass-card p-3 rounded-xl border-l-4 border-l-rose-500 hover:border-slate-700 cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">{alt.district}</span>
                  <RiskBadge level={alt.riskLevel} score={alt.riskScore} size="sm" />
                </div>
                <p className="text-xs font-semibold text-white line-clamp-2">{alt.message}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Code: {alt.atmCode || 'N/A'}</span>
                  <StatusBadge status={alt.status} />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/alerts')}
            className="w-full py-2.5 rounded-xl bg-cyber-850 hover:bg-cyber-800 text-slate-300 font-semibold text-xs border border-slate-800 text-center transition-colors"
          >
            View All Incident Alerts →
          </button>
        </div>
      </div>

      {/* Recent NCRP Complaints Feed */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyber-accent" />
              <span>Recent Cybercrime Complaints Feed (NCRP Ingest)</span>
            </h3>
            <p className="text-xs text-slate-400">Latest cyber fraud reports linked with spatial coordinates.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-cyber-900 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Complaint Ref</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Fraud Amount</th>
                <th className="px-4 py-3">Police Station</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {summary.recentComplaints.map((cmp) => (
                <tr key={cmp.id} className="hover:bg-cyber-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-cyber-accent">{cmp.complaintNumber}</td>
                  <td className="px-4 py-3 font-medium text-white">{cmp.crimeCategory.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-emerald-400">₹{cmp.fraudAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-slate-300">{cmp.policeStation}</td>
                  <td className="px-4 py-3 text-slate-400">{cmp.district}</td>
                  <td className="px-4 py-3"><StatusBadge status={cmp.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Run Prediction Cycle */}
      <Modal
        isOpen={runModalOpen}
        onClose={() => {
          setRunModalOpen(false);
          setLatestPrediction(null);
          setPredictionError(null);
        }}
        title="Run Predictive Risk Intelligence"
        maxWidth="xl"
      >
        {!latestPrediction ? (
          <form onSubmit={handleRunPrediction} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              <div>
                <p className="text-xs text-slate-300">
                  Execute automated 21-feature spatial extraction and XGBoost threat forecasting for target ATM terminals.
                </p>
              </div>

              {predictionError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{predictionError}</span>
                </div>
              )}

              {/* Quick Terminal Selection Cards */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Target Terminal
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2.5">
                  <div
                    onClick={() => setSelectedAtmId('ATM1023')}
                    className={`min-w-0 w-full p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 ${
                      selectedAtmId === 'ATM1023'
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-white break-words">Connaught Place</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">CRITICAL</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono break-words">SBI • ATM1023</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 break-words">Outer Circle, New Delhi</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                      selectedAtmId === 'ATM1023' ? 'border-amber-400 bg-amber-400' : 'border-slate-700'
                    }`}>
                      {selectedAtmId === 'ATM1023' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedAtmId('ATM0002')}
                    className={`min-w-0 w-full p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 ${
                      selectedAtmId === 'ATM0002'
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-white break-words">Godowlia</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">BASELINE</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono break-words">PNB • ATM0002</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 break-words">Godowlia, Varanasi</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                      selectedAtmId === 'ATM0002' ? 'border-emerald-400 bg-emerald-400' : 'border-slate-700'
                    }`}>
                      {selectedAtmId === 'ATM0002' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                  </div>
                </div>

                {/* Or choose from dropdown */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Or select any terminal from platform ({atms.length > 0 ? `${atms.length} available` : '505 total'}):
                  </label>
                  <select
                    value={selectedAtmId}
                    onChange={(e) => setSelectedAtmId(e.target.value)}
                    className="w-full min-w-0 px-3 py-2 rounded-xl bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent font-mono truncate"
                  >
                    {atms.length === 0 ? (
                      <>
                        <option value="ATM1023">State Bank of India (ATM1023) - Connaught Place, New Delhi</option>
                        <option value="ATM0002">Punjab National Bank (ATM0002) - Godowlia, Varanasi</option>
                      </>
                    ) : (
                      atms.map((atm) => (
                        <option key={atm.id} value={atm.atmCode || atm.id}>
                          {atm.bankName} ({atm.atmCode}) - {atm.area}, {atm.district}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Forecasting Window Horizon Buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Forecasting Window Horizon
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 60, label: '1 Hour', desc: 'Immediate window' },
                    { value: 180, label: '3 Hours', desc: 'Recommended' },
                    { value: 360, label: '6 Hours', desc: 'Extended shift' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setWindowMinutes(item.value)}
                      className={`min-w-0 w-full p-2.5 rounded-xl border text-center transition-all ${
                        windowMinutes === item.value
                          ? 'bg-cyber-accent/15 border-cyber-accent text-cyber-accent shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <span className="block text-xs font-bold break-words">{item.label}</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5 break-words">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </main>

            {/* Pinned Footer Buttons */}
            <footer className="shrink-0 px-4 py-3 sm:px-5 sm:py-3.5 border-t border-slate-800/80 bg-cyber-950 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setRunModalOpen(false);
                  setPredictionError(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors text-center cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPredicting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyber-accent to-indigo-600 hover:opacity-95 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-cyber-accent/20 cursor-pointer transition-all"
              >
                {isPredicting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin shrink-0"></div>
                    <span>Inferring Model...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span>Run Prediction</span>
                  </>
                )}
              </button>
            </footer>
          </form>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Prediction Cycle Completed Successfully</h4>
                  <p className="text-xs text-emerald-400/80">XGBoost model computed risk score and updated spatial alert pipeline.</p>
                </div>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Target ATM: <strong className="text-white font-mono text-sm">{latestPrediction.atmCode}</strong></span>
                  <RiskBadge level={latestPrediction.riskLevel} score={latestPrediction.riskScore} size="lg" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                  <div className="bg-cyber-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Model Version</span>
                    <strong className="text-cyber-accent font-mono font-bold">{latestPrediction.modelVersion || 'xgb-v1'}</strong>
                  </div>
                  <div className="bg-cyber-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Probability</span>
                    <strong className="text-emerald-400 font-mono font-bold">{(latestPrediction.probability * 100).toFixed(2)}%</strong>
                  </div>
                  <div className="bg-cyber-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Risk Score</span>
                    <strong className="text-white font-mono font-bold">{latestPrediction.riskScore}/100</strong>
                  </div>
                  <div className="bg-cyber-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Horizon Window</span>
                    <strong className="text-amber-400 font-mono font-bold">{windowMinutes} Minutes</strong>
                  </div>
                </div>

                <div className="bg-cyber-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5">
                  <p className="font-semibold text-cyber-accent">Explainable Feature Drivers (SHAP Baseline):</p>
                  <ul className="list-disc pl-4 text-slate-300 space-y-1">
                    {latestPrediction.reasons && latestPrediction.reasons.length > 0 ? (
                      latestPrediction.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))
                    ) : (
                      <li>Normal historical baseline activity observed.</li>
                    )}
                  </ul>
                </div>
              </div>
            </main>

            <footer className="shrink-0 px-4 py-3 sm:px-5 sm:py-3.5 border-t border-slate-800/80 bg-cyber-950 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setLatestPrediction(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors text-center cursor-pointer"
              >
                Run Another Terminal
              </button>
              <button
                type="button"
                onClick={() => {
                  setRunModalOpen(false);
                  setLatestPrediction(null);
                  navigate('/alerts');
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyber-accent to-indigo-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-lg shadow-cyber-accent/20 text-center cursor-pointer"
              >
                View in Alert Feed →
              </button>
            </footer>
          </div>
        )}
      </Modal>
    </div>
  );
};
