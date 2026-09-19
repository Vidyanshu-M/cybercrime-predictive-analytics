import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { MLModelMetrics, DashboardSummary } from '../types';
import { analyticsService } from '../services/analyticsService';
import { BarChart3, BrainCircuit, Activity, Layers } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<MLModelMetrics | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [m, s] = await Promise.all([
          analyticsService.getMLModelMetrics(),
          analyticsService.getDashboardSummary()
        ]);
        setMetrics(m);
        setSummary(s);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !metrics || !summary) {
    return <div className="py-20 text-center text-slate-500 dark:text-slate-400 text-xs">Loading ML model metrics & charts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white night:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyber-accent" />
            <span>ML Model Evaluation & Analytics Hub</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Model performance metrics (XGBoost) and temporal/spatial fraud analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-cyber-accent/15 text-cyber-accent border border-cyber-accent/30 font-mono text-xs font-bold">
            {metrics.modelVersion}
          </span>
        </div>
      </div>

      {/* Model Performance Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Precision</p>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{(metrics.precision * 100).toFixed(1)}%</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Predicted High-Risk Accuracy</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Recall</p>
          <p className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-1">{(metrics.recall * 100).toFixed(1)}%</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">True High-Risk Catch Rate</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">F1 Score</p>
          <p className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">{(metrics.f1Score * 100).toFixed(1)}%</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Harmonic Balance</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">ROC-AUC</p>
          <p className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">{metrics.rocAuc}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Discrimination Score</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 text-center col-span-2 md:col-span-1">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">PR-AUC</p>
          <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">{metrics.prAuc}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Precision-Recall Curve</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Risk Trend Line Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white night:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyber-accent" />
            <span>24-Hour Spatial Risk Intensity Trend</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.hourlyRiskTrend}>
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F1626', borderColor: '#1F2D4A', borderRadius: '12px', color: '#FFF' }} 
                />
                <Line type="monotone" dataKey="critical" stroke="#EF4444" strokeWidth={2} name="Critical" />
                <Line type="monotone" dataKey="high" stroke="#F97316" strokeWidth={2} name="High" />
                <Line type="monotone" dataKey="medium" stroke="#F59E0B" strokeWidth={2} name="Medium" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature Importance Ranking Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white night:text-white flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-cyber-accent" />
            <span>XGBoost Feature Importance (SHAP Breakdown)</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.featureImportance} layout="vertical">
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis dataKey="feature" type="category" stroke="#64748B" fontSize={10} width={150} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F1626', borderColor: '#1F2D4A', borderRadius: '12px', color: '#FFF' }} 
                />
                <Bar dataKey="importance" fill="#EC4899" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* District Risk Rankings */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white night:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyber-accent" />
          <span>Top District Cybercrime Vulnerability Index</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {summary.topDistrictRisks.map((d, i) => (
            <div key={d.district} className="glass-card p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Rank #{i + 1}</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{d.district}</p>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Risk Score:</span>
                <span className="font-mono font-bold text-cyber-accent">{d.riskScore}/100</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
