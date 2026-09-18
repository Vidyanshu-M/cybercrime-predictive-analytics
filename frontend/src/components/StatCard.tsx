import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'cyan' | 'rose' | 'amber' | 'emerald' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  accentColor = 'cyan'
}) => {
  const getIconGlow = () => {
    switch (accentColor) {
      case 'rose': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'amber': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'emerald': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'purple': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'cyan': default: return 'bg-cyber-accent/10 text-cyber-accent border-cyber-accent/30';
    }
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-5 relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold font-sans text-white mt-1 group-hover:text-cyber-accent transition-colors">
            {value}
          </h3>
          {subtext && (
            <p className="text-xs text-slate-400 mt-1">{subtext}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${getIconGlow()} transition-transform group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center text-xs">
          <span className={trend.isPositive ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-slate-400 ml-1.5">vs previous 24h window</span>
        </div>
      )}
    </div>
  );
};
