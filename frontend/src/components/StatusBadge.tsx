import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status.toUpperCase()) {
      case 'NEW':
      case 'OPEN':
      case 'PENDING':
        return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'ACKNOWLEDGED':
      case 'INVESTIGATING':
      case 'IN_PROGRESS':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'ASSIGNED':
        return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getStyle()}`}>
      {status.replace('_', ' ')}
    </span>
  );
};
