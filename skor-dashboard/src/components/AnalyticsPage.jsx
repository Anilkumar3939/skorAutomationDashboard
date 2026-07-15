import React, { useState } from 'react';
import { GitBranch, Target, ClipboardList, AlertCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';

export default function AnalyticsPage({ runsList }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredResultPoint, setHoveredResultPoint] = useState(null);

  // If no data or loading state
  if (!runsList || runsList.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '4rem 2rem', alignItems: 'center', justifyContent: 'center', height: '50vh', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>No Analytics Data Available</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
          Please execute some test runs first. Once runs are recorded, dynamic analytics, historical trends, and status distributions will automatically populate here.
        </p>
      </div>
    );
  }

  // Dynamic Calculations
  const totalRuns = runsList.length;
  const totalTests = runsList.reduce((acc, run) => acc + run.total, 0);
  const totalPassed = runsList.reduce((acc, run) => acc + run.passed, 0);
  const totalFailures = runsList.reduce((acc, run) => acc + run.failed, 0);
  const passPercentage = totalTests > 0 ? parseFloat(((totalPassed / totalTests) * 100).toFixed(1)) : 0;

  // Average Duration calculation
  const totalDurationMs = runsList.reduce((acc, run) => acc + (parseFloat(run.duration) || 0), 0);
  const avgDurationMs = totalRuns > 0 ? totalDurationMs / totalRuns : 0;
  const avgDuration = avgDurationMs >= 1000 
    ? `${(avgDurationMs / 1000).toFixed(2)}s` 
    : `${Math.round(avgDurationMs)}ms`;

  // Trend Calculations (Latest Run vs Previous Run)
  const latestRun = runsList[0] || { total: 0, passed: 0, failed: 0, duration: "0ms" };
  const previousRun = runsList[1];

  // 1. Runs trend (runs today)
  const runsToday = runsList.filter(r => {
    const executedDate = new Date(r.executedOn);
    const diffTime = Math.abs(new Date() - executedDate);
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 1;
  }).length;
  const runsTrend = `+${runsToday} today`;
  const runsTrendDir = runsToday > 0 ? 'up' : 'down';

  // 2. Pass Percentage trend
  let passTrendVal = 0;
  let passTrendDir = 'up';
  if (previousRun) {
    const latestPct = latestRun.total > 0 ? (latestRun.passed / latestRun.total) * 100 : 0;
    const prevPct = previousRun.total > 0 ? (previousRun.passed / previousRun.total) * 100 : 0;
    passTrendVal = parseFloat((latestPct - prevPct).toFixed(1));
    passTrendDir = passTrendVal >= 0 ? 'up' : 'down';
  }
  const passTrend = `${passTrendVal >= 0 ? '+' : ''}${passTrendVal}%`;

  // 3. Total Tests trend
  let testsTrendVal = 0;
  let testsTrendDir = 'up';
  if (previousRun) {
    testsTrendVal = latestRun.total - previousRun.total;
    testsTrendDir = testsTrendVal >= 0 ? 'up' : 'down';
  }
  const testsTrend = `${testsTrendVal >= 0 ? '+' : ''}${testsTrendVal}`;

  // 4. Total Failures trend (decrease/up is good, increase/down is bad)
  let failuresTrendVal = 0;
  let failuresTrendDir = 'up';
  if (previousRun) {
    failuresTrendVal = latestRun.failed - previousRun.failed;
    failuresTrendDir = failuresTrendVal <= 0 ? 'up' : 'down';
  }
  const failuresTrend = `${failuresTrendVal >= 0 ? '+' : ''}${failuresTrendVal}`;

  // 5. Avg. Duration trend (decrease/up is good, increase/down is bad)
  let durationTrendVal = 0;
  let durationTrendDir = 'up';
  if (previousRun) {
    const latestDur = parseFloat(latestRun.duration) || 0;
    const prevDur = parseFloat(previousRun.duration) || 0;
    if (prevDur > 0) {
      durationTrendVal = parseFloat((((latestDur - prevDur) / prevDur) * 100).toFixed(1));
    }
    durationTrendDir = durationTrendVal <= 0 ? 'up' : 'down';
  }
  const durationTrend = `${durationTrendVal >= 0 ? '+' : ''}${durationTrendVal}%`;

  // Cards layout
  const cards = [
    { id: 'runs', title: 'Total Runs', value: totalRuns.toLocaleString(), trend: runsTrend, trendDir: runsTrendDir, icon: GitBranch, className: 'total' },
    { id: 'pass', title: 'Pass Percentage', value: `${passPercentage}%`, trend: passTrend, trendDir: passTrendDir, icon: Target, className: 'percentage' },
    { id: 'tests', title: 'Total Tests', value: totalTests.toLocaleString(), trend: testsTrend, trendDir: testsTrendDir, icon: ClipboardList, className: 'passed' },
    { id: 'failures', title: 'Total Failures', value: totalFailures.toLocaleString(), trend: failuresTrend, trendDir: failuresTrendDir, icon: AlertCircle, className: 'failed' },
    { id: 'duration', title: 'Avg. Duration', value: avgDuration, trend: durationTrend, trendDir: durationTrendDir, icon: Clock, className: 'duration' }
  ];

  // SVG Chart mathematics - most recent 7 runs in chronological order
  const last7Runs = [...runsList].slice(0, 7).reverse();
  const dates = last7Runs.map(run => {
    return new Date(run.executedOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  const passedTrend = last7Runs.map(run => run.passed);
  const failedTrend = last7Runs.map(run => run.failed);
  const percentTrend = last7Runs.map(run => run.total > 0 ? parseFloat(((run.passed / run.total) * 100).toFixed(1)) : 0);

  const trendX = (index) => 40 + index * (400 / Math.max(1, last7Runs.length - 1));
  
  const maxVal = Math.max(...passedTrend, ...failedTrend, 1);
  const trendY = (val) => 120 - (val / maxVal) * 100;
  
  const percentY = (val) => 120 - (val / 100) * 100;

  const getLinePath = (data, isPercent = false) => {
    return data.map((val, idx) => {
      const x = trendX(idx);
      const y = isPercent ? percentY(val) : trendY(val);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const getAreaPath = (data, isPercent = false) => {
    const linePath = getLinePath(data, isPercent);
    if (!linePath) return '';
    const firstX = trendX(0);
    const lastX = trendX(data.length - 1);
    const baselineY = 120;
    return `${linePath} L ${lastX} ${baselineY} L ${firstX} ${baselineY} Z`;
  };

  // Status Distribution Donut calculations
  const donutTotal = totalTests;
  const donutPassed = totalPassed;
  const donutFailed = totalFailures;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const passedStrokeDash = donutTotal > 0 ? (donutPassed / donutTotal) * circumference : 0;
  const failedStrokeDash = donutTotal > 0 ? (donutFailed / donutTotal) * circumference : 0;

  const passedPctStr = donutTotal > 0 ? ((donutPassed / donutTotal) * 100).toFixed(2) : '0.00';
  const failedPctStr = donutTotal > 0 ? ((donutFailed / donutTotal) * 100).toFixed(2) : '0.00';

  // Generate dynamic grid lines for results chart
  const resultsGridLines = [];
  const resultsStep = maxVal / 5;
  for (let i = 0; i <= 5; i++) {
    resultsGridLines.push(Math.round(resultsStep * i));
  }
  const uniqueResultsGridLines = Array.from(new Set(resultsGridLines));

  // Percentage grid lines
  const percentGridLines = [0, 20, 40, 60, 80, 100];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="header-container" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <div className="header-title-area">
          <h1>Analytics</h1>
          <p>Analyze test execution trends and insights</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trendDir === 'up' ? TrendingUp : TrendingDown;
          return (
            <div key={card.id} className={`card stat-card ${card.className}`}>
              <div className="stat-header">
                <span className="stat-title">{card.title}</span>
                <div className="stat-icon">
                  <Icon size={18} />
                </div>
              </div>
              <div className="stat-value">{card.value}</div>
              <div className={`stat-trend ${card.trendDir}`}>
                <TrendIcon size={12} />
                <span>{card.trend}</span>
                <span className="stat-trend-label">vs last run</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid of charts */}
      <div className="charts-grid" style={{ gridTemplateColumns: '1.5fr 1.5fr 1.2fr' }}>
        {/* 1. Pass Percentage Trend */}
        <div className="card chart-card">
          <div className="chart-header">
            <span className="chart-title">Pass Percentage Trend</span>
          </div>
          <div className="chart-content">
            <svg className="trend-chart-wrapper" viewBox="0 0 460 140">
              <defs>
                <linearGradient id="anPctGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              {percentGridLines.map((val) => {
                const y = percentY(val);
                return (
                  <g key={val}>
                    <line x1="40" y1={y} x2="440" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                    <text x="10" y={y + 3} fill="var(--text-muted)" fontSize="8.5" fontWeight="600">
                      {val}%
                    </text>
                  </g>
                );
              })}
              <path d={getAreaPath(percentTrend, true)} fill="url(#anPctGrad)" />
              <path d={getLinePath(percentTrend, true)} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
              {percentTrend.map((val, idx) => {
                const x = trendX(idx);
                const y = percentY(val);
                return (
                  <circle 
                    key={idx} 
                    cx={x} 
                    cy={y} 
                    r="4" 
                    fill="white" 
                    stroke="var(--color-primary)" 
                    strokeWidth="2.5"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPoint({ chart: 'percent', idx, x, y, value: val })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}
              {dates.map((date, idx) => (
                <text key={idx} x={trendX(idx)} y="135" fill="var(--text-muted)" fontSize="8.5" fontWeight="500" textAnchor="middle">{date}</text>
              ))}
              {hoveredPoint && hoveredPoint.chart === 'percent' && (
                <g>
                  <rect x={hoveredPoint.x - 30} y={hoveredPoint.y - 28} width="60" height="18" rx="4" fill="#0b192c" opacity="0.95" />
                  <text x={hoveredPoint.x} y={hoveredPoint.y - 16} fill="white" fontSize="8" fontWeight="600" textAnchor="middle">{hoveredPoint.value}%</text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* 2. Test Results Trend */}
        <div className="card chart-card">
          <div className="chart-header">
            <span className="chart-title">Test Results Trend</span>
            <div className="trend-legend">
              <div className="legend-item">
                <span className="legend-color passed"></span>
                <span className="legend-text" style={{ fontSize: '0.75rem' }}>Passed</span>
              </div>
              <div className="legend-item">
                <span className="legend-color failed"></span>
                <span className="legend-text" style={{ fontSize: '0.75rem' }}>Failed</span>
              </div>
            </div>
          </div>
          <div className="chart-content">
            <svg className="trend-chart-wrapper" viewBox="0 0 460 140">
              <defs>
                <linearGradient id="anPassedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-green)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--color-green)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {uniqueResultsGridLines.map((val) => {
                const y = trendY(val);
                return (
                  <g key={val}>
                    <line x1="40" y1={y} x2="440" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                    <text x="10" y={y + 4} fill="var(--text-muted)" fontSize="8" fontWeight="600">
                      {val >= 1000 ? `${(val/1000).toFixed(1)}K` : val}
                    </text>
                  </g>
                );
              })}
              <path d={getAreaPath(passedTrend)} fill="url(#anPassedGrad)" />
              <path d={getLinePath(passedTrend)} fill="none" stroke="var(--color-green)" strokeWidth="2.5" />
              <path d={getLinePath(failedTrend)} fill="none" stroke="var(--color-red)" strokeWidth="2.5" />
              
              {passedTrend.map((val, idx) => {
                const x = trendX(idx);
                const y = trendY(val);
                return (
                  <circle 
                    key={`p-${idx}`} 
                    cx={x} 
                    cy={y} 
                    r="4" 
                    fill="white" 
                    stroke="var(--color-green)" 
                    strokeWidth="2.5" 
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredResultPoint({ type: 'Passed', idx, x, y, value: val })}
                    onMouseLeave={() => setHoveredResultPoint(null)}
                  />
                );
              })}
              {failedTrend.map((val, idx) => {
                const x = trendX(idx);
                const y = trendY(val);
                return (
                  <circle 
                    key={`f-${idx}`} 
                    cx={x} 
                    cy={y} 
                    r="4" 
                    fill="white" 
                    stroke="var(--color-red)" 
                    strokeWidth="2.5" 
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredResultPoint({ type: 'Failed', idx, x, y, value: val })}
                    onMouseLeave={() => setHoveredResultPoint(null)}
                  />
                );
              })}
              {dates.map((date, idx) => (
                <text key={idx} x={trendX(idx)} y="135" fill="var(--text-muted)" fontSize="8.5" fontWeight="500" textAnchor="middle">{date}</text>
              ))}
              {hoveredResultPoint && (
                <g>
                  <rect x={hoveredResultPoint.x - 40} y={hoveredResultPoint.y - 28} width="80" height="18" rx="4" fill="#0b192c" opacity="0.95" />
                  <text x={hoveredResultPoint.x} y={hoveredResultPoint.y - 16} fill="white" fontSize="8" fontWeight="600" textAnchor="middle">{hoveredResultPoint.type}: {hoveredResultPoint.value}</text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* 3. Status Distribution Donut */}
        <div className="card chart-card">
          <div className="chart-header">
            <span className="chart-title">Status Distribution</span>
          </div>
          <div className="chart-content">
            <div className="donut-container" style={{ flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
              <div className="donut-svg-wrapper">
                <svg width="110" height="110" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-green)" strokeWidth="10" strokeDasharray={`${passedStrokeDash} ${circumference}`} transform="rotate(-90 50 50)" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-red)" strokeWidth="10" strokeDasharray={`${failedStrokeDash} ${circumference}`} strokeDashoffset={`-${passedStrokeDash}`} transform="rotate(-90 50 50)" />
                </svg>
                <div className="donut-label-center">
                  <div style={{ fontSize: '1rem', fontWeight: 800 }}>{donutTotal.toLocaleString()}</div>
                  <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total</div>
                </div>
              </div>
              
              <div className="donut-legend" style={{ width: '100%' }}>
                <div className="legend-item" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="legend-color passed"></span>
                    <span className="legend-text" style={{ fontSize: '0.8rem' }}>Passed</span>
                  </div>
                  <span className="legend-val" style={{ fontSize: '0.8rem' }}>{donutPassed.toLocaleString()} ({passedPctStr}%)</span>
                </div>
                <div className="legend-item" style={{ justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="legend-color failed"></span>
                    <span className="legend-text" style={{ fontSize: '0.8rem' }}>Failed</span>
                  </div>
                  <span className="legend-val" style={{ fontSize: '0.8rem' }}>{donutFailed.toLocaleString()} ({failedPctStr}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
