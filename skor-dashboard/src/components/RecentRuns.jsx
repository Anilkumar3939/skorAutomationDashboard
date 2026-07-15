import React, { useState } from 'react';
import { FileText, ChevronRight, X, AlertCircle, CheckCircle2, Clock, Image } from 'lucide-react';

function StatusBadge({ status }) {
  const s = (status || '').toUpperCase();
  const map = {
    PASSED:  { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', label: 'PASSED'  },
    FAILED:  { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', label: 'FAILED'  },
    RUNNING: { bg: 'rgba(37,99,235,0.12)',   color: '#2563eb', label: 'RUNNING' },
    BROKEN:  { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', label: 'BROKEN'  },
    SKIPPED: { bg: 'rgba(100,116,139,0.12)', color: '#64748b', label: 'SKIPPED' },
  };
  const style = map[s] || map.FAILED;
  return (
    <span style={{ background: style.bg, color: style.color, borderRadius: '6px', padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.3px' }}>
      {style.label}
    </span>
  );
}

function RunDetailsModal({ runId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  React.useEffect(() => {
    fetch(`/api/runs/${runId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [runId]);

  const filtered = data?.cases?.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'passed') return c.status === 'passed';
    return c.status !== 'passed';
  }) || [];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--card-bg)', borderRadius: '16px',
        width: '100%', maxWidth: '860px', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
        border: '1px solid var(--border-color)'
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
              {loading ? 'Loading...' : `Run #${data?.run?.id} — ${data?.run?.suite_name}`}
            </div>
            {data?.run && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {new Date(data.run.executed_at).toLocaleString()} · {data.run.environment}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {data?.run && <StatusBadge status={data.run.status} />}
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Stats strip */}
        {data?.run && (
          <div style={{ display: 'flex', gap: '2rem', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
            {[
              { label: 'Total', value: data.run.total_tests, color: 'var(--text-primary)' },
              { label: 'Passed', value: data.run.passed_tests, color: '#10b981' },
              { label: 'Failed', value: data.run.failed_tests, color: '#ef4444' },
              { label: 'Duration', value: `${Math.round((data.run.duration_ms || 0) / 1000)}s`, color: 'var(--text-secondary)' }
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: s.color }}>{s.value ?? 0}</span>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          {['all', 'passed', 'failed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '0.3rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600',
              border: 'none', cursor: 'pointer',
              background: filter === f ? 'var(--color-primary)' : 'var(--bg-secondary)',
              color: filter === f ? 'white' : 'var(--text-secondary)',
              textTransform: 'capitalize'
            }}>{f}</button>
          ))}
        </div>

        {/* Test Cases List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
          {loading && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading test cases...</div>}
          {!loading && filtered.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No test cases found.</div>}
          {filtered.map(tc => {
            const isExp = expanded === tc.uuid;
            const isFail = tc.status !== 'passed';
            return (
              <div key={tc.uuid} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div
                  onClick={() => setExpanded(isExp ? null : tc.uuid)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.7rem 1.5rem', cursor: isFail ? 'pointer' : 'default',
                    background: isExp ? 'var(--bg-secondary)' : 'transparent',
                    transition: 'background 0.15s'
                  }}
                >
                  {isFail ? <AlertCircle size={16} color="#ef4444" /> : <CheckCircle2 size={16} color="#10b981" />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '500', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {tc.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tc.full_name}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Clock size={12} />{Math.round((tc.duration_ms || 0) / 1000)}s
                    </span>
                    <StatusBadge status={tc.status} />
                    {isFail && <ChevronRight size={14} color="var(--text-muted)" style={{ transform: isExp ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />}
                  </div>
                </div>

                {/* Expanded failure details */}
                {isExp && (
                  <div style={{ padding: '1rem 1.5rem 1rem 3rem', background: 'var(--bg-secondary)', borderTop: '1px dashed var(--border-color)' }}>
                    {tc.error_message && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ef4444', marginBottom: '0.25rem' }}>ERROR MESSAGE</div>
                        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.82rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                          {tc.error_message}
                        </div>
                      </div>
                    )}
                    {tc.error_trace && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>STACK TRACE</div>
                        <pre style={{ background: '#0f172a', color: '#94a3b8', borderRadius: '8px', padding: '0.75rem', fontSize: '0.75rem', overflowX: 'auto', maxHeight: '200px', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                          {tc.error_trace}
                        </pre>
                      </div>
                    )}
                    {tc.screenshots?.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Image size={12} /> FAILURE SCREENSHOT
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          {tc.screenshots.map((src, i) => (
                            <img
                              key={i}
                              src={src}
                              alt="Failure screenshot"
                              style={{ height: '180px', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer', objectFit: 'contain', background: '#000' }}
                              onClick={() => window.open(src, '_blank')}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {!tc.error_message && !tc.error_trace && !tc.screenshots?.length && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No additional details available.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function RecentRuns({ runsList, onViewAll }) {
  const [selectedRunId, setSelectedRunId] = useState(null);
  const recent = runsList.slice(0, 4);
  return (
    <div style={{ width: '100%' }}>
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '1.25rem' }}>Recent Test Runs</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {['Suite', 'Env', 'Status', 'Started At', 'Duration', 'Total', 'Bugs', 'Report'].map(h => (
                <th key={h} style={{ padding: '1rem 0.5rem', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.map((run, idx) => (
              <tr key={run.id} style={{ 
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--bg-secondary)',
                transition: 'background 0.2s'
              }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'}
                 onMouseOut={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'transparent' : 'var(--bg-secondary)'}>
                <td style={{ padding: '1rem 0.5rem', fontWeight: '600' }}>{run.suite}</td>
                <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{run.environment}</td>
                <td style={{ padding: '1rem 0.5rem' }}><StatusBadge status={run.status} /></td>
                <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{run.executedOn}</td>
                <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>{(parseFloat(run.duration) / 1000).toFixed(2)}s</td>
                <td style={{ padding: '1rem 0.5rem' }}>{run.total}</td>
                <td style={{ padding: '1rem 0.5rem', color: run.failed > 0 ? '#ef4444' : 'var(--text-secondary)' }}>{run.failed}</td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  {run.status === 'PASSED' ? (
                    <button
                      onClick={() => setSelectedRunId(run.rawId)}
                      style={{
                        background: 'var(--color-primary)', color: 'white', border: 'none',
                        borderRadius: '6px', padding: '0.4rem 0.8rem',
                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600'
                      }}
                    >
                      View Report
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedRunId != null && (
        <RunDetailsModal runId={selectedRunId} onClose={() => setSelectedRunId(null)} />
      )}
    </div>
  );
}
