import React, { useEffect, useState } from 'react';
import { FileText, ClipboardList, Sliders, Calendar, TrendingDown } from 'lucide-react';

export default function RightColumn() {
  const [failingTests, setFailingTests] = useState([]);

  useEffect(() => {
    fetch('/api/reports/top-failing')
      .then(r => r.json())
      .then(data => setFailingTests(data || []))
      .catch(() => {});
  }, []);

  const quickLinks = [
    { icon: FileText,      label: 'All Reports' },
    { icon: ClipboardList, label: 'Test Cases'  },
    { icon: Sliders,       label: 'Config'      },
    { icon: Calendar,      label: 'Schedules'   }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '280px', flexShrink: 0 }}>

      {/* Top Failing Tests */}
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--border-color)',
        borderRadius: '12px', padding: '1.25rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <TrendingDown size={16} color="#ef4444" />
          <h3 style={{ fontWeight: '700', fontSize: '0.95rem' }}>Top Failing Tests</h3>
        </div>
        {failingTests.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No failures recorded yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {failingTests.map((t, i) => (
              <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: i < failingTests.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <span style={{
                  fontSize: '0.8rem', color: 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  maxWidth: '170px'
                }} title={t.name}>
                  {t.name}
                </span>
                <span style={{
                  background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                  borderRadius: '4px', padding: '0.15rem 0.4rem',
                  fontSize: '0.75rem', fontWeight: '700', flexShrink: 0
                }}>
                  {t.fail_count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick Links */}
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--border-color)',
        borderRadius: '12px', padding: '1.25rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.75rem' }}>Quick Links</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {quickLinks.map(({ icon: Icon, label }) => (
            <button key={label} style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              borderRadius: '8px', padding: '0.6rem 0.75rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-secondary)',
              cursor: 'pointer', transition: 'all 0.15s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
