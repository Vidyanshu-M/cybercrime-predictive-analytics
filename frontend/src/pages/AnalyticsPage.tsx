import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { MLModelMetrics, DashboardSummary } from '../types';
import { analyticsService } from '../services/analyticsService';
import { MOCK_ML_METRICS, MOCK_DASHBOARD_SUMMARY } from '../services/mockData';
import { BarChart3, BrainCircuit, ShieldCheck, Activity, Award, Layers, RefreshCw, PieChart as PieIcon } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<MLModelMetrics>(MOCK_ML_METRICS);
  const [summary, setSummary] = useState<DashboardSummary>(MOCK_DASHBOARD_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [m, s] = await Promise.all([
        analyticsService.getMLModelMetrics().catch(() => MOCK_ML_METRICS),
        analyticsService.getDashboardSummary().catch(() => MOCK_DASHBOARD_SUMMARY)
      ]);
      setMetrics(m || MOCK_ML_METRICS);
      setSummary(s || MOCK_DASHBOARD_SUMMARY);
    } catch (err) {
      console.error('Failed to load analytics', err);
      setMetrics(MOCK_ML_METRICS);
      setSummary(MOCK_DASHBOARD_SUMMARY);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !metrics) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-cyber-accent border-t-transparent rounded-full animate-spin"></div>
        <span>Loading ML model metrics & charts...</span>
      </div>
    );
  }

  const COLORS = ['#10B981', '#F59E0B', '#F97316', '#EF4444'];

  const riskPieData = [
    { name: 'LOW', value: summary?.riskDistribution?.low ?? 420, color: '#10B981' },
    { name: 'MEDIUM', value: summary?.riskDistribution?.medium ?? 145, color: '#F59E0B' },
    { name: 'HIGH', value: summary?.riskDistribution?.high ?? 48, color: '#F97316' },
    { name: 'CRITICAL', value: summary?.riskDistribution?.critical ?? 14, color: '#EF4444' },
  ];

  const totalRisks = riskPieData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyber-accent" />
            <span>ML Model Evaluation & Analytics Hub</span>
          </h2>
          <p className="text-xs text-slate-400">Model performance metrics (XGBoost) and temporal/spatial fraud analytics.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 hover:text-white font-medium transition-colors cursor-pointer"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyber-accent' : 'text-slate-400'}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-cyber-accent/15 text-cyber-accent border border-cyber-accent/30 font-mono text-xs font-bold">
            {metrics.modelVersion}
          </span>
        </div>
      </div>

      {/* Model Performance Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center hover:border-slate-700 transition-colors">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Precision</p>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">{(metrics.precision * 100).toFixed(1)}%</p>
          <p className="text-[10px] text-slate-400 mt-1">Predicted High-Risk Accuracy</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center hover:border-slate-700 transition-colors">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Recall</p>
          <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">{(metrics.recall * 100).toFixed(1)}%</p>
          <p className="text-[10px] text-slate-400 mt-1">True High-Risk Catch Rate</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center hover:border-slate-700 transition-colors">
          <p className="text-[10px] font-bold text-slate-400 uppercase">F1 Score</p>
          <p className="text-2xl font-bold font-mono text-purple-400 mt-1">{(metrics.f1Score * 100).toFixed(1)}%</p>
          <p className="text-[10px] text-slate-400 mt-1">Harmonic Balance</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center hover:border-slate-700 transition-colors">
          <p className="text-[10px] font-bold text-slate-400 uppercase">ROC-AUC</p>
          <p className="text-2xl font-bold font-mono text-indigo-400 mt-1">{metrics.rocAuc}</p>
          <p className="text-[10px] text-slate-400 mt-1">Discrimination Score</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center col-span-2 md:col-span-1 hover:border-slate-700 transition-colors">
          <p className="text-[10px] font-bold text-slate-400 uppercase">PR-AUC</p>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-1">{metrics.prAuc}</p>
          <p className="text-[10px] text-slate-400 mt-1">Precision-Recall Curve</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Risk Trend Line Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyber-accent" />
              <span>24-Hour Spatial Risk Intensity Trend</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Dynamic 24h Window</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.hourlyRiskTrend || []}>
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F1626', borderColor: '#1F2D4A', borderRadius: '12px', color: '#F1F5F9' }} 
                />
                <Line type="monotone" dataKey="critical" stroke="#EF4444" strokeWidth={2} name="Critical" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="high" stroke="#F97316" strokeWidth={2} name="High" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="medium" stroke="#F59E0B" strokeWidth={2} name="Medium" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Importance Ranking Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-cyber-accent" />
              <span>XGBoost Feature Importance (SHAP Breakdown)</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Relative Weight</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.featureImportance || []} layout="vertical">
                <XAxis type="number" stroke="#64748B" fontSize={11} domain={[0, 'dataMax + 0.05']} />
                <YAxis dataKey="feature" type="category" stroke="#94A3B8" fontSize={10} width={160} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F1626', borderColor: '#1F2D4A', borderRadius: '12px', color: '#F1F5F9' }} 
                  formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}%`, 'SHAP Weight']}
                />
                <Bar dataKey="importance" fill="#38BDF8" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Risk Distribution & District Vulnerability Index */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Level Distribution Donut */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-cyber-accent" />
                <span>Risk Distribution</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">{totalRisks} Total Targets</span>
            </div>
            <p className="text-xs text-slate-400">Current classification breakdown across monitored ATM network.</p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={46}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F1626', borderColor: '#1F2D4A', borderRadius: '12px', color: '#F1F5F9' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold font-mono text-white">{totalRisks}</span>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider">Monitored</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
            {riskPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs px-2 py-1 rounded-lg bg-slate-900/50">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400 text-[10px]">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-white text-[11px]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top District Vulnerability Index */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyber-accent" />
              <span>Top District Cybercrime Vulnerability Index</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">NCR / National Jurisdictions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {(summary.topDistrictRisks || []).map((d, i) => (
              <div key={d.district} className="glass-card p-3.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400">Rank #{i + 1}</span>
                  <span className="text-[10px] font-mono text-slate-500">{d.complaintCount} cases</span>
                </div>
                <p className="text-xs font-bold text-white truncate" title={d.district}>{d.district}</p>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400 text-[10px]">Risk Score:</span>
                  <span className="font-mono font-bold text-cyber-accent text-xs">{d.riskScore}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

