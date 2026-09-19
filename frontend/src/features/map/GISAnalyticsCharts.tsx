import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { GISAnalyticsData } from '../../types';
import { BarChart3, Clock, ShieldAlert, Building2, ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface GISAnalyticsChartsProps {
  data: GISAnalyticsData;
}

export const GISAnalyticsCharts: React.FC<GISAnalyticsChartsProps> = ({ data }) => {
  const [activeChartTab, setActiveChartTab] = useState<'temporal' | 'risk' | 'banks'>('temporal');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const customTooltipStyle = {
    backgroundColor: '#070A12',
    borderColor: '#1E293B',
    borderRadius: '10px',
    color: '#F1F5F9',
    fontSize: '11px',
    padding: '8px 12px'
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl transition-all">
      {/* Header Bar */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-cyber-900/60">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyber-accent" />
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>GIS Risk Intelligence Analytics</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-accent/15 text-cyber-accent border border-cyber-accent/30 font-semibold">
                Spatial & Temporal
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Correlated 24-hour diurnal patterns, nocturnal mule spikes, and bank risk distribution.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Selector Buttons */}
          <div className="flex items-center gap-1 bg-cyber-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveChartTab('temporal')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeChartTab === 'temporal'
                  ? 'bg-cyber-accent text-cyber-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              24h Temporal Pattern
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('risk')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeChartTab === 'risk'
                  ? 'bg-cyber-accent text-cyber-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Risk Distribution
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('banks')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeChartTab === 'banks'
                  ? 'bg-cyber-accent text-cyber-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bank Network Exposure
            </button>
          </div>

          {/* Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            title={isCollapsed ? 'Expand Analytics' : 'Collapse Analytics'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Chart Display Body */}
      {!isCollapsed && (
        <div className="p-4 bg-cyber-950/40">
          {activeChartTab === 'temporal' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyber-accent" />
                  <span>24-Hour Diurnal Crime Curve (Nocturnal Mule Spikes vs Morning Complaints)</span>
                </span>
                <span className="text-[10px] font-mono text-amber-400 font-semibold">
                  * Peak mule cashouts: 22:00 - 04:00 AM
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.temporalPatterns} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.7} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="hour" stroke="#64748B" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={customTooltipStyle} />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                      formatter={(val) => <span className="text-slate-300 font-medium">{val}</span>}
                    />
                    <Area
                      type="monotone"
                      dataKey="withdrawalSpikeCount"
                      name="Suspicious Cashout Spikes"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorWithdrawals)"
                    />
                    <Area
                      type="monotone"
                      dataKey="complaintCount"
                      name="NCRP Victim Complaints"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorComplaints)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeChartTab === 'risk' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Donut Chart */}
              <div className="h-60 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.riskDistribution}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {data.riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={customTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-white font-mono">
                    {data.riskDistribution.reduce((acc, d) => acc + d.count, 0)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Total Nodes</span>
                </div>
              </div>

              {/* Breakdown Legend Cards */}
              <div className="col-span-2 grid grid-cols-2 gap-3">
                {data.riskDistribution.map((item) => (
                  <div key={item.category} className="glass-card p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold block" style={{ color: item.color }}>
                        {item.category} THREAT
                      </span>
                      <p className="text-xl font-bold text-white font-mono mt-0.5">{item.count} Nodes</p>
                    </div>
                    <span className="text-sm font-bold font-mono px-2 py-1 rounded bg-cyber-900 border border-slate-800 text-slate-300">
                      {item.percentage}%
                    </span>
                  </div>
                ))}

                {/* Proximity Radius Summary */}
                <div className="col-span-2 bg-cyber-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Incident Proximity Bands:</span>
                  <div className="flex items-center gap-3 font-mono font-semibold">
                    <span className="text-rose-400">&lt;1 km: {data.proximityBreakdown.within1Km}</span>
                    <span className="text-orange-400">1-3 km: {data.proximityBreakdown.within3Km}</span>
                    <span className="text-amber-400">3-5 km: {data.proximityBreakdown.within5Km}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeChartTab === 'banks' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyber-accent" />
                  <span>Fraud Exposure by Banking Network (Fraud Volume in ₹ Lakhs & Compromised ATMs)</span>
                </span>
                <span className="text-[10px] font-mono text-cyber-accent font-semibold">
                  Multi-Institution Telemetry
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.bankExposures} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="bankName" stroke="#64748B" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={customTooltipStyle} />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                      formatter={(val) => <span className="text-slate-300 font-medium">{val}</span>}
                    />
                    <Bar
                      dataKey="fraudAmountLakhs"
                      name="Fraud Volume (₹ Lakhs)"
                      fill="#38BDF8"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="compromisedCount"
                      name="Compromised ATMs"
                      fill="#EF4444"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
