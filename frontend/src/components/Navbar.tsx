import React, { useState, useRef, useEffect } from 'react';
import { Shield, Bell, LogOut, Menu, ArrowRight, MoreVertical, Sun, Moon, Eye, Settings, User as UserIcon } from 'lucide-react';
import { User, Alert } from '../types';
import { websocketService } from '../services/websocketService';
import { alertService } from '../services/alertService';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  pendingAlertCount: number;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onLogout, 
  pendingAlertCount,
  onToggleMobileSidebar 
}) => {
  const { theme, setTheme } = useTheme();
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Alert[]>([]);
  const [demoTriggered, setDemoTriggered] = useState(false);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const threeDotsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    alertService.getAlerts().then((data) => {
      setNotifications(data.slice(0, 5));
    });
  }, [pendingAlertCount]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (threeDotsRef.current && !threeDotsRef.current.contains(event.target as Node)) {
        setShowThreeDotsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleManualDemoTrigger = () => {
    setDemoTriggered(true);
    websocketService.triggerManualDemoAlert('ATM1023');
    setTimeout(() => setDemoTriggered(false), 2000);
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-cyber-900/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Brand & Mobile Hamburger */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyber-accent/20 to-indigo-500/20 border border-cyber-accent/30 text-cyber-accent">
            <Shield className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-white night:text-white tracking-wider uppercase font-sans">
                CYBER<span className="text-cyber-accent">TRACE</span>
              </h1>
              <span className="relative flex h-2.5 w-2.5" title="Live Connection Online">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 night:text-slate-400 font-medium hidden sm:block">
              Cybercrime Predictive Analytics & GIS Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Center Trigger (Hidden on Mobile) */}
      <div className="hidden lg:flex items-center gap-3">
        <button
          onClick={handleManualDemoTrigger}
          disabled={demoTriggered}
          className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 transition-all text-xs font-semibold"
          title="Trigger live ML fraud prediction alert"
        >
          <span>{demoTriggered ? 'Alert Pushed' : 'Live Alert'}</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 night:text-slate-300 hover:bg-rose-100/60 dark:hover:bg-slate-800 night:hover:bg-slate-800 transition-colors relative"
            title="Live Incident Notifications"
          >
            <Bell className="w-5 h-5" />
            {pendingAlertCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md">
                {pendingAlertCount > 9 ? '9+' : pendingAlertCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 border border-slate-800">
              <div className="px-4 py-3 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyber-accent" />
                  <span className="font-bold text-xs text-slate-900 dark:text-white night:text-white uppercase tracking-wider">
                    Incident Alerts Feed
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-500">
                  {pendingAlertCount} NEW
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/40">
                {notifications.length > 0 ? (
                  notifications.map((alt) => (
                    <div
                      key={alt.id}
                      onClick={() => {
                        setShowNotifications(false);
                        navigate(`/alerts/${alt.id}`);
                      }}
                      className="p-3 hover:bg-rose-100/60 dark:hover:bg-slate-800/80 night:hover:bg-amber-950/40 transition-colors cursor-pointer space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-cyber-accent">{alt.id}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(alt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white night:text-white line-clamp-1">
                        {alt.message}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {alt.district} • ATM: {alt.atmCode || 'Cluster'}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-400">No active notifications</div>
                )}
              </div>

              <div className="p-2 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/alerts');
                  }}
                  className="w-full py-2 rounded-xl bg-cyber-accent/15 text-cyber-accent font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-cyber-accent/25 transition-colors"
                >
                  <span>View All Alerts Hub</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Three-Dots System Options & Settings Menu */}
        <div className="relative" ref={threeDotsRef}>
          <button
            onClick={() => setShowThreeDotsMenu(!showThreeDotsMenu)}
            className="p-2.5 rounded-xl text-slate-700 dark:text-slate-300 night:text-slate-300 hover:bg-rose-100/60 dark:hover:bg-slate-800 night:hover:bg-slate-800 border border-slate-300 dark:border-slate-800 transition-colors flex items-center gap-1.5"
            title="System Options & Settings"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <UserIcon className="w-4 h-4 text-cyber-accent" />
            )}
            <MoreVertical className="w-4 h-4" />
          </button>

          {showThreeDotsMenu && (
            <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl shadow-2xl py-3 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150 border border-slate-800 space-y-3">
              {/* User Info Section */}
              <div className="px-4 pb-3 border-b border-slate-800/80 flex items-center gap-3">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-xl object-cover border border-cyber-accent/40" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-cyber-accent/20 text-cyber-accent flex items-center justify-center font-bold text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-900 dark:text-white night:text-white truncate">{user?.name || 'Officer'}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                  <span className="mt-0.5 inline-block px-2 py-0.2 rounded bg-cyber-accent/15 text-cyber-accent font-mono text-[9px] font-bold">
                    {user?.role || 'I4C_OFFICER'}
                  </span>
                </div>
              </div>

              {/* Theme Shades Selector */}
              <div className="px-3 space-y-1.5">
                <p className="px-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Theme Shades
                </p>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 night:bg-slate-900 border border-slate-300 dark:border-slate-800">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg font-semibold text-[10px] transition-all ${
                      theme === 'light'
                        ? 'bg-white text-pink-600 shadow-sm font-bold border border-pink-200'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                    title="Soft Light Pink Mode"
                  >
                    <Sun className="w-3 h-3 text-pink-500" />
                    <span>Light</span>
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg font-semibold text-[10px] transition-all ${
                      theme === 'dark'
                        ? 'bg-cyber-800 text-cyber-accent shadow-sm font-bold border border-cyber-accent/40'
                        : 'text-slate-600 dark:text-slate-400 hover:text-white'
                    }`}
                    title="Cyber Midnight Navy Dark Mode"
                  >
                    <Moon className="w-3 h-3 text-cyber-accent" />
                    <span>Dark</span>
                  </button>

                  <button
                    onClick={() => setTheme('night')}
                    className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg font-semibold text-[10px] transition-all ${
                      theme === 'night'
                        ? 'bg-slate-900 text-amber-400 shadow-sm font-bold border border-amber-500/40'
                        : 'text-slate-600 dark:text-slate-400 hover:text-white'
                    }`}
                    title="Pitch OLED Warm Eye-Care Amber Mode"
                  >
                    <Eye className="w-3 h-3 text-amber-400" />
                    <span>Night</span>
                  </button>
                </div>
              </div>

              {/* Quick Links */}
              <div className="px-2 pt-1 border-t border-slate-800/80 space-y-0.5">
                <button
                  onClick={() => {
                    setShowThreeDotsMenu(false);
                    navigate('/settings');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-100/60 dark:hover:bg-slate-800 night:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                >
                  <Settings className="w-4 h-4 text-cyber-accent" />
                  <span>System Settings</span>
                </button>
              </div>

              {/* Auth Actions */}
              <div className="px-2 pt-1 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    setShowThreeDotsMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-500/15 text-rose-500 flex items-center gap-2.5 font-semibold transition-colors"
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
