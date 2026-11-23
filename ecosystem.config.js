const path = require("node:path");

module.exports = {
  apps: [
    {
      name: "suara-mandara",

      // Launch Next.js directly using the project's local installation.
      script: path.join(__dirname, "node_modules", "next", "dist", "bin", "next"),
      args: "start",
      cwd: __dirname,
      interpreter: process.execPath,

      // SQLite uses a local database file. Keep a single application process.
      instances: 1,
      exec_mode: "fork",

      // Process management.
      autorestart: true,
      watch: false,
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: "10s",
      kill_timeout: 10000,
      time: true,

      // Production environment.
      env_production: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000,
      },
    },
  ],
};
