import { query } from './server/db.js';

try {
  const { rows } = await query("SELECT id, suite_name, status, report_url FROM test_runs ORDER BY id DESC LIMIT 10");
  console.log("Recent Test Runs Data:");
  console.table(rows);
  process.exit(0);
} catch (err) {
  console.error("Error querying DB:", err);
  process.exit(1);
}
