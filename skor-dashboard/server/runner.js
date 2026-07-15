import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runTestSuite = (suiteName, suiteFile) => {
  console.log(`[Runner] Starting test suite: ${suiteName}, file: ${suiteFile}`);
  return new Promise((resolve, reject) => {
    const pythonPath = process.platform === 'win32' 
      ? 'C:\\Users\\PRASANNA KUMAR\\AppData\\Local\\Programs\\Python\\Python313\\python.exe' 
      : 'python3';
    const projectRoot = path.join(__dirname, '../../test_automation');
    
    const child = spawn(pythonPath, [
      '-m', 'pytest', 
      `tests/${suiteFile}`, 
      '--alluredir=allure-results',
      '-v', '--tb=short'
    ], {
      cwd: projectRoot,
      env: { ...process.env, TEST_PHONE: '86711112331' }
    });

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (data) => {
      stdoutData += data;
      console.log(`stdout: ${data}`);
    });
    child.stderr.on('data', (data) => {
      stderrData += data;
      console.error(`stderr: ${data}`);
    });
    
    child.on('close', (code) => {
      if (code === 0 || code === 1) {
        resolve();
      } else {
        console.error(`Runner failed. Exit Code: ${code}`);
        console.error(`Full Stderr: ${stderrData}`);
        reject(new Error(`Test runner exited with code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
};