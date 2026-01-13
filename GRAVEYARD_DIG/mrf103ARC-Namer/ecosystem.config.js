module.exports = {
  apps: [{
    name: 'stellar-command',
    script: './server/index.js',
    instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
    exec_mode: 'cluster',
    
    // Environment
    env: {
      NODE_ENV: 'development',
      PORT: 5001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 5001
    },
    
    // Logging
    log_file: './logs/combined.log',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Performance monitoring
    max_memory_restart: '512M',
    min_uptime: '10s',
    max_restarts: 10,
    
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 10000,
    shutdown_with_message: true,
    
    // Auto restart
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.git'],
    
    // Source maps
    source_map_support: true,
    
    // Timeouts
    restart_delay: 4000,
    
    // Health monitoring
    max_restarts: 15,
    min_uptime: '10s'
  }],
  
  // Deployment configuration
  deploy: {
    production: {
      user: process.env.DEPLOY_USER || 'deploy',
      host: process.env.DEPLOY_HOST || 'production-server',
      ref: 'origin/main',
      repo: process.env.DEPLOY_REPO || 'git@github.com:mrf103/stellar-command.git',
      path: process.env.DEPLOY_PATH || '/var/www/stellar-command',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
