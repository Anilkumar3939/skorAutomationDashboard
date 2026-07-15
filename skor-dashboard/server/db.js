import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const { Pool } = pg;

// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // If using a cloud provider like Render or Neon, ssl is usually required
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Generic query helper
export const query = (text, params) => pool.query(text, params);

export const initDb = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS test_runs (
        id            SERIAL PRIMARY KEY,
        suite_name    TEXT,
        environment   TEXT DEFAULT 'QA',
        status        TEXT DEFAULT 'RUNNING',
        total_tests   INTEGER DEFAULT 0,
        passed_tests  INTEGER DEFAULT 0,
        failed_tests  INTEGER DEFAULT 0,
        skipped_tests INTEGER DEFAULT 0,
        duration_ms   INTEGER DEFAULT 0,
        executed_at   TIMESTAMP WITH TIME ZONE,
        report_url    TEXT
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS test_cases (
        id            SERIAL PRIMARY KEY,
        run_id        INTEGER REFERENCES test_runs(id) ON DELETE CASCADE,
        uuid          TEXT UNIQUE,
        name          TEXT,
        full_name     TEXT,
        status        TEXT,
        duration_ms   INTEGER DEFAULT 0,
        error_message TEXT,
        error_trace   TEXT,
        start_time    TIMESTAMP WITH TIME ZONE,
        stop_time     TIMESTAMP WITH TIME ZONE
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS test_attachments (
        id              SERIAL PRIMARY KEY,
        case_uuid       TEXT REFERENCES test_cases(uuid) ON DELETE CASCADE,
        run_id          INTEGER REFERENCES test_runs(id) ON DELETE CASCADE,
        name            TEXT,
        type            TEXT,
        source_filename TEXT,
        file_path       TEXT
      )
    `);
    
    // Clean up any runs stuck in 'RUNNING' status from previous crashed sessions
    await query(`UPDATE test_runs SET status = 'FAILED' WHERE status = 'RUNNING'`);
    
    console.log('PostgreSQL database initialized');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};
