import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const archiverLib = require('archiver');

export const sendReportEmail = async (runId, reportPath, recipient = 'anil@sko.co') => {
  const zipPath = path.join(path.dirname(reportPath), `run_${runId}.zip`);
  
  // Create ZIP
  const output = fs.createWriteStream(zipPath);
  const archive = new archiverLib.ZipArchive({ zlib: { level: 9 } });

  await new Promise((resolve, reject) => {
    output.on('close', resolve);
    archive.on('error', reject);
    archive.pipe(output);
    archive.directory(reportPath, false);
    archive.finalize();
  });

  // Send Email
  const smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: (process.env.SMTP_PORT || 465) == 465,
    family: 4,
    auth: {
      user: process.env.SMTP_USER || 'anilkumar3939104@gmail.com',
      pass: process.env.SMTP_PASS || 'zhoperuptbrgdmjf', // PLEASE NOTE: This is a temporary hardcoded fallback.
    },
  };

  console.log('DEBUG: SMTP Config used:', smtpConfig);

  const transporter = nodemailer.createTransport({
    ...smtpConfig,
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,
  });

  console.log('DEBUG: Attempting to send email...');

  try {
    await transporter.sendMail({
      from: `"SKOR QA Automation" <${smtpConfig.auth.user}>`,
      to: recipient,
      subject: 'QA Regression Test Execution Report',
      text: 'Hello,\n\nThe latest regression test execution has successfully completed.\n\nPlease find the attached test report file.\n\nRegards,\nSKOR QA Automation Team',
      attachments: [{ 
        filename: `run_${runId}.allure`, 
        path: zipPath,
        contentType: 'application/zip' 
      }],
    });
    console.log('DEBUG: Email sent successfully');
  } catch (err) {
    // Cleanup zip file
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
  }
};
