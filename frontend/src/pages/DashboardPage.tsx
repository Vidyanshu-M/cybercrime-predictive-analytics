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
import { DashboardSummary, ATM, Prediction, Alert } from '../types';
import { analyticsService } from '../services/analyticsService';
import { predictionService } from '../services/predictionService';
import { websocketService } from '../services/websocketService';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [atms, setAtms] = useState<ATM[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [runModalOpen, setRunModalOpen] = useState(false);
  const [selectedAtmId, setSelectedAtmId] = useState<string>('ATM-101');
  const [windowMinutes, setWindowMinutes] = useState<number>(180);
  const [isPredicting, setIsPredicting] = useState(false);
  const [latestPrediction, setLatestPrediction] = useState<Prediction | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [sumData, atmData, predData] = await Promise.all([
          analyticsService.getDashboardSummary(),
          predictionService.getATMs(),
          predictionService.getPredictions()
        ]);
        setSummary(sumData);
        setAtms(atmData);
        setPredictions(predData);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleRunPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPredicting(true);
    try {
      const pred = await predictionService.runPrediction({
        atmId: selectedAtmId,
        predictionWindowMinutes: windowMinutes
      });
      setLatestPrediction(pred);
      setPredictions((prev) => [pred, ...prev]);
      // Also push a live websocket alert
      websocketService.triggerManualDemoAlert(pred.atmCode);
    } catch (err) {
      console.error('Prediction failed', err);
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
            <span>Run ML Risk Model</span>
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
        }}
        title="Execute XGBoost Predictive Risk Cycle"
        maxWidth="lg"
      >
        {!latestPrediction ? (
          <form onSubmit={handleRunPrediction} className="space-y-4">
            <p className="text-xs text-slate-300">
              Submit target ATM and time horizon parameters to trigger live ML feature engineering and risk classification.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target ATM Terminal
              </label>
              <select
                value={selectedAtmId}
                onChange={(e) => setSelectedAtmId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent"
              >
                {atms.map((atm) => (
                  <option key={atm.id} value={atm.id}>
                    {atm.bankName} ({atm.atmCode}) - {atm.area}, {atm.district}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Prediction Window Horizon (Minutes)
              </label>
              <select
                value={windowMinutes}
                onChange={(e) => setWindowMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent"
              >
                <option value={60}>60 Minutes (1 Hour)</option>
                <option value={180}>180 Minutes (3 Hours - Recommended)</option>
                <option value={360}>360 Minutes (6 Hours)</option>
              </select>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRunModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPredicting}
                className="px-5 py-2 rounded-xl bg-cyber-accent text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
              >
                {isPredicting ? 'Inferring XGBoost Model...' : 'Execute Model Inference'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Prediction Cycle Completed Successfully</h4>
                <p className="text-xs">Model inferred risk score and updated spatial alert pipeline.</p>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Target ATM: <strong className="text-white">{latestPrediction.atmCode}</strong></span>
                <RiskBadge level={latestPrediction.riskLevel} score={latestPrediction.riskScore} size="lg" />
              </div>

              <div className="bg-cyber-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                <p className="font-semibold text-cyber-accent">Top Explainable SHAP Features:</p>
                <ul className="list-disc pl-4 text-slate-300 space-y-1">
                  {latestPrediction.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => {
                setRunModalOpen(false);
                setLatestPrediction(null);
                navigate('/alerts');
              }}
              className="w-full py-2.5 rounded-xl bg-cyber-accent text-slate-950 font-bold text-xs uppercase tracking-wider"
            >
              View Generated Alert in Alert Feed →
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};
