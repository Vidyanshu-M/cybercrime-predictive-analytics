import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { AlertToast } from '../components/AlertToast';
import { User, Alert } from '../types';
import { authService } from '../services/authService';
import { alertService } from '../services/alertService';
import { websocketService } from '../services/websocketService';

export const MainLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeToast, setActiveToast] = useState<Alert | null>(null);
  const [pendingAlertCount, setPendingAlertCount] = useState<number>(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Initial alert count
    alertService.getAlerts().then((alerts) => {
      const pending = alerts.filter((a) => a.status === 'NEW').length;
      setPendingAlertCount(pending);
    });

    // Connect WebSocket
    websocketService.connect();

    // Subscribe to live incoming alerts
    const unsubscribe = websocketService.subscribe((newAlert) => {
      setActiveToast(newAlert);
      setPendingAlertCount((prev) => prev + 1);
    });

    return () => {
      unsubscribe();
      websocketService.disconnect();
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-cyber-950 text-slate-900 dark:text-slate-100 night:text-slate-100 transition-colors">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        pendingAlertCount={pendingAlertCount} 
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          userRole={user?.role} 
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {activeToast && (
        <AlertToast 
          alert={activeToast} 
          onDismiss={() => setActiveToast(null)} 
        />
      )}
    </div>
  );
};
