import React from 'react';
import { History, CheckCircle, Bug, AlertTriangle } from 'lucide-react';

export default function StatsRow({ stats }) {
  const cards = [
    { title: 'Total Test Runs', value: stats.totalRuns.toLocaleString(), icon: History, color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
    { title: 'Latest Run Status', value: stats.latestStatus, icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { title: 'Active Bugs', value: stats.activeBugs.toLocaleString(), icon: Bug, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { title: 'New Bugs', value: stats.newBugs.toLocaleString(), icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
      {cards.map((card, idx) => (
        <div key={idx} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            backgroundColor: card.bg, color: card.color, padding: '0.75rem', borderRadius: '10px' 
          }}><card.icon size={28} /></div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{card.title}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '800', lineHeight: 1 }}>{card.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
