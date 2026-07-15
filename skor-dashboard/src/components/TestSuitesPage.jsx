import React from 'react';
import { Play, ShieldCheck, Bug, Layers, Zap } from 'lucide-react';

export default function TestSuitesPage({ runsList, onRunSuite, runningSuite }) {
  const suiteDefinitions = [
    { id: 'regression', name: 'Regression Testing', desc: 'Full system regression', icon: ShieldCheck },
    { id: 'smoke', name: 'Smoke Tests', desc: 'Critical path validation', icon: Zap },
    { id: 'sanity', name: 'Sanity Tests', desc: 'Basic sanity check', icon: Layers },
    { id: 'api', name: 'API Tests', desc: 'Backend endpoint tests', icon: Bug },
    { id: 'full', name: 'Full Suite', desc: 'Everything combined', icon: Play }
  ];

  const suiteFilesMap = {
    'Regression Testing': [
      'test_registration_login.py',
      'test_otp.py',
      'test_onboarding.py',
      'test_pre_uw_loading.py',
      'test_pre_approved.py',
      'test_verify_email.py',
      'test_onboarding_extended.py',
      'test_delivery_page.py'
    ],
    'Full Suite': [
      'test_registration_login.py',
      'test_otp.py',
      'test_onboarding.py',
      'test_pre_uw_loading.py',
      'test_pre_approved.py',
      'test_verify_email.py',
      'test_onboarding_extended.py',
      'test_delivery_page.py'
    ],
    'Smoke Tests': [],
    'Sanity Tests': [],
    'API Tests': []
  };

  // Helper to get latest run for a suite
  const getLatestRun = (suiteName) => {
    return runsList.find(r => r.suite === suiteName) || {};
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Test Suites</h1>
      
      <div className="card" style={{ padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem 0' }}>Icon</th>
              <th style={{ padding: '0.75rem 0' }}>Suite Name</th>
              <th style={{ padding: '0.75rem 0' }}>Description</th>
              <th style={{ padding: '0.75rem 0' }}>Environment</th>
              <th style={{ padding: '0.75rem 0' }}>Last Execution</th>
              <th style={{ padding: '0.75rem 0' }}>Status</th>
              <th style={{ padding: '0.75rem 0' }}>Action</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.9rem' }}>
            {suiteDefinitions.map((def, idx) => {
              const run = getLatestRun(def.name);
              const IconComponent = def.icon;
              const isDisabled = !!runningSuite || (suiteFilesMap[def.name] || []).length === 0;
              return (
                <tr key={idx} style={{ borderTop: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem 0' }}><IconComponent size={20} style={{ color: 'var(--color-primary)' }} /></td>
                  <td style={{ padding: '0.75rem 0', fontWeight: '500' }}>{def.name}</td>
                  <td style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>{def.desc}</td>
                  <td style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>{run.environment || '-'}</td>
                  <td style={{ padding: '0.75rem 0', color: 'var(--text-secondary)' }}>{run.executedOn || 'Never'}</td>
                  <td style={{ padding: '0.75rem 0' }}>
                    {run.status ? (
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem', 
                        fontWeight: '500',
                        backgroundColor: run.status === 'Passed' ? 'var(--color-green-light)' : 'var(--color-red-light)',
                        color: run.status === 'Passed' ? 'var(--color-green)' : 'var(--color-red)'
                      }}>
                        {run.status}
                      </span>
                    ) : '-'}
                  </td>
                  <td style={{ padding: '0.75rem 0', display: 'flex', gap: '0.5rem' }}>
                    <button 
                      disabled={isDisabled}
                      onClick={() => onRunSuite(def.name, suiteFilesMap[def.name] || [])}
                      style={{ 
                        backgroundColor: isDisabled ? 'var(--text-muted)' : 'var(--color-primary)', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.6 : 1
                      }}>{runningSuite === def.name ? 'Running...' : 'Run'}</button>
                    {run.report_url && (
                      <a 
                        href={run.report_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          color: 'var(--color-primary)', 
                          border: '1px solid var(--color-primary)', 
                          background: 'none', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px',
                          cursor: 'pointer',
                          textDecoration: 'none',
                          fontSize: '0.9rem'
                        }}>Report</a>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
