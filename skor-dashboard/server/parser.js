import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The 8 targeted test file basenames (without path)
const TARGETED_SUITES = [
  'test_registration_login',
  'test_otp',
  'test_onboarding',
  'test_pre_uw_loading',
  'test_pre_approved',
  'test_verify_email',
  'test_onboarding_extended',
  'test_delivery_page'
];

// Resolve the allure-results directory relative to the server folder
// skor-dashboard/server -> skor-dashboard -> skor_automation_project -> test_automation
const ALLURE_DIR = path.resolve(__dirname, '..', '..', 'test_automation', 'allure-results');

/**
 * Parse all Allure result JSONs, group them into runs by time proximity (1h gap = new run),
 * filter to only the 8 targeted suites, and import into the database.
 * Called once on server startup.
 */
export const syncAllureResults = async () => {
  if (!fs.existsSync(ALLURE_DIR)) {
    console.warn('[Parser] allure-results directory not found:', ALLURE_DIR);
    return;
  }

  const resultFiles = fs.readdirSync(ALLURE_DIR).filter(f => f.endsWith('-result.json'));
  if (resultFiles.length === 0) {
    console.log('[Parser] No result files found.');
    return;
  }

  // Parse all result JSON files
  const results = [];
  for (const file of resultFiles) {
    try {
      const raw = fs.readFileSync(path.join(ALLURE_DIR, file), 'utf8');
      const data = JSON.parse(raw);

      // Only include results from our 8 targeted suites
      const suiteName = data.labels?.find(l => l.name === 'suite')?.value || '';
      const isTargeted = TARGETED_SUITES.some(t => suiteName.includes(t) || (data.fullName || '').includes(t));
      if (!isTargeted) continue;

      results.push({
        file,
        uuid: data.uuid,
        name: data.name,
        fullName: data.fullName || '',
        status: data.status,
        start: data.start,
        stop: data.stop,
        durationMs: (data.stop || 0) - (data.start || 0),
        errorMessage: data.statusDetails?.message || null,
        errorTrace: data.statusDetails?.trace || null,
        suiteName
      });
    } catch (e) {
      // Skip malformed files
    }
  }

  if (results.length === 0) {
    console.log('[Parser] No targeted results found after filtering.');
    return;
  }

  // Sort by start time
  results.sort((a, b) => (a.start || 0) - (b.start || 0));

  // Group into runs: new run if gap > 1 hour between consecutive tests
  const ONE_HOUR = 60 * 60 * 1000;
  const runGroups = [];
  let currentGroup = [results[0]];

  for (let i = 1; i < results.length; i++) {
    const gap = (results[i].start || 0) - (results[i - 1].stop || results[i - 1].start || 0);
    if (gap > ONE_HOUR) {
      runGroups.push(currentGroup);
      currentGroup = [results[i]];
    } else {
      currentGroup.push(results[i]);
    }
  }
  runGroups.push(currentGroup);

  console.log(`[Parser] Found ${results.length} targeted results in ${runGroups.length} run group(s).`);

  // Check if DB already has data (avoid duplicates on restart)
  const countRes = await query('SELECT COUNT(*) as cnt FROM test_cases');
  const existingCount = parseInt(countRes.rows[0].cnt || 0);
  if (existingCount > 0) {
    console.log(`[Parser] DB already has ${existingCount} test cases. Skipping re-import.`);
    return;
  }

  // Insert each run group
  for (const group of runGroups) {
    const passed = group.filter(r => r.status === 'passed').length;
    const failed = group.filter(r => r.status !== 'passed').length;
    const totalDuration = group.reduce((acc, r) => acc + r.durationMs, 0);
    const executedAt = new Date(group[0].start || Date.now()).toISOString();

    // Derive suite name from the group
    const suiteLabel = group[0].suiteName || 'Regression Suite';

    const insertRunRes = await query(
      `INSERT INTO test_runs (suite_name, environment, status, total_tests, passed_tests, failed_tests, duration_ms, executed_at)
       VALUES ($1, 'QA', $2, $3, $4, $5, $6, $7) RETURNING id`,
      [suiteLabel, failed > 0 ? 'FAILED' : 'PASSED', group.length, passed, failed, totalDuration, executedAt]
    );
    const runId = insertRunRes.rows[0].id;

    for (const r of group) {
      try {
        await query(
          `INSERT INTO test_cases (run_id, uuid, name, full_name, status, duration_ms, error_message, error_trace, start_time, stop_time)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (uuid) DO NOTHING`,
          [runId, r.uuid, r.name, r.fullName, r.status, r.durationMs, r.errorMessage, r.errorTrace, 
           r.start ? new Date(r.start).toISOString() : null, 
           r.stop ? new Date(r.stop).toISOString() : null]
        );
      } catch (e) {
        // Duplicate UUID — skip
      }
    }
  }

  console.log('[Parser] Sync complete.');
};

/**
 * Import results for a freshly completed run (called after pytest finishes).
 * Returns { total, passed, failed, duration }.
 */
export const importRunResults = async (runId) => {
  if (!fs.existsSync(ALLURE_DIR)) return { total: 0, passed: 0, failed: 0, duration: 0 };

  const resultFiles = fs.readdirSync(ALLURE_DIR).filter(f => f.endsWith('-result.json'));
  let total = 0, passed = 0, failed = 0, duration = 0;

  console.log(`[Parser] Found ${resultFiles.length} result files to process.`);

  for (const file of resultFiles) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(ALLURE_DIR, file), 'utf8'));
      const suiteName = data.labels?.find(l => l.name === 'suite')?.value || '';
      const isTargeted = TARGETED_SUITES.some(t => suiteName.includes(t) || (data.fullName || '').includes(t));

      console.log(`[Parser] Processing ${file}, suite: ${suiteName}, targeted: ${isTargeted}`);

      if (!isTargeted) continue;

      total++;
      const dur = (data.stop || 0) - (data.start || 0);
      duration += dur;
      if (data.status === 'passed') passed++;
      else failed++;

      try {
        await query(
          `INSERT INTO test_cases (run_id, uuid, name, full_name, status, duration_ms, error_message, error_trace, start_time, stop_time)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (uuid) DO NOTHING`,
          [runId, data.uuid, data.name, data.fullName || '', data.status, dur,
           data.statusDetails?.message || null, data.statusDetails?.trace || null, 
           data.start ? new Date(data.start).toISOString() : null, 
           data.stop ? new Date(data.stop).toISOString() : null]
        );
      } catch (e) { /* duplicate */ }
    } catch (e) { /* skip malformed */ }
  }

  return { total, passed, failed, duration };
};
