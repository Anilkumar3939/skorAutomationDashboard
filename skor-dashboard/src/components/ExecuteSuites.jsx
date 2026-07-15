import React from 'react';
import { ShieldCheck, Flame, CheckCircle, Code, Layers } from 'lucide-react';

export default function ExecuteSuites({ runningSuite, onRunSuite }) {
  const suites = [
    { name: 'Regression Testing', desc: 'Full system regression', icon: ShieldCheck },
    { name: 'Smoke Tests', desc: 'Critical path tests', icon: Flame },
    { name: 'Sanity Tests', desc: 'Quick health checks', icon: CheckCircle },
    { name: 'API Tests', desc: 'Verify API endpoints', icon: Code },
    { name: 'Full Suite', desc: 'Execute everything', icon: Layers }
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
    'Full Suite': [],
    'Smoke Tests': [],
    'Sanity Tests': [],
    'API Tests': []
  };

  return (
    <section className="suite-runner-section">
      <h3>Execute Test Suites</h3>
      <div className="suite-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {suites.map((suite, idx) => (
          <div key={idx} className="card" style={{ 
            padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', 
            transition: 'all 0.3s ease', border: '1px solid var(--border-color)', borderRadius: '12px'
          }} onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
          }} onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          }}>
            <div style={{ color: 'var(--color-primary)' }}><suite.icon size={32} /></div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{suite.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{suite.desc}</div>
            </div>
            <button 
              className="btn-primary" 
              disabled={!!runningSuite || (suiteFilesMap[suite.name] || []).length === 0}
              onClick={() => onRunSuite(suite.name, suiteFilesMap[suite.name] || [])}
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                whiteSpace: 'nowrap',
                opacity: (runningSuite || (suiteFilesMap[suite.name] || []).length === 0) ? 0.5 : 1,
                cursor: (runningSuite || (suiteFilesMap[suite.name] || []).length === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              {runningSuite === suite.name ? 'Running...' : 'Run Suite'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
