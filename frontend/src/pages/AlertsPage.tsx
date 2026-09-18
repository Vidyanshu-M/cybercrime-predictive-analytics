import React, { useState, useEffect } from 'react';
import { Alert, AlertStatus, RiskLevel } from '../types';
import { alertService } from '../services/alertService';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { AlertTriangle, Filter, ArrowRight, UserCheck, CheckCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Assign Officer Modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetAlertId, setTargetAlertId] = useState<string | null>(null);
  const [officerName, setOfficerName] = useState('None');

  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await alertService.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to fetch alerts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await alertService.acknowledgeAlert(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      console.error('Failed to acknowledge alert', err);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAlertId) return;
    try {
      const updated = await alertService.assignAlert(targetAlertId, officerName);
      setAlerts((prev) => prev.map((a) => (a.id === targetAlertId ? updated : a)));
      setAssignModalOpen(false);
    } catch (err) {
      console.error('Failed to assign alert', err);
    }
  };

  const filteredAlerts = alerts.filter((alt) => {
    if (statusFilter !== 'ALL' && alt.status !== statusFilter) return false;
    if (riskFilter !== 'ALL' && alt.riskLevel !== riskFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        alt.message.toLowerCase().includes(q) ||
        alt.district.toLowerCase().includes(q) ||
        (alt.atmCode && alt.atmCode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>Incident Alert Command Hub</span>
          </h2>
          <p className="text-xs text-slate-400">Real-time alerts triggered by XGBoost fraud risk models & spatial cluster thresholds.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-cyber-850 text-xs font-mono font-semibold text-cyber-accent border border-slate-800">
            Total Alerts: {alerts.length}
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter by district or ATM code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New Only</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
            <option value="LOW">Low Only</option>
          </select>
        </div>
      </div>

      {/* Alerts Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading alerts...</div>
      ) : filteredAlerts.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400 text-xs rounded-xl">
          No alerts matching the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              onClick={() => navigate(`/alerts/${alt.id}`)}
              className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 space-y-3 cursor-pointer group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyber-850 text-cyber-accent border border-slate-800">
                    {alt.id}
                  </span>
                  <StatusBadge status={alt.status} />
                </div>
                <RiskBadge level={alt.riskLevel} score={alt.riskScore} size="sm" />
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-cyber-accent transition-colors">
                {alt.message}
              </h3>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                <div>District: <strong className="text-slate-200">{alt.district}</strong></div>
                <div>ATM Terminal: <strong className="text-slate-200">{alt.atmCode || 'N/A'}</strong></div>
                {alt.assignedTo && (
                  <div className="col-span-2 text-cyber-accent font-medium">Assigned Officer: {alt.assignedTo}</div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(alt.createdAt).toLocaleString()}
                </span>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {alt.status === 'NEW' && (
                    <button
                      onClick={(e) => handleAcknowledge(alt.id, e)}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-xs font-semibold border border-purple-500/30 flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  )}

                  {alt.status !== 'RESOLVED' && (
                    <button
                      onClick={() => {
                        setTargetAlertId(alt.id);
                        setAssignModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-cyber-accent/20 text-cyber-accent hover:bg-cyber-accent/30 text-xs font-semibold border border-cyber-accent/30 flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Assign</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Officer Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Alert to Responding Officer"
        maxWidth="md"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <p className="text-xs text-slate-300">
            Specify officer name and department responsible for investigating this spatial fraud alert.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Officer Profile / Name
            </label>
            <select
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent"
            >
              <option value="None">None</option>
              <option value="Officer - I4C Lead">Officer - I4C Lead</option>
              <option value="Officer - State Cyber Cell">Officer - State Cyber Cell</option>
              <option value="Officer - Bank FRM">Officer - Bank FRM</option>
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyber-accent text-slate-950 font-bold text-xs uppercase tracking-wider"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
