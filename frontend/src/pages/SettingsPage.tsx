import React, { useState, useEffect } from 'react';
import { Settings, Server, Radio, Database, ShieldCheck, RefreshCw, CheckCircle, AlertTriangle, Moon, Sun, Sparkles } from 'lucide-react';
import { authService } from '../services/authService';
import { useTheme, ThemeMode } from '../context/ThemeContext';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [useMock, setUseMock] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<'IDLE' | 'CHECKING' | 'CONNECTED' | 'FAILED'>('IDLE');
  const [backendUrl, setBackendUrl] = useState('http://localhost:8080/api');

  useEffect(() => {
    const isMock = localStorage.getItem('cybertrace_use_mock') === 'true';
    setUseMock(isMock);
  }, []);

  const handleToggleMock = (value: boolean) => {
    setUseMock(value);
    localStorage.setItem('cybertrace_use_mock', value ? 'true' : 'false');
  };

  const testBackendConnection = async () => {
    setBackendStatus('CHECKING');
    try {
      const res = await fetch(`${backendUrl}/atms`, { method: 'GET' });
      if (res.ok) {
        setBackendStatus('CONNECTED');
      } else {
        setBackendStatus('FAILED');
      }
    } catch {
      setBackendStatus('FAILED');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyber-accent" />
          <span>System & Appearance Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Customize UI theme (Dark, Night, Light Mode), API endpoints, and live stream settings.
        </p>
      </div>

      {/* Theme Selection */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sparkles className="w-4 h-4 text-cyber-accent" />
          <span>Display Mode & Visual Theme</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border text-left transition-all ${
              theme === 'dark'
                ? 'bg-cyber-accent/15 border-cyber-accent text-white shadow-lg'
                : 'bg-cyber-850 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyber-accent flex items-center gap-1.5">
                <Moon className="w-4 h-4" />
                <span>Dark Mode</span>
              </span>
              {theme === 'dark' && <CheckCircle className="w-4 h-4 text-cyber-accent" />}
            </div>
            <p className="text-xs text-slate-300">Cyber Midnight Navy theme with high contrast blue accents.</p>
          </button>

          <button
            onClick={() => setTheme('night')}
            className={`p-4 rounded-xl border text-left transition-all ${
              theme === 'night'
                ? 'bg-amber-500/15 border-amber-400 text-white shadow-lg'
                : 'bg-cyber-850 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Night Mode</span>
              </span>
              {theme === 'night' && <CheckCircle className="w-4 h-4 text-amber-400" />}
            </div>
            <p className="text-xs text-slate-300">Ultra-dark OLED pitch black with warm nocturnal glowing tones.</p>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border text-left transition-all ${
              theme === 'light'
                ? 'bg-pink-500/15 border-pink-400 text-white shadow-lg'
                : 'bg-cyber-850 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <Sun className="w-4 h-4" />
                <span>Light Mode</span>
              </span>
              {theme === 'light' && <CheckCircle className="w-4 h-4 text-pink-400" />}
            </div>
            <p className="text-xs text-slate-300">Halka Pink soft background & Eye Resolution comfort colors.</p>
          </button>
        </div>
      </div>

      {/* API Source Switcher */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Database className="w-4 h-4 text-cyber-accent" />
          <span>Data Provider & Backend Endpoint Mode</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleToggleMock(true)}
            className={`p-4 rounded-xl border text-left transition-all ${
              useMock
                ? 'bg-cyber-accent/15 border-cyber-accent text-white shadow-lg'
                : 'bg-cyber-850 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyber-accent">Mock Data Engine</span>
              {useMock && <CheckCircle className="w-4 h-4 text-cyber-accent" />}
            </div>
            <p className="text-xs text-slate-300">Standalone prototype mode with synthetic NCRP complaints, ATM pins, and XGBoost predictions.</p>
          </button>

          <button
            onClick={() => handleToggleMock(false)}
            className={`p-4 rounded-xl border text-left transition-all ${
              !useMock
                ? 'bg-purple-500/15 border-purple-400 text-white shadow-lg'
                : 'bg-cyber-850 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Live Spring Boot Backend</span>
              {!useMock && <CheckCircle className="w-4 h-4 text-purple-400" />}
            </div>
            <p className="text-xs text-slate-300">Connect to Member 3 Spring Boot REST API (`http://localhost:8080/api`) & PostGIS database.</p>
          </button>
        </div>

        {/* Backend Connection Health Check */}
        {!useMock && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-slate-300 font-semibold">Spring Boot Base API URL</label>
              <button
                onClick={testBackendConnection}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-semibold flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${backendStatus === 'CHECKING' ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-950 border border-slate-800 text-white text-xs font-mono"
            />

            {backendStatus === 'CONNECTED' && (
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>Spring Boot Backend is ONLINE and responding!</span>
              </p>
            )}

            {backendStatus === 'FAILED' && (
              <p className="text-xs text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Could not reach backend at {backendUrl}. Ensure Spring Boot app is running.</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* WebSocket Settings */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Radio className="w-4 h-4 text-cyber-accent" />
          <span>Real-Time WebSocket Incident Alert Feed</span>
        </h3>

        <div className="flex items-center justify-between text-xs text-slate-300">
          <div>
            <p className="font-semibold text-white">Live Alert Simulator Stream</p>
            <p className="text-slate-400 text-[11px]">Periodically push synthetic high-risk spatial alerts during demo presentation.</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
            ACTIVE
          </span>
        </div>
      </div>
    </div>
  );
};
