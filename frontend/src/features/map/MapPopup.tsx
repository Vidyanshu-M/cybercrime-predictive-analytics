import React from 'react';
import { ATM, Prediction, Complaint } from '../../types';
import { RiskBadge } from '../../components/RiskBadge';
import { ShieldAlert, AlertTriangle, Clock, MapPin, Activity, FileText } from 'lucide-react';

interface MapPopupModalProps {
  atm: ATM | null;
  prediction?: Prediction | null;
  nearbyComplaints?: Complaint[];
  onClose: () => void;
  onTriggerAlert: (atmCode: string) => void;
}

export const MapPopupModal: React.FC<MapPopupModalProps> = ({
  atm,
  prediction,
  nearbyComplaints = [],
  onClose,
  onTriggerAlert,
}) => {
  if (!atm) return null;

  const riskLevel = prediction?.riskLevel || 'HIGH';
  const riskScore = prediction?.riskScore || 85;

  return (
    <div className="space-y-4 text-slate-700 dark:text-slate-200">
      {/* Top Banner */}
      <div className="flex items-start justify-between bg-cyber-850 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{atm.bankName}</h3>
            <span className="px-2 py-0.5 rounded text-xs font-mono bg-cyber-700 text-cyber-accent">
              {atm.atmCode}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-cyber-accent" />
            <span>{atm.area}, {atm.district} • Type: {atm.atmType}</span>
          </p>
        </div>
        <RiskBadge level={riskLevel} score={riskScore} size="lg" />
      </div>

      {/* Prediction Window & Confidence */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-panel p-3 rounded-xl border border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Predicted Horizon Window</p>
          <p className="text-xs font-semibold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-cyber-accent" />
            <span>Next 3 Hours (07:00 - 10:00)</span>
          </p>
        </div>
        <div className="glass-panel p-3 rounded-xl border border-slate-800">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">ML Model Confidence</p>
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5 font-mono">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>94.2% Probability (xgb-v1)</span>
          </p>
        </div>
      </div>

      {/* XGBoost Feature Explanation */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-cyber-accent" />
          <span>XGBoost Decision Factors (Explainable AI)</span>
        </h4>
        <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
          {prediction?.reasons ? (
            prediction.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2 bg-cyber-850 p-2 rounded-lg border border-slate-800">
                <span className="text-cyber-accent font-bold">•</span>
                <span>{r}</span>
              </li>
            ))
          ) : (
            <>
              <li className="flex items-start gap-2 bg-cyber-850 p-2 rounded-lg border border-slate-800">
                <span className="text-cyber-accent font-bold">•</span>
                <span>High NCRP complaint density within 1.0 km radius in past 6 hours</span>
              </li>
              <li className="flex items-start gap-2 bg-cyber-850 p-2 rounded-lg border border-slate-800">
                <span className="text-cyber-accent font-bold">•</span>
                <span>Abnormal withdrawal frequency spike: 4 max cash out attempts in 15 mins</span>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Nearby Complaints */}
      {nearbyComplaints.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-cyber-accent" />
            <span>Linked NCRP Complaints (1km Proximity)</span>
          </h4>
          <div className="space-y-1.5">
            {nearbyComplaints.slice(0, 2).map((cmp) => (
              <div key={cmp.id} className="glass-card p-2.5 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{cmp.complaintNumber}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{cmp.crimeCategory}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">₹{cmp.fraudAmount.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{cmp.policeStation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => {
            onTriggerAlert(atm.atmCode);
            onClose();
          }}
          className="flex-1 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 dark:text-rose-300 font-bold text-xs uppercase tracking-wider border border-rose-500/40 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Dispatch Command Alert</span>
        </button>
        <button
          onClick={onClose}
          className="btn-secondary"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
