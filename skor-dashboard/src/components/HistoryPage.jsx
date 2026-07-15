import React, { useState } from 'react';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HistoryPage({ runsList }) {
  const [suiteFilter, setSuiteFilter] = useState('All Suites');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filteredRuns = runsList.filter(run => {
    const matchSuite = suiteFilter === 'All Suites' || run.suite === suiteFilter;
    const matchStatus = statusFilter === 'All Status' || run.status === statusFilter;
    return matchSuite && matchStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      {/* Header */}
      <div className="header-container" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <div className="header-title-area">
          <h1>History</h1>
          <p>View historical test execution data</p>
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

            <select 
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Status</option>
              <option>PASSED</option>
              <option>FAILED</option>
            </select>
          </div>

          {/* <button className="btn-outline">
            <Download size={14} />
            <span>Export</span>
          </button> */}
        </div>
      </div>

      {/* History Table Card */}
      <div className="card table-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="table-wrapper" style={{ flex: 1 }}>
          <table className="runs-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Suite</th>
                <th>Total Tests</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Pass %</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.map((run, idx) => {
                const total = run.total || 0;
                const passed = run.passed || 0;
                const percentage = total > 0 ? ((passed / total) * 100).toFixed(2) : 0;
                const durationSeconds = (parseFloat(run.duration) / 1000).toFixed(2) + 's';
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{run.executedOn}</td>
                    <td>{run.suite}</td>
                    <td style={{ fontWeight: 500 }}>{total}</td>
                    <td style={{ color: 'var(--color-green)', fontWeight: 600 }}>{passed}</td>
                    <td style={{ color: run.failed > 0 ? 'var(--color-red)' : 'var(--text-secondary)', fontWeight: 600 }}>{run.failed}</td>
                    <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{percentage}%</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{durationSeconds}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
