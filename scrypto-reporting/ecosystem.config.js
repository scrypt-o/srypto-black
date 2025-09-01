module.exports = {
  apps: [{
    name: 'scrypto-status',
    script: 'python3',
    args: ['-m', 'http.server', '7766'],
    cwd: '/_eve_/_eve_adhoc_/scrypto-status-app',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '100M',
    env: {
      NODE_ENV: 'production'
    },
    log_file: '/_eve_/_eve_adhoc_/scrypto-status-app/logs/combined.log',
    out_file: '/_eve_/_eve_adhoc_/scrypto-status-app/logs/out.log',
    error_file: '/_eve_/_eve_adhoc_/scrypto-status-app/logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z'
  }]
};