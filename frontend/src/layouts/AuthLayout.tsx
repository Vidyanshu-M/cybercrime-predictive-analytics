import React from 'react';
import { Outlet } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-cyber-950 p-4 relative overflow-hidden">
      {/* Dynamic Background Glow Effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyber-accent/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-cyber-850 border border-cyber-accent/30 text-cyber-accent shadow-xl mb-3">
            <Shield className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-white uppercase tracking-widest font-sans">
            CYBER<span className="text-cyber-accent">TRACE</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Cybercrime Predictive Analytics & GIS Spatial Intelligence Platform
          </p>
        </div>

        <Outlet />

        <div className="mt-8 text-center flex items-center justify-center gap-2 text-slate-500 text-[11px]">
          <Lock className="w-3.5 h-3.5" />
          <span>Restricted Portal • Authorized Personnel Only • RBAC Enforcement Active</span>
        </div>
      </div>
    </div>
  );
};
