import React, { useState } from 'react';
import { Sun, Moon, Layout, HelpCircle } from 'lucide-react';

export default function SettingsPage({ settings, onSaveSettings }) {
  const [activeTab, setActiveTab] = useState('Appearance');
  const [theme, setTheme] = useState(settings.theme);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [backgroundStyle, setBackgroundStyle] = useState(settings.backgroundStyle);
  const [sidebarStyle, setSidebarStyle] = useState(settings.sidebarStyle);

  const colors = [
    { id: 'blue', hex: '#2563eb' },
    { id: 'purple', hex: '#8b5cf6' },
    { id: 'green', hex: '#10b981' },
    { id: 'orange', hex: '#f59e0b' },
    { id: 'pink', hex: '#ec4899' },
    { id: 'cyan', hex: '#06b6d4' },
    { id: 'slate', hex: '#475569' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings({
      theme,
      primaryColor,
      backgroundStyle,
      sidebarStyle
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="header-container" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <div className="header-title-area">
          <h1>Settings</h1>
          <p>Manage your dashboard preferences</p>
        </div>
      </div>

      <div className="settings-layout">
        {/* Left Side Tab Menu */}
        <div className="card" style={{ padding: '0.75rem' }}>
          <ul className="settings-sidebar">
            <li 
              className={`settings-sidebar-item ${activeTab === 'Appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('Appearance')}
            >
              <Layout size={16} />
              <span>Appearance</span>
            </li>
            <li 
              className={`settings-sidebar-item ${activeTab === 'Theme' ? 'active' : ''}`}
              onClick={() => setActiveTab('Theme')}
            >
              <Sun size={16} />
              <span>Theme Options</span>
            </li>
            <li 
              className={`settings-sidebar-item ${activeTab === 'System' ? 'active' : ''}`}
              onClick={() => setActiveTab('System')}
            >
              <HelpCircle size={16} />
              <span>Backgrounds</span>
            </li>
          </ul>
        </div>

        {/* Right Side Settings Options Form */}
        <form onSubmit={handleSubmit} className="card settings-content-card">
          {/* Section 1: Theme Style */}
          <div className="settings-section">
            <div className="settings-section-title">Theme Styles</div>
            <div className="settings-section-desc">Choose your preferred theme for the dashboard</div>
            
            <div className="theme-options-grid">
              <div 
                className={`theme-card-option ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <div className="theme-radio-circle">
                  <div className="theme-radio-dot"></div>
                </div>
                <Sun size={16} />
                <span>Light</span>
              </div>

              <div 
                className={`theme-card-option ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <div className="theme-radio-circle">
                  <div className="theme-radio-dot"></div>
                </div>
                <Moon size={16} />
                <span>Dark</span>
              </div>
            </div>
          </div>

          {/* Section 2: Primary Color */}
          <div className="settings-section">
            <div className="settings-section-title">Primary Color</div>
            <div className="settings-section-desc">Choose the primary color for the dashboard elements</div>
            
            <div className="color-picker-row">
              {colors.map((color) => (
                <div 
                  key={color.id}
                  className={`color-circle ${primaryColor === color.id ? 'active' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => setPrimaryColor(color.id)}
                  title={color.id}
                />
              ))}
            </div>
          </div>

          {/* Section 3: Background Style */}
          <div className="settings-section">
            <div className="settings-section-title">Background Style</div>
            <div className="settings-section-desc">Choose the background style of the dashboard</div>
            
            <div className="theme-options-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div 
                className={`theme-card-option ${backgroundStyle === 'default' ? 'active' : ''}`}
                onClick={() => setBackgroundStyle('default')}
              >
                <div className="theme-radio-circle">
                  <div className="theme-radio-dot"></div>
                </div>
                <span>Default</span>
              </div>

              <div 
                className={`theme-card-option ${backgroundStyle === 'gradient' ? 'active' : ''}`}
                onClick={() => setBackgroundStyle('gradient')}
              >
                <div className="theme-radio-circle">
                  <div className="theme-radio-dot"></div>
                </div>
                <span>Gradient</span>
              </div>

              <div 
                className={`theme-card-option ${backgroundStyle === 'image' ? 'active' : ''}`}
                onClick={() => setBackgroundStyle('image')}
              >
                <div className="theme-radio-circle">
                  <div className="theme-radio-dot"></div>
                </div>
                <span>Patterned Grid</span>
              </div>
            </div>
          </div>

          {/* Section 4: Sidebar Style */}
          <div className="settings-section">
            <div className="settings-section-title">Sidebar Style</div>
            <div className="settings-section-desc">Choose sidebar appearance</div>
            
            <div className="theme-options-grid">
              <div 
                className={`theme-card-option ${sidebarStyle === 'dark' ? 'active' : ''}`}
                onClick={() => setSidebarStyle('dark')}
              >
                <div className="theme-radio-circle">
                  <div className="theme-radio-dot"></div>
                </div>
                <span>Dark</span>
              </div>

              <div 
                className={`theme-card-option ${sidebarStyle === 'light' ? 'active' : ''}`}
                onClick={() => setSidebarStyle('light')}
              >
                <div className="theme-radio-circle">
                  <div className="theme-radio-dot"></div>
                </div>
                <span>Light</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div>
            <button type="submit" className="btn-primary" style={{ padding: '0.65rem 2rem' }}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
