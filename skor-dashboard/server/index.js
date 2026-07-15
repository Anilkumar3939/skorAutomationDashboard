import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { spawn } from 'child_process';
import { query, initDb } from './db.js';
import { runTestSuite } from './runner.js';
import { importRunResults } from './parser.js';
import { sendReportEmail } from './mailer.js';

const app = express();
const PORT = 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Initialize Database
await initDb();

// Static screenshots and reports
app.use('/reports', express.static(path.join(__dirname, '../public/reports')));

// --- Email Report Route ---
app.post('/api/reports/:runId/email', async (req, res) => {
  const { runId } = req.params;
  const reportPath = path.join(__dirname, `../public/reports/run_${runId}`);
  
  if (!fs.existsSync(reportPath)) {
    return res.status(404).json({ success: false, message: 'Report folder not found.' });
  }

  try {
    await sendReportEmail(runId, reportPath);
    res.json({ success: true, message: 'Report emailed successfully.' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ success: false, message: 'Failed to send report.' });
  }
});
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    res.json({ success: true, token: 'fake-jwt-token' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// --- Test Run Routes ---
app.get('/api/runs', async (req, res) => {
  try {
    const result = await query('SELECT * FROM test_runs ORDER BY executed_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

let isRunning = false; // Simple in-memory lock

app.post('/api/runs/execute', async (req, res) => {
  if (isRunning) {
    return res.status(429).json({ success: false, message: "A test run is already in progress." });
  }

  const { suiteName, suiteFiles } = req.body;
  isRunning = true; // Lock

  try {
    // 1. Create run record
    const insertRes = await query('INSERT INTO test_runs (suite_name, status, executed_at) VALUES ($1, $2, $3) RETURNING id', 
      [suiteName, 'RUNNING', new Date().toISOString()]);
      
    const runId = insertRes.rows[0].id;
        
    // 2. Trigger runner in the background
    (async () => {
      try {
        for (const file of suiteFiles) {
          await runTestSuite(suiteName, file);
        }
        
        // 3. Generate static Allure report
        const reportDir = path.join(__dirname, `../public/reports/run_${runId}`);
        let reportGenerated = false;
        try {
          await new Promise((resolve) => {
            const gen = spawn('allure', ['generate', path.join(__dirname, '../../test_automation/allure-results'), '-o', reportDir, '--clean'], { shell: true });
            gen.on('close', (code) => {
              reportGenerated = (code === 0 && fs.existsSync(path.join(reportDir, 'index.html')));
              resolve();
            });
            gen.on('error', resolve);
          });
        } catch (e) {
          console.error("Allure generation failed", e);
        }
        
        // 4. Sync results only if report generation was successful
        if (reportGenerated) {
            const stats = await importRunResults(runId);
            
            // Only mark as PASSED if we actually found tests and there are no failures
            if (stats.total > 0) {
                const status = stats.failed > 0 ? 'FAILED' : 'PASSED';
                await query(`UPDATE test_runs SET status = $1, report_url = $2, 
                        total_tests = $3, passed_tests = $4, failed_tests = $5, duration_ms = $6 WHERE id = $7`, 
                [status, `/reports/run_${runId}/index.html`, stats.total, stats.passed, stats.failed, stats.duration, runId]);
            } else {
                // No tests found, mark as FAILED
                await query(`UPDATE test_runs SET status = $1, report_url = $2 WHERE id = $3`, 
                ['FAILED', `/reports/run_${runId}/index.html`, runId]);
            }
        } else {
            throw new Error("Allure report generation failed or index.html missing");
        }
      } catch (err) {
        console.error("Execution error:", err);
        await query('UPDATE test_runs SET status = $1 WHERE id = $2', ['FAILED', runId]);
      } finally {
        isRunning = false; // Unlock
      }
    })();

    // 5. Return immediately
    res.status(202).json({ success: true, runId, message: "Execution started" });
  } catch (e) {
    isRunning = false; // Unlock
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});