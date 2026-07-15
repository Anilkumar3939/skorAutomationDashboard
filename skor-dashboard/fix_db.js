import { db } from './server/db.js';

db.run("ALTER TABLE test_runs ADD COLUMN report_url TEXT", (err) => {
    if (err) {
        console.log("Alter might have already been run or failed:", err.message);
    } else {
        console.log("Column report_url added successfully.");
    }
    process.exit(0);
});
