#!/usr/bin/env node

const { spawn } = require('child_process');
const net = require('net');

// Available ports for Scrypto
const PORTS = [4569, 4570, 4571, 4572];

/**
 * Check if a port is available
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true); // Port is available
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false); // Port is in use
    });
  });
}

/**
 * Find the first available port
 */
async function findAvailablePort() {
  for (const port of PORTS) {
    const isAvailable = await checkPort(port);
    if (isAvailable) {
      return port;
    }
    console.log(`Port ${port} is in use, trying next...`);
  }
  return null;
}

/**
 * Start Next.js dev server on available port
 */
async function startDev() {
  console.log('🔍 Checking available ports...');
  
  const port = await findAvailablePort();
  
  if (!port) {
    console.error('❌ No available ports found in range: ' + PORTS.join(', '));
    console.error('   Please free up one of these ports or manually specify a port with:');
    console.error('   npm run dev:4569, npm run dev:4570, npm run dev:4571, or npm run dev:4572');
    process.exit(1);
  }
  
  console.log(`✅ Found available port: ${port}`);
  console.log(`🚀 Starting Scrypto on http://localhost:${port}\n`);
  
  // Start Next.js dev server
  const nextProcess = spawn('npx', ['next', 'dev', '-p', port.toString()], {
    stdio: 'inherit',
    shell: true
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down development server...');
    nextProcess.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    nextProcess.kill('SIGTERM');
    process.exit(0);
  });
  
  nextProcess.on('exit', (code) => {
    process.exit(code || 0);
  });
}

// Run the script
startDev().catch((error) => {
  console.error('❌ Error starting development server:', error);
  process.exit(1);
});