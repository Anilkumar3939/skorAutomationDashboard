import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ExecuteSuites from './components/ExecuteSuites';
import StatsRow from './components/StatsRow';
import ChartsSection from './components/ChartsSection';
import RecentRuns from './components/RecentRuns';
import RightColumn from './components/RightColumn';

// Page Components
import TestRunsPage from './components/TestRunsPage';
import TestSuitesPage from './components/TestSuitesPage';
import ReportsPage from './components/ReportsPage';
import HistoryPage from './components/HistoryPage';
import AnalyticsPage from './components/AnalyticsPage';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';

import { CheckCircle, AlertTriangle, Construction } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('auth'));
  const [activePage, setActivePage] = useState('dashboard');
  const [runningSuite, setRunningSuite] = useState(null);
  const [toast, setToast] = useState(null);
  const [runsList, setRunsList] = useState([]);
  
  // Settings state
  const [settings, setSettings] = useState({
    theme: 'light',
    primaryColor: 'blue',
    backgroundStyle: 'default',
    sidebarStyle: 'dark'
  });
  
  const handleLogin = () => {
    sessionStorage.setItem('auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('auth');
    setIsAuthenticated(false);
  };

  // Stats State
  const [stats, setStats] = useState({
    totalRuns: 0,
    latestStatus: 'N/A',
    activeBugs: 0,
    newBugs: 0
  });

  // Fetch runs on mount and after execution
  const fetchRuns = async () => {
    try {
      const res = await fetch('/api/runs');
      const data = await res.json();

      const totalRuns = data.length;
      const latestRun = data[0] || {};
      const previousRun = data[1] || {};

      // If the latest run is still 'RUNNING', update the runningSuite state
      if (latestRun.status === 'RUNNING') {
        setRunningSuite(latestRun.suite_name);
      } else {
        setRunningSuite(null);
      }

      const activeBugs = latestRun.failed_tests || 0;

      // New Bugs calculation: latest failed - previous failed, min 0
      let newBugs = 0;
      if (totalRuns > 1) {
        newBugs = Math.max(0, (latestRun.failed_tests || 0) - (previousRun.failed_tests || 0));
      } else {
        newBugs = activeBugs;
      }

      setStats({
        totalRuns,
        latestStatus: latestRun.status || 'N/A',
        activeBugs,
        newBugs
      });

      setRunsList(data.map(run => ({
        rawId: run.id,
        id: `#${run.id}`,
        suite: run.suite_name,
        environment: run.environment,
        total: run.total_tests || 0,
        passed: run.passed_tests || 0,
        failed: run.failed_tests || 0,
        status: run.status,
        duration: `${run.duration_ms || 0}ms`,
        executedOn: new Date(run.executed_at).toLocaleString(),
        report_url: run.report_url
      })));
    } catch (e) {
      console.error('Failed to fetch runs', e);
    }
  };

  // Poll for status updates while running
  useEffect(() => {
    if (isAuthenticated) {
      fetchRuns();
      const interval = setInterval(fetchRuns, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Apply Settings to DOM
  useEffect(() => {
    const body = document.body;
    
    // 1. Theme Application
    if (settings.theme === 'dark') {
      body.classList.add('theme-dark');
    } else {
      body.classList.remove('theme-dark');
    }

    // 2. Background Style Application
    body.classList.remove('bg-gradient', 'bg-image');
    if (settings.backgroundStyle === 'gradient') {
      body.classList.add('bg-gradient');
    } else if (settings.backgroundStyle === 'image') {
      body.classList.add('bg-image');
    }

    // 3. Primary Color Application
    const colorMap = {
      blue: '#2563eb',
      purple: '#8b5cf6',
      green: '#10b981',
      orange: '#f59e0b',
      pink: '#ec4899',
      cyan: '#06b6d4',
      slate: '#475569'
    };
    const selectedColor = colorMap[settings.primaryColor] || colorMap.blue;
    document.documentElement.style.setProperty('--color-primary', selectedColor);
    
    // Dynamically compute a light version of the primary color for backgrounds
    // Using a simple HEX to RGBA conversion for 12% opacity
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    const rgb = hexToRgb(selectedColor);
    const lightColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.12)` : 'rgba(37, 99, 235, 0.12)';
    document.documentElement.style.setProperty('--color-primary-light', lightColor);
  }, [settings]);

  // Slide-in Notifications Toast
  useEffect(() => {

    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleRunSuite = async (suiteName, suiteFiles) => {
    setRunningSuite(suiteName);
    setToast({
      message: `Triggered ${suiteName} execution...`,
      type: 'info'
    });

    try {
      await fetch('/api/runs/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suiteName, suiteFiles })
      });
      // No need to await fetchRuns here, polling will catch the update
      setToast({ message: `${suiteName} started in background.`, type: 'success' });
    } catch (e) {
      setToast({ message: `Failed to start execution.`, type: 'error' });
      setRunningSuite(null);
    }
  };

  const handleSaveSettings = (newSettings) => {
    console.log('Settings stored:', newSettings);
    setSettings(newSettings);
    setToast({
      message: 'Dashboard preferences saved successfully!',
      type: 'success'
    });
  };

  // Router layout switches
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <>
            <ExecuteSuites runningSuite={runningSuite} onRunSuite={handleRunSuite} />
            <StatsRow stats={stats} />
            <ChartsSection runsList={runsList} />
            <RecentRuns runsList={runsList} onViewAll={() => setActivePage('runs')} />
          </>
        );
      case 'runs':
        return <TestRunsPage runsList={runsList} />;
      case 'suites':
        return <TestSuitesPage runsList={runsList} onRunSuite={handleRunSuite} runningSuite={runningSuite} />;
      case 'reports':
        return <ReportsPage runsList={runsList} />;
      case 'history':
        return <HistoryPage runsList={runsList} />;
      case 'analytics':
        return <AnalyticsPage runsList={runsList} />;
      case 'settings':
        return <SettingsPage settings={settings} onSaveSettings={handleSaveSettings} />;
      default:
        // Placeholder for unimplemented features
        return (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem', gap: '1rem', flex: 1 }}>
            <Construction size={48} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: '1.5rem' }}>Page Under Construction</h2>
            <p style={{ color: 'var(--text-secondary)' }}>The {activePage} page is currently in development.</p>
            <button className="btn-primary" onClick={() => setActivePage('dashboard')}>
              Go Back Dashboard
            </button>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        activePage={activePage} 
        onSelectPage={setActivePage} 
        sidebarStyle={settings.sidebarStyle}
        onLogout={handleLogout}
      />

      {/* Main Panel Content Container */}
      <main className="main-content">
        {/* Page Header (except in settings/custom pages where headers are local) */}
        {activePage !== 'settings' && activePage !== 'runs' && activePage !== 'suites' && activePage !== 'reports' && activePage !== 'history' && activePage !== 'analytics' && (
          <Header />
        )}
        
        {renderPage()}
      </main>

      {/* Slide-in Notifications Toast */}
      {toast && (
        <div className="toast-notification">
          {toast.type === 'success' && <CheckCircle size={18} style={{ color: 'var(--color-green)' }} />}
          {toast.type === 'error' && <AlertTriangle size={18} style={{ color: 'var(--color-red)' }} />}
          {toast.type === 'info' && <span className="spinning-loader" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}></span>}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}