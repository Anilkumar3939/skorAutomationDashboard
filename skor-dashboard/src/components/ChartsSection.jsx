import React, { useState } from 'react';

export default function ChartsSection({ runsList }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Get last 7 days of runs, sorted by date
  const last7Days = runsList
    .slice(-7)
    .sort((a, b) => new Date(a.executedOn) - new Date(b.executedOn));

  const dates = last7Days.map(run => new Date(run.executedOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  const passedTrend = last7Days.map(run => run.passed);
  const failedTrend = last7Days.map(run => run.failed);
  const percentTrend = last7Days.map(run => (run.total_tests > 0 ? (run.passed / run.total_tests) * 100 : 0));

  // SVG size: width=460, height=140. Margins: left=40, right=20, top=10, bottom=20
  const trendX = (index) => 40 + index * (400 / Math.max(1, last7Days.length - 1));
  const trendY = (val, maxVal = Math.max(...passedTrend, ...failedTrend, 1)) => 120 - (val / maxVal) * 100;
  
  const percentY = (val) => 120 - (val / 100) * 100;

  // Generate SVG path for Trend
  const getLinePath = (data, isPercent = false) => {
    return data.map((val, idx) => {
      const x = trendX(idx);
      const y = isPercent ? percentY(val) : trendY(val);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // Generate SVG Area path
  const getAreaPath = (data, isPercent = false) => {
    const linePath = getLinePath(data, isPercent);
    if (!linePath) return '';
    const firstX = trendX(0);
    const lastX = trendX(data.length - 1);
    const baselineY = 120;
    return `${linePath} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;
  };

  // Donut calculations
  const latestRun = runsList[0] || { passed: 0, failed: 0, total: 0 };
  const total = latestRun.total_tests;
  const passedPct = total > 0 ? ((latestRun.passed / total) * 100).toFixed(2) : 0;
  const failedPct = total > 0 ? ((latestRun.failed / total) * 100).toFixed(2) : 0;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const passedStrokeDash = (latestRun.passed / (total || 1)) * circumference;
  const failedStrokeDash = (latestRun.failed / (total || 1)) * circumference;

  return (
    <div className="charts-grid">
      {/* 1. Test Results Overview */}
      <div className="card chart-card">
        <div className="chart-header">
          <span className="chart-title">Latest Run Overview</span>
        </div>
        <div className="chart-content">
          <div className="donut-container">
            <div className="donut-svg-wrapper">
              <svg width="130" height="130" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--color-green)" strokeWidth="10" strokeDasharray={`${passedStrokeDash} ${circumference}`} transform="rotate(-90 50 50)" strokeLinecap="round" />
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke="var(--color-red)" strokeWidth="10" strokeDasharray={`${failedStrokeDash} ${circumference}`} strokeDashoffset={`-${passedStrokeDash}`} transform="rotate(-90 50 50)" strokeLinecap="round" />
              </svg>
              <div className="donut-label-center">
                <div className="donut-value-center">{passedPct}%</div>
              </div>
            </div>

            <div className="donut-legend">
              <div className="legend-item">
                <span className="legend-color passed"></span>
                <span className="legend-text">Passed ({latestRun.passed})</span>
              </div>
              <div className="legend-item">
                <span className="legend-color failed"></span>
                <span className="legend-text">Failed ({latestRun.failed})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Test Results Trend */}
      <div className="card chart-card">
        <div className="chart-header">
          <span className="chart-title">Execution Trend</span>
        </div>
        <div className="chart-content">
          <svg className="trend-chart-wrapper" viewBox="0 0 460 140">
            <path d={getAreaPath(passedTrend)} fill="rgba(16,185,129,0.1)" />
            <path d={getLinePath(passedTrend)} fill="none" stroke="var(--color-green)" strokeWidth="2.5" />
            <path d={getLinePath(failedTrend)} fill="none" stroke="var(--color-red)" strokeWidth="2.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
