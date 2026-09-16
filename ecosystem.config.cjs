module.exports = {
  apps: [{
    name: 'dashcole-api',
    cwd: require('node:path').join(__dirname, 'api'),
    script: 'src/server.js',
    instances: 1,
    autorestart: true,
    max_memory_restart: '380M',
    kill_timeout: 5000,
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    out_file: '/home/web/www/logs/api-out.log',
    error_file: '/home/web/www/logs/api-error.log',
    merge_logs: true,
    env: { PORT: 7000 },
    env_production: {
      NODE_ENV: 'production',
      PORT: 7000,
    },
  }],
};
