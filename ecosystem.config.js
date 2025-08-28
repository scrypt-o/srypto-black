/**
 * PM2 Configuration for Stable Server
 * Keeps the dev server running with auto-restart
 */

module.exports = {
  apps: [{
    name: 'scrypto-dev',
    script: 'npm',
    args: 'run dev',
    watch: false,
    autorestart: true,
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    env: {
      NODE_ENV: 'development',
      PORT: 4569
    },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    log_file: 'logs/pm2-combined.log',
    time: true
  }]
}