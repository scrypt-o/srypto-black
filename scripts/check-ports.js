#!/usr/bin/env node

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
 * Check all Scrypto ports
 */
async function checkAllPorts() {
  console.log('🔍 Checking Scrypto port availability...\n');
  
  const results = [];
  
  for (const port of PORTS) {
    const isAvailable = await checkPort(port);
    const status = isAvailable ? '✅ Available' : '❌ In use';
    console.log(`Port ${port}: ${status}`);
    results.push({ port, available: isAvailable });
  }
  
  console.log('\n📋 Summary:');
  const availablePorts = results.filter(r => r.available);
  const usedPorts = results.filter(r => !r.available);
  
  if (availablePorts.length > 0) {
    console.log(`✅ Available ports: ${availablePorts.map(r => r.port).join(', ')}`);
  }
  
  if (usedPorts.length > 0) {
    console.log(`❌ Used ports: ${usedPorts.map(r => r.port).join(', ')}`);
  }
  
  console.log('\n🚀 To start development server:');
  if (availablePorts.length > 0) {
    const firstAvailable = availablePorts[0].port;
    console.log(`   npm run dev:${firstAvailable}  (recommended)`);
    console.log(`   npm run dev:auto  (auto-detect)`);
  } else {
    console.log('   No ports available - please free up a port first');
  }
}

// Run the script
checkAllPorts().catch((error) => {
  console.error('❌ Error checking ports:', error);
  process.exit(1);
});