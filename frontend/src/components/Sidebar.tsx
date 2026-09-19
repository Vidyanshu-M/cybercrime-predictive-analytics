import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map, 
  AlertTriangle, 
  Briefcase, 
  BarChart3, 
  Settings,
  BrainCircuit,
  X
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  userRole?: UserRole;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  userRole, 
  mobileOpen = false,
  onCloseMobile 
}) => {
  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Predictive Risk Map',
      path: '/risk-map',
      icon: Map,
    },
    {
      label: 'Alerts & Intelligence',
      path: '/alerts',
      icon: AlertTriangle,
    },
    {
      label: 'Case Investigation',
      path: '/cases',
      icon: Briefcase,
    },
    {
      label: 'Analytics & Models',
      path: '/analytics',
      icon: BarChart3,
    },
    {
      label: 'System Settings',
      path: '/settings',
      icon: Settings,
    }
  ];

  const sidebarContent = (
    <aside className="w-64 border-r border-slate-800/80 bg-cyber-900/60 flex flex-col justify-between shrink-0 h-full min-h-[calc(100vh-4rem)]">
      {/* Primary Nav Links */}
      <div className="p-4 space-y-1.5">
        <div className="flex items-center justify-between px-3 mb-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Intelligence Core
          </p>
          {onCloseMobile && (
            <button 
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onCloseMobile && onCloseMobile()}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  isActive
                    ? 'bg-cyber-accent/15 text-cyber-accent border border-cyber-accent/30 shadow-md font-semibold'
                    : 'text-slate-600 dark:text-slate-400 night:text-slate-400 hover:bg-rose-50 dark:hover:bg-slate-800/60 night:hover:bg-slate-800/60 border border-transparent'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* Role Badge Footer */}
      <div className="p-4 m-3 rounded-xl bg-cyber-850 border border-slate-800/80">
        <div className="flex items-center gap-2 mb-1.5">
          <BrainCircuit className="w-4 h-4 text-cyber-accent" />
          <span className="text-xs font-semibold text-slate-900 dark:text-white night:text-white">
            Role Scope: {userRole || 'I4C_OFFICER'}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 night:text-slate-400 leading-tight">
          Authorized for geospatial fraud prediction, alert assignment & case evidence tracking.
        </p>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 max-w-full bg-cyber-950 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
