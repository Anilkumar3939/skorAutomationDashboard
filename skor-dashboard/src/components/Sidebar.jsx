import React from 'react';
import { 
  LayoutDashboard, 
  Play, 
  Layers, 
  FileText, 
  History, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronDown
} from 'lucide-react';

export default function Sidebar({ activePage, onSelectPage, sidebarStyle, onLogout }) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'runs', icon: Play, label: 'Test Runs' },
    { id: 'suites', icon: Layers, label: 'Test Suites' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <aside className={`sidebar ${sidebarStyle === 'light' ? 'sidebar-light' : ''}`}>
      <div>
        <div className="sidebar-logo">
          <div className="logo-icon">S</div>
          <div className="logo-text">
            SKOR
            <span>Testing Dashboard</span>
          </div>
        </div>
        
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activePage === item.id;
            return (
              <li key={item.id}>
                <a 
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    onSelectPage(item.id);
                    // No extra logic needed, App.jsx handles rendering based on activePage
                  }}
                >

                  <IconComponent size={20} />
                  <span>{item.label}</span>
                </a>
              </li>
            );
          })}
          <li>
            <a className="sidebar-item" onClick={onLogout} style={{ marginTop: '2rem', cursor: 'pointer' }}>
              <LogOut size={20} />
              <span>Logout</span>
            </a>
          </li>
        </ul>
      </div>
      {/* ... footer */}

      <div className="sidebar-footer">
        <div className="env-selector">
          <div className="env-info">
            <div className="env-label">Environment</div>
            <div className="env-value">QA Environment</div>
          </div>
          <ChevronDown size={16} />
        </div>
      </div>
    </aside>
  );
}
