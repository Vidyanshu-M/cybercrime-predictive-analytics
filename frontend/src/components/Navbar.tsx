import React, { useState } from 'react';
import { Shield, Bell, Zap, User as UserIcon, LogOut, CheckCircle, Radio } from 'lucide-react';
import { User } from '../types';
import { websocketService } from '../services/websocketService';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  pendingAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, pendingAlertCount }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [demoTriggered, setDemoTriggered] = useState(false);

  const handleManualDemoTrigger = () => {
    setDemoTriggered(true);
    websocketService.triggerManualDemoAlert('ATM1023');
    setTimeout(() => setDemoTriggered(false), 2000);
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-cyber-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand / Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-cyber-accent/20 to-indigo-500/20 border border-cyber-accent/30 text-cyber-accent">
          <Shield className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-wider uppercase font-sans">
              CYBER<span className="text-cyber-accent">TRACE</span>
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyber-accent/15 text-cyber-accent border border-cyber-accent/30">
              v1.0 MVP
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Cybercrime Predictive Analytics & GIS Intelligence</p>
        </div>
      </div>

      {/* Center Ticker / Live Demo Trigger */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-850 border border-slate-800 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-medium">WS Live Feed:</span>
          <span className="text-emerald-400 font-mono font-semibold">ONLINE</span>
        </div>

        <button
          onClick={handleManualDemoTrigger}
          disabled={demoTriggered}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 transition-all text-xs font-semibold"
          title="Simulate live ML fraud prediction push alert"
        >
          <Zap className={`w-3.5 h-3.5 ${demoTriggered ? 'animate-bounce' : ''}`} />
          <span>{demoTriggered ? 'Alert Pushed!' : 'Simulate Live Alert'}</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Theme Switcher Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => window.location.hash = '/alerts'}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {pendingAlertCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {pendingAlertCount}
              </span>
            )}
          </button>
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-lg object-cover border border-cyber-accent/40" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-cyber-700 text-cyber-accent flex items-center justify-center font-bold text-sm">
                {user?.name.charAt(0) || 'U'}
              </div>
            )}
            <div className="text-left hidden lg:block">
              <p className="text-xs font-semibold text-white leading-tight">{user?.name}</p>
              <p className="text-[10px] text-cyber-accent font-mono">{user?.role}</p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 glass-panel bg-cyber-900 border-slate-800 rounded-xl shadow-2xl py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="font-semibold text-white">{user?.name}</p>
                <p className="text-slate-400 text-[11px] truncate">{user?.email}</p>
                <span className="mt-1 inline-block px-2 py-0.5 rounded bg-cyber-accent/15 text-cyber-accent font-mono text-[10px]">
                  {user?.department}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
