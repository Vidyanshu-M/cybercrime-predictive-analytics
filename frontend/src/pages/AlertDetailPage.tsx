import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert } from '../types';
import { alertService } from '../services/alertService';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { ATMMap } from '../features/map/ATMMap';
import { MOCK_ATMS } from '../services/mockData';
import { AlertTriangle, ArrowLeft, MapPin, ShieldAlert, Briefcase } from 'lucide-react';

export const AlertDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadAlert() {
      if (!id) return;
      try {
        const data = await alertService.getAlertById(id);
        setAlert(data);
      } catch (err) {
        console.error('Failed to load alert details', err);
      } finally {
        setLoading(false);
      }
    }
    loadAlert();
  }, [id]);

  if (loading || !alert) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-slate-400 text-xs">
        Loading alert intelligence details...
      </div>
    );
  }

  const linkedAtm = MOCK_ATMS.find((a) => a.id === alert.atmId || a.atmCode === alert.atmCode) || MOCK_ATMS[0];

  return (
    <div className="space-y-6">
      {/* Top Back Navigation */}
      <button
        onClick={() => navigate('/alerts')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Alerts Hub</span>
      </button>

      {/* Main Alert Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyber-accent">{alert.id}</span>
                <StatusBadge status={alert.status} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white night:text-white mt-0.5">{alert.message}</h2>
            </div>
          </div>

          <RiskBadge level={alert.riskLevel} score={alert.riskScore} size="lg" />
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">District Jurisdiction</p>
            <p className="text-slate-900 dark:text-white font-semibold mt-0.5">{alert.district}</p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Target ATM Code</p>
            <p className="text-cyber-accent font-mono font-bold mt-0.5">{alert.atmCode || 'Spatial Hotspot'}</p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Alert Trigger Time</p>
            <p className="text-slate-700 dark:text-slate-200 font-mono mt-0.5">{new Date(alert.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold">Assigned Officer</p>
            <p className="text-purple-600 dark:text-purple-400 font-semibold mt-0.5">{alert.assignedTo || 'Unassigned'}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Map Location + XGBoost Feature Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Location */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white night:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyber-accent" />
            <span>Target Terminal Coordinates & Fraud Radius</span>
          </h3>

          <ATMMap
            atms={[linkedAtm]}
            center={[linkedAtm.location.lat, linkedAtm.location.lng]}
            zoom={14}
            height="360px"
          />
        </div>

        {/* XGBoost Decision Factors */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white night:text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldAlert className="w-4 h-4 text-cyber-accent" />
            <span>XGBoost Intelligence Factors</span>
          </h3>

          <div className="space-y-2 text-xs">
            {alert.reasons ? (
              alert.reasons.map((r, i) => (
                <div key={i} className="p-3 rounded-xl bg-cyber-850 border border-slate-800 text-slate-700 dark:text-slate-200">
                  <span className="text-cyber-accent font-bold mr-1.5">•</span>
                  <span>{r}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-xs">Model confidence score: {alert.riskScore}%</p>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/cases')}
              className="w-full py-2.5 rounded-xl bg-cyber-accent text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
            >
              <Briefcase className="w-4 h-4" />
              <span>Link to Investigation Case</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
