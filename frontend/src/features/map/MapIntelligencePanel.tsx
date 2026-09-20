import React, { useState } from 'react';
import { ATM, Prediction, Complaint, Transaction, RiskZone } from '../../types';
import { RiskBadge } from '../../components/RiskBadge';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Activity, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  X, 
  Send, 
  Lock, 
  Download, 
  Building2, 
  TrendingUp, 
  Radio,
  Layers
} from 'lucide-react';

interface MapIntelligencePanelProps {
  selectedAtm?: ATM | null;
  selectedZone?: RiskZone | null;
  prediction?: Prediction | null;
  nearbyComplaints: Complaint[];
  nearbyTransactions: Transaction[];
  onClose: () => void;
  onTriggerAlert: (atmCode: string, alertType: string) => void;
}

export const MapIntelligencePanel: React.FC<MapIntelligencePanelProps> = ({
  selectedAtm,
  selectedZone,
  prediction,
  nearbyComplaints = [],
  nearbyTransactions = [],
  onClose,
  onTriggerAlert
}) => {
  const [activeTab, setActiveTab] = useState<'shap' | 'incidents' | 'actions'>('shap');
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  if (!selectedAtm && !selectedZone) return null;

  const title = selectedAtm ? (selectedAtm.bankName || selectedAtm.bankId || 'ATM Terminal') : (selectedZone?.name || 'Surveillance Zone');
  const subtitle = selectedAtm
    ? `${selectedAtm.atmCode || selectedAtm.id || 'ATM'} • ${selectedAtm.area || 'Perimeter'}, ${selectedAtm.district || 'Surveillance Area'}`
    : `Surveillance Zone • ${selectedZone?.radiusKm || 0.8} km radius`;
  const riskLevel = prediction?.riskLevel || selectedZone?.riskLevel || 'HIGH';
  const riskScore = prediction?.riskScore || selectedZone?.riskScore || 85;

  const handleAction = (msg: string) => {
    setActionStatus(msg);
    if (selectedAtm) {
      onTriggerAlert(selectedAtm.atmCode, msg);
    }
    setTimeout(() => setActionStatus(null), 3500);
  };

  const handleExportGeoJson = () => {
    const dossier = {
      type: 'FeatureCollection',
      generatedAt: new Date().toISOString(),
      properties: {
        title,
        riskLevel,
        riskScore,
        district: selectedAtm?.district || 'Surveillance Region',
        jurisdiction: selectedAtm?.area || selectedZone?.name || 'Jurisdiction Area'
      },
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: selectedAtm
              ? [selectedAtm.location?.lng ?? 77.2197, selectedAtm.location?.lat ?? 28.6328]
              : [selectedZone?.center?.lng ?? 77.2197, selectedZone?.center?.lat ?? 28.6328]
          },
          properties: {
            nodeType: selectedAtm ? 'ATM_TERMINAL' : 'RISK_ZONE',
            details: selectedAtm || selectedZone
          }
        }
      ]
    };

    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GIS_Dossier_${selectedAtm?.atmCode || selectedZone?.id || 'export'}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Mock SHAP feature contributions
  const shapFactors = [
    { name: 'NCRP Complaint Density (1km / 6h)', score: '+38%', percent: 85, color: 'bg-rose-500' },
    { name: 'Burst Cash-Out Velocity Surge', score: '+29%', percent: 68, color: 'bg-orange-500' },
    { name: 'Temporal Nocturnal Hotspot Window', score: '+19%', percent: 45, color: 'bg-amber-500' },
    { name: 'Mule Ring Account Cross-Match', score: '+14%', percent: 32, color: 'bg-purple-500' }
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[750px] overflow-hidden">
      {/* Top Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-[10px] font-mono text-cyber-accent uppercase font-bold tracking-wider">
              GIS Spatial Intelligence Dossier
            </span>
          </div>
          <h3 className="text-base font-bold text-white leading-snug">{title}</h3>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-cyber-accent shrink-0" />
            <span>{subtitle}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <RiskBadge level={riskLevel} score={riskScore} size="md" />
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Toast */}
      {actionStatus && (
        <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{actionStatus}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-cyber-950 p-1 rounded-xl border border-slate-800 text-xs mb-3 font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('shap')}
          className={`py-1.5 rounded-lg transition-all ${
            activeTab === 'shap'
              ? 'bg-cyber-accent/20 text-cyber-accent shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          XGBoost Factors
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('incidents')}
          className={`py-1.5 rounded-lg transition-all ${
            activeTab === 'incidents'
              ? 'bg-cyber-accent/20 text-cyber-accent shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Linked Feed ({nearbyComplaints.length + nearbyTransactions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('actions')}
          className={`py-1.5 rounded-lg transition-all ${
            activeTab === 'actions'
              ? 'bg-cyber-accent/20 text-cyber-accent shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tactical Actions
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
        {activeTab === 'shap' && (
          <div className="space-y-3.5">
            {/* Model Confidence & Horizon */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-cyber-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Forecast Window</span>
                <span className="font-mono text-white font-bold flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-cyber-accent" />
                  <span>Next 3 Hours</span>
                </span>
              </div>
              <div className="bg-cyber-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Model Confidence</span>
                <span className="font-mono text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>94.2% (xgb-v1.4)</span>
                </span>
              </div>
            </div>

            {/* Explainable AI Decision Bars */}
            <div className="bg-cyber-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-cyber-accent" />
                  <span>SHAP Decision Factors</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Weight Impact</span>
              </div>

              <div className="space-y-2">
                {shapFactors.map((factor, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300">{factor.name}</span>
                      <span className="font-mono font-bold text-cyber-accent">{factor.score}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${factor.color} rounded-full`}
                        style={{ width: `${factor.percent}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Decision Text */}
            <div className="bg-cyber-900/50 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5 text-slate-300">
              <p className="font-semibold text-white text-[11px]">Summary Intelligence Assessment:</p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Terminal exhibits a high-probability pattern matching organized mule cash-outs. Coordinated
                withdrawals within 15 minutes of reported victim phishing events require immediate field deployment.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="space-y-3">
            <p className="text-[11px] text-slate-400">
              Correlated incidents within surveillance perimeter (1.0 km radius):
            </p>

            {/* Complaints list */}
            {nearbyComplaints.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-purple-300 uppercase">
                  NCRP Complaints ({nearbyComplaints.length})
                </span>
                {nearbyComplaints.map((c) => (
                  <div key={c.id} className="bg-cyber-950/80 p-2.5 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-purple-300 font-bold">{c.complaintNumber || 'NCRP-INCIDENT'}</span>
                      <span className="text-emerald-400 font-semibold">₹{(c.fraudAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">{(c.crimeCategory || 'INCIDENT').replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{c.policeStation || 'Surveillance District'}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Withdrawals list */}
            {nearbyTransactions.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-mono font-bold text-amber-300 uppercase">
                  Suspicious ATM Cashouts ({nearbyTransactions.length})
                </span>
                {nearbyTransactions.map((t) => (
                  <div key={t.id} className="bg-cyber-950/80 p-2.5 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-amber-300 font-bold">{t.transactionReference || 'TXN-REF'}</span>
                      <span className="text-rose-400 font-bold">₹{(t.amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Account: {t.accountId} • {t.transactionTime ? new Date(t.transactionTime).toLocaleTimeString() : 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {nearbyComplaints.length === 0 && nearbyTransactions.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-xs">
                No active correlated incidents within this immediate perimeter.
              </div>
            )}
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-2.5">
            <p className="text-[11px] text-slate-400">
              Immediate operational command options for law enforcement & bank nodal officers:
            </p>

            <button
              type="button"
              onClick={() => handleAction('Police Beat Patrol squad dispatched to terminal location.')}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center justify-between transition-colors shadow-md"
            >
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-400" />
                <span>Dispatch Police Flying Squad</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-500/30">Priority 1</span>
            </button>

            <button
              type="button"
              onClick={() => handleAction('I4C Financial Fraud Advisory broadcast to all partner banks.')}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-between transition-colors shadow-md"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Broadcast Bank Nodal Alert</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/30">Alert</span>
            </button>

            <button
              type="button"
              onClick={() => handleAction('Terminal cash-dispenser temporarily throttled/locked.')}
              className="w-full py-2.5 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center justify-between transition-colors shadow-md"
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-400" />
                <span>Throttle / Lock ATM Dispenser</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-purple-500/30">Security</span>
            </button>

            <button
              type="button"
              onClick={handleExportGeoJson}
              className="w-full py-2.5 px-3 rounded-xl bg-cyber-accent/20 hover:bg-cyber-accent/30 text-cyber-accent border border-cyber-accent/40 text-xs font-bold flex items-center justify-between transition-colors shadow-md"
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-cyber-accent" />
                <span>Export GeoJSON Dossier</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyber-accent/30">GIS file</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
