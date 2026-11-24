import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = dirname(fileURLToPath(import.meta.url));

function getPort() {
  const envLocalPath = join(projectDir, ".env.local");
  let port = process.env.PORT || "3000";

  if (existsSync(envLocalPath)) {
    const envContent = readFileSync(envLocalPath, "utf8");
    const match = envContent.match(/^\s*(?:export\s+)?PORT\s*=\s*(.*?)\s*$/m);

    if (match) {
      let value = match[1].trim();

      if (
        (value.startsWith("\"") && value.endsWith("\"")) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      } else {
        value = value.replace(/\s+#.*$/, "").trim();
      }

      if (value) port = value;
    }
  }

  const numericPort = Number(port);
  if (!Number.isInteger(numericPort) || numericPort < 1 || numericPort > 65535) {
    throw new Error(`Invalid PORT value: ${port}. Expected a number between 1 and 65535.`);
  }

  return String(numericPort);
}

export const apps = [
  {
    name: "suara-mandara",
    script: join(projectDir, "node_modules", "next", "dist", "bin", "next"),
    args: "start",
    cwd: projectDir,
    interpreter: process.execPath,

    // SQLite uses a local database file. Keep a single application process.
    instances: 1,
    exec_mode: "fork",

    autorestart: true,
    watch: false,
    restart_delay: 3000,
    max_restarts: 10,
    min_uptime: "10s",
    kill_timeout: 10000,
    time: true,

    env_production: {
      NODE_ENV: "production",
      PORT: getPort(),
    },
  },
];
