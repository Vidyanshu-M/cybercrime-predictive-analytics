import React from 'react';
import { Alert } from '../types';
import { RiskBadge } from './RiskBadge';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AlertToastProps {
  alert: Alert;
  onDismiss: () => void;
}

export const AlertToast: React.FC<AlertToastProps> = ({ alert, onDismiss }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full glass-panel border-rose-500/40 bg-cyber-900/95 p-4 rounded-xl shadow-2xl animate-bounce-short border-l-4 border-l-rose-500">
      <div className="flex items-start justify-between gap-3">
        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">{new Date(alert.createdAt).toLocaleTimeString()}</span>
            <RiskBadge level={alert.riskLevel} score={alert.riskScore} size="sm" />
          </div>
          <h4 className="text-sm font-semibold text-white mt-1 line-clamp-1">{alert.message}</h4>
          <p className="text-xs text-slate-300 mt-1">{alert.district} • {alert.atmCode || 'Spatial Hotspot'}</p>
          
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onDismiss();
                navigate(`/alerts/${alert.id}`);
              }}
              className="inline-flex items-center text-xs font-semibold text-cyber-accent hover:underline gap-1"
            >
              <span>Inspect Intelligence</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDismiss}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
