import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { authService } from '../services/authService';
import { MOCK_USERS } from '../services/mockData';
import { ShieldCheck, ArrowRight, UserCheck, KeyRound } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('I4C_OFFICER');
  const [email, setEmail] = useState('none@cybertrace.gov.in');
  const [password, setPassword] = useState('cybersecret123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRolePresetSelect = (role: UserRole) => {
    setSelectedRole(role);
    const user = MOCK_USERS.find((u) => u.role === role);
    if (user) {
      setEmail(user.email);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.login({ email, password, role: selectedRole });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-cyber-accent" />
        <span>Officer Authentication</span>
      </h2>
      <p className="text-xs text-slate-400 mb-6">Select demo role profile or enter credentials to sign in.</p>

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Role Preset Quick Switcher */}
      <div className="mb-6">
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Demo Role Preset Switcher
        </label>
        <div className="grid grid-cols-2 gap-2">
          {MOCK_USERS.map((usr) => (
            <button
              key={usr.id}
              type="button"
              onClick={() => handleRolePresetSelect(usr.role)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                selectedRole === usr.role
                  ? 'bg-cyber-accent/15 border-cyber-accent text-white shadow-lg shadow-cyber-accent/10'
                  : 'bg-cyber-850 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <p className="text-xs font-semibold leading-tight">{usr.role}</p>
              <p className="text-[10px] opacity-75 truncate">{usr.name}</p>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-cyber-accent" />
            <span>Official Email Address</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-cyber-accent" />
            <span>Password (JWT Auth)</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-cyber-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyber-accent transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyber-accent to-indigo-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 transition-opacity shadow-lg shadow-cyber-accent/20"
        >
          {loading ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <span>Access Intelligence Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
