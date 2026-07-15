import React, { useState } from 'react';
import { FileText, MoreVertical, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TestRunsPage({ runsList }) {
  const [suiteFilter, setSuiteFilter] = useState('All Suites');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [envFilter, setEnvFilter] = useState('All Environments');

  // Filter logic
  const filteredRuns = runsList.filter(run => {
    const matchSuite = suiteFilter === 'All Suites' || run.suite === suiteFilter;
    const matchStatus = statusFilter === 'All Status' || run.status === statusFilter;
    const matchEnv = envFilter === 'All Environments' || run.environment === envFilter;
    return matchSuite && matchStatus && matchEnv;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      {/* Header */}
      <div className="header-container" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <div className="header-title-area">
          <h1>Test Runs</h1>
          <p>View and manage all test runs</p>
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
              <option>Regression Suite</option>
              <option>Smoke Tests</option>
              <option>Sanity Tests</option>
              <option>Full Suite</option>
              <option>API Tests</option>
            </select>

            <select 
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>PASSED</option>
              <option>FAILED</option>
              <option>RUNNING</option>
            </select>

            <select 
              className="form-control"
              value={envFilter}
              onChange={(e) => setEnvFilter(e.target.value)}
            >
              <option>All Environments</option>
              <option>QA</option>
              <option>Staging</option>
              <option>Production</option>
            </select>

            <input 
              type="text" 
              className="form-control" 
              value="16 May 2025 - 22 May 2025" 
              readOnly 
              style={{ width: '220px', cursor: 'default' }}
            />
          </div>

          <button className="btn-outline">
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Runs Table Card */}
      <div className="card table-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="table-wrapper" style={{ flex: 1 }}>
          <table className="runs-table">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Suite</th>
                <th>Environment</th>
                <th>Status</th>
                <th>Total</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Duration</th>
                <th>Executed On</th>
                <th>Report</th>
                <th style={{ width: '40px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.map((run) => (
                <tr key={run.id}>
                  <td className="run-id">{run.id}</td>
                  <td className="suite-cell">{run.suite}</td>
                  <td>{run.environment}</td>
                  <td>
                    <span className={`status-badge ${run.status.toLowerCase()}`}>
                      {run.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{run.total}</td>
                  <td style={{ color: 'var(--color-green)', fontWeight: 600 }}>{run.passed}</td>
                  <td style={{ color: run.failed > 0 ? 'var(--color-red)' : 'var(--text-secondary)', fontWeight: 600 }}>
                    {run.failed}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{(parseFloat(run.duration) / 1000).toFixed(2)}s</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{run.executedOn}</td>
                  <td>
                    {run.report_url && run.status === 'PASSED' ? (
                      <a 
                        href={run.report_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-report"
                      >
                        <FileText size={14} />
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>-</span>
                    )}
                  </td>
                  <td>
                    <button 
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      onClick={() => console.log('More options clicked for', run.id)}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRuns.length === 0 && (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No test runs found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination-container">
          <div>
            Showing 1 to {filteredRuns.length} of {filteredRuns.length} results
          </div>
          <div className="pagination-pages">
            <button className="pagination-btn"><ChevronLeft size={14} /></button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">2</button>
            <button className="pagination-btn">3</button>
            <span className="pagination-ellipsis">...</span>
            <button className="pagination-btn">19</button>
            <button className="pagination-btn"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
