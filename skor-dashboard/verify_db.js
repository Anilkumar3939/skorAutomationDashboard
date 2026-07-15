import { db } from './server/db.js';

db.all("SELECT id, suite_name, status, report_url FROM test_runs", [], (err, rows) => {
    if (err) {
        console.error("Error querying DB:", err);
        process.exit(1);
    }
    console.log("Recent Test Runs Data:");
    console.table(rows);
    process.exit(0);
});
