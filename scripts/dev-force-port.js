#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = util.promisify(exec);

// Scrypto always runs on this port
const SCRYPTO_PORT = 4569;

// Setup logging
const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, `scrypto-dev-${new Date().toISOString().split('T')[0]}.log`);

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Create log stream
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

function logMessage(message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}\n`;
  console.log(message);
  logStream.write(logLine);
}

/**
 * Kill any process running on the Scrypto port
 */
async function killPortProcess() {
  try {
    logMessage(`🔍 Checking if anything is running on port ${SCRYPTO_PORT}...`);
    
    // Find process using the port (works on Linux/Mac/Windows)
    let command;
    if (process.platform === 'win32') {
      command = `netstat -ano | findstr :${SCRYPTO_PORT}`;
    } else {
      command = `lsof -ti:${SCRYPTO_PORT}`;
    }
    
    const { stdout } = await execAsync(command);
    
    if (stdout.trim()) {
      logMessage(`⚠️  Found process running on port ${SCRYPTO_PORT}, killing it...`);
      
      if (process.platform === 'win32') {
        // Windows: Extract PID and kill it
        const lines = stdout.trim().split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            await execAsync(`taskkill /F /PID ${pid}`);
            logMessage(`💀 Killed process ${pid}`);
          }
        }
      } else {
        // Linux/Mac: PIDs are directly in stdout
        const pids = stdout.trim().split('\n').filter(pid => pid.trim());
        for (const pid of pids) {
          await execAsync(`kill -9 ${pid}`);
          logMessage(`💀 Killed process ${pid}`);
        }
      }
      
      // Wait a moment for processes to fully terminate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } else {
      logMessage(`✅ Port ${SCRYPTO_PORT} is free`);
    }
    
  } catch (error) {
    // No process found on port (normal case)
    logMessage(`✅ Port ${SCRYPTO_PORT} is free`);
  }
}

/**
 * Start Scrypto development server
 */
async function startScrypto() {
  logMessage(`🚀 Starting Scrypto on http://localhost:${SCRYPTO_PORT}`);
  
  // Start Next.js dev server with Turbopack (76% faster)
  const nextProcess = spawn('npx', ['next', 'dev', '--turbo', '-p', SCRYPTO_PORT.toString(), '-H', '0.0.0.0'], {
    stdio: 'inherit',
    shell: true
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    logMessage('👋 Shutting down Scrypto development server...');
    logStream.end();
    nextProcess.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    logMessage('👋 Shutting down Scrypto development server (SIGTERM)...');
    logStream.end();
    nextProcess.kill('SIGTERM');
    process.exit(0);
  });
  
  nextProcess.on('exit', (code) => {
    process.exit(code || 0);
  });
}

/**
 * Main function
 */
async function main() {
  try {
    await killPortProcess();
    await startScrypto();
  } catch (error) {
    logMessage(`❌ Error starting Scrypto: ${error.message}`);
    logStream.end();
    process.exit(1);
  }
}

// Run the script
main();
