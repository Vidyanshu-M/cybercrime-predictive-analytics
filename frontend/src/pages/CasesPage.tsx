import React, { useState, useEffect } from 'react';
import { Case, CasePriority, CaseStatus } from '../types';
import { caseService } from '../services/caseService';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { Briefcase, Plus, Search, FileText, ArrowRight, UserCheck, Shield, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CasesPage: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New Case Form
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<CasePriority>('HIGH');
  const [district, setDistrict] = useState('New Delhi');
  const [summary, setSummary] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await caseService.getCases();
      setCases(data);
    } catch (err) {
      console.error('Failed to fetch cases', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCase = await caseService.createCase({
        title,
        priority,
        district,
        summary
      });
      setCases((prev) => [newCase, ...prev]);
      setCreateModalOpen(false);
      setTitle('');
      setSummary('');
    } catch (err) {
      console.error('Failed to create case', err);
    }
  };

  const filteredCases = (Array.isArray(cases) ? cases : []).filter((c) => {
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        (c.title || '').toLowerCase().includes(q) ||
        (c.caseNumber || '').toLowerCase().includes(q) ||
        (c.district || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-cyber-accent" />
            <span>Cybercrime Case Investigation Hub</span>
          </h2>
          <p className="text-xs text-slate-400">Manage ongoing cyber fraud cases, linked NCRP complaints, and evidentiary artifacts.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchCases(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 hover:text-white font-medium transition-colors cursor-pointer"
            title="Refresh Cases"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyber-accent' : 'text-slate-400'}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyber-accent to-indigo-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyber-accent/20 hover:opacity-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Investigation Case</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by case number, title, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-cyber-850 text-xs font-mono font-semibold text-cyber-accent border border-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{filteredCases.length} Dossiers</span>
          </span>
        </div>
      </div>

      {/* Cases Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading cases...</div>
      ) : filteredCases.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-400 text-xs rounded-xl">
          No cases matching your search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/cases/${c.id}`)}
              className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 space-y-3 cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-cyber-accent/15 text-cyber-accent border border-cyber-accent/30">
                  {c.caseNumber}
                </span>
                <StatusBadge status={c.status} />
              </div>

              <h3 className="text-sm font-bold text-white group-hover:text-cyber-accent transition-colors">
                {c.title}
              </h3>

              <p className="text-xs text-slate-400 line-clamp-2">{c.summary}</p>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                <div>Complaints: <strong className="text-white">{c.complaintCount ?? 0}</strong></div>
                <div>Transactions: <strong className="text-white">{c.transactionCount ?? 0}</strong></div>
                <div>Evidence Files: <strong className="text-white">{c.evidenceCount ?? 0}</strong></div>
              </div>

              <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400">
                <span>Officer: <strong className="text-purple-400">{c.assignedOfficer || 'Inspector Vikram Roy'}</strong></span>
                <span className="flex items-center gap-1 text-cyber-accent font-semibold">
                  <span>Inspect Case</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Case Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Initialize New Investigation Case"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateCase} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Case Title / Incident Header
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Connaught Place ATM Cash Out Syndicate"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as CasePriority)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                District Jurisdiction
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Case Brief / Summary
            </label>
            <textarea
              rows={3}
              required
              placeholder="Summarize initial complaints and suspicious withdrawal patterns..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyber-accent text-slate-950 font-bold text-xs uppercase tracking-wider"
            >
              Create Case File
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
