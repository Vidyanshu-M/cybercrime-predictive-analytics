import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  AlertTriangle, 
  Briefcase, 
  BarChart3, 
  Settings,
  ShieldAlert,
  BrainCircuit
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  userRole?: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      label: 'Predictive Risk Map',
      path: '/risk-map',
      icon: Map,
      badge: 'GIS'
    },
    {
      label: 'Alerts & Intelligence',
      path: '/alerts',
      icon: AlertTriangle,
      badge: 'LIVE'
    },
    {
      label: 'Case Investigation',
      path: '/cases',
      icon: Briefcase,
      badge: null
    },
    {
      label: 'Analytics & Models',
      path: '/analytics',
      icon: BarChart3,
      badge: 'XGB'
    },
    {
      label: 'System Settings',
      path: '/settings',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-cyber-900/60 backdrop-blur-md flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Primary Nav Links */}
      <div className="p-4 space-y-1.5">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
          Intelligence Core
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  isActive
                    ? 'bg-cyber-accent/15 text-cyber-accent border border-cyber-accent/30 shadow-lg shadow-cyber-accent/5 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyber-700/80 text-cyber-accent border border-cyber-accent/20">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Role Badge Footer */}
      <div className="p-4 m-3 rounded-xl bg-cyber-850/80 border border-slate-800/80">
        <div className="flex items-center gap-2 mb-1.5">
          <BrainCircuit className="w-4 h-4 text-cyber-accent" />
          <span className="text-xs font-semibold text-white">Role Scope: {userRole || 'I4C_OFFICER'}</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Authorized for geospatial fraud prediction, alert assignment & case evidence tracking.
        </p>
      </div>
    </aside>
  );
};
