import React, { useState } from 'react';
import { Eye, Search, Mail, TrendingUp, Loader2 } from 'lucide-react';

export default function ReportsPage({ runsList }) {
  const [suiteFilter, setSuiteFilter] = useState('All Suites');
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingRunId, setSendingRunId] = useState(null);

  const handleEmailReport = async (runId) => {
    if (!window.confirm("Are you sure you want to email this Allure report to anil@sko.co?")) return;
    
    setSendingRunId(runId);
    try {
      const response = await fetch(`http://localhost:3001/api/reports/${runId}/email`, { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        alert('✓ Report emailed successfully.');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      alert('⚠ Failed to send report: ' + err.message);
    } finally {
      setSendingRunId(null);
    }
  };

  // Filtering
  const filteredReports = runsList.filter(rep => {
    const matchSuite = suiteFilter === 'All Suites' || rep.suite === suiteFilter;
    const matchSearch = rep.suite.toLowerCase().includes(searchQuery.toLowerCase()) || rep.id.includes(searchQuery);
    return matchSuite && matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="header-container" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <div className="header-title-area">
          <h1>Reports</h1>
          <p>View test execution reports</p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card" style={{ padding: '1rem 1.5rem' }}>
        <div className="filter-row" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
          <div className="filter-left">
            <select 
              className="form-control"
              value={suiteFilter}
              onChange={(e) => setSuiteFilter(e.target.value)}
            >
              <option>All Suites</option>
              {Array.from(new Set(runsList.map(r => r.suite))).map(suite => <option key={suite}>{suite}</option>)}
            </select>

            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by Suite Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Reports Grid Layout */}
      <div className="reports-grid">
        {filteredReports.map((rep) => {
          const total = rep.total || 0;
          const passed = rep.passed || 0;
          const percentage = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;
          const durationSeconds = (parseFloat(rep.duration) / 1000).toFixed(2) + 's';

          return (
            <div key={rep.id} className="card report-card">
              <div className="report-card-header">
                <div className="report-card-title">
                  <h4>{rep.suite}</h4>
                  <div className="report-card-subtitle">{rep.id} • {rep.executedOn}</div>
                </div>
                <span className={`status-badge ${rep.status.toLowerCase()}`}>
                  {rep.status}
                </span>
              </div>

              <div className="report-card-stats">
                <div className="report-stat-row">
                  <span className="report-stat-label">Total Tests</span>
                  <span className="report-stat-val">{total}</span>
                </div>
                <div className="report-stat-row">
                  <span className="report-stat-label">Duration</span>
                  <span className="report-stat-val" style={{ color: 'var(--text-secondary)' }}>{durationSeconds}</span>
                </div>
                <div className="report-stat-row">
                  <span className="report-stat-label">Passed</span>
                  <span className="report-stat-val" style={{ color: 'var(--color-green)' }}>{passed}</span>
                </div>
                <div className="report-stat-row">
                  <span className="report-stat-label">Failed</span>
                  <span className="report-stat-val" style={{ color: rep.failed > 0 ? 'var(--color-red)' : 'var(--text-secondary)' }}>{rep.failed}</span>
                </div>
                <div className="report-stat-row" style={{ gridColumn: 'span 2', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                  <span className="report-stat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <TrendingUp size={14} color={percentage >= 95 ? 'var(--color-green)' : 'var(--color-primary)'} />
                    Pass Percentage
                  </span>
                  <span className="report-stat-val" style={{ color: percentage >= 95 ? 'var(--color-green)' : 'var(--color-primary)' }}>{percentage}%</span>
                </div>
              </div>

              <div className="report-card-footer">
                {rep.status === 'PASSED' ? (
                  <>
                    <a 
                      href={rep.report_url}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      <Eye size={14} />
                      <span>View Report</span>
                    </a>
                    <button 
                      className="btn-outline" 
                      style={{ justifyContent: 'center', backgroundColor: 'var(--bg-secondary)' }} 
                      onClick={() => handleEmailReport(rep.rawId || rep.id.replace('#', ''))}
                      disabled={sendingRunId === (rep.rawId || rep.id.replace('#', ''))}
                    >
                      {sendingRunId === (rep.rawId || rep.id.replace('#', '')) ? <Loader2 size={14} className="spinning-loader" /> : <Mail size={14} />}
                      <span>{sendingRunId === (rep.rawId || rep.id.replace('#', '')) ? 'Sending...' : 'Email Report'}</span>
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', width: '100%' }}>
                    No report available for this execution.
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {filteredReports.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          No reports found matching filters.
        </div>
      )}
    </div>
  );
}
