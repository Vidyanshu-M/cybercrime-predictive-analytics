import React from 'react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ 
  level, 
  score, 
  size = 'md',
  showPulse = true 
}) => {
  const getColors = () => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-rose-900/30';
      case 'HIGH':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/40 shadow-orange-900/30';
      case 'MEDIUM':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/40 shadow-amber-900/30';
      case 'LOW':
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-emerald-900/30';
    }
  };

  const getDotColor = () => {
    switch (level) {
      case 'CRITICAL': return 'bg-rose-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-amber-500';
      case 'LOW': default: return 'bg-emerald-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'px-2 py-0.5 text-xs gap-1';
      case 'lg': return 'px-4 py-1.5 text-sm gap-2 font-bold';
      case 'md': default: return 'px-2.5 py-1 text-xs gap-1.5 font-semibold';
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full border backdrop-blur-sm ${getColors()} ${getSizeClasses()}`}>
      <span className="relative flex h-2 w-2">
        {showPulse && (level === 'CRITICAL' || level === 'HIGH') && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getDotColor()}`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${getDotColor()}`}></span>
      </span>
      <span>{level}</span>
      {score !== undefined && (
        <span className="opacity-85 font-mono">({score})</span>
      )}
    </span>
  );
};
