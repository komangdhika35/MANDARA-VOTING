import client from "prom-client";
import { getDatabase } from "@/lib/db";

// Prevent multiple registrations during Next.js hot reloading in development
// by attaching the registry to globalThis.
const globalForMetrics = globalThis as typeof globalThis & {
  suaraMandaraMetricsRegistry?: client.Registry;
};

export const register =
  globalForMetrics.suaraMandaraMetricsRegistry ?? new client.Registry();

if (!globalForMetrics.suaraMandaraMetricsRegistry) {
  globalForMetrics.suaraMandaraMetricsRegistry = register;
  // Default process metrics: CPU, memory, event loop lag, GC, and file descriptors.
  client.collectDefaultMetrics({ register });
}

type CounterConfig = ConstructorParameters<typeof client.Counter>[0];
type GaugeConfig = ConstructorParameters<typeof client.Gauge>[0];

// getSingleMetric-backed factories keep hot reloads safe: whichever module
// instance increments the metric, it always points at the registered one.
function getOrCreateCounter(config: CounterConfig): client.Counter {
  const existing = register.getSingleMetric(config.name);
  if (existing) return existing as client.Counter;
  const metric = new client.Counter(config);
  register.registerMetric(metric);
  return metric;
}

function getOrCreateGauge(config: GaugeConfig): client.Gauge {
  const existing = register.getSingleMetric(config.name);
  if (existing) return existing as client.Gauge;
  const metric = new client.Gauge(config);
  register.registerMetric(metric);
  return metric;
}

// Successfully cast ballots, labeled by organization (mpk, osis, ky).
export const voteCounter = getOrCreateCounter({
  name: "suara_mandara_votes_total",
  help: "Total number of ballots successfully cast",
  labelNames: ["organization"],
});

// Login attempts, labeled by role (admin, student, guest) and result.
export const authAttemptsCounter = getOrCreateCounter({
  name: "suara_mandara_auth_attempts_total",
  help: "Login attempts by role and result",
  labelNames: ["role", "result"],
});

// Election state is read from SQLite at scrape time, so gauges remain accurate
// after an application restart. Never use voter identities or names as labels.
export const participationGauge = getOrCreateGauge({
  name: "suara_mandara_participation",
  help: "Voters who completed each organization ballot (from database)",
  labelNames: ["organization"],
  collect() {
    const rows = getDatabase()
      .prepare(
        "SELECT organization_id, COUNT(*) AS total FROM participation GROUP BY organization_id",
      )
      .all() as { organization_id: string; total: number }[];

    participationGauge.reset();
    for (const row of rows) {
      participationGauge.set({ organization: row.organization_id }, row.total);
    }
  },
});

export const candidateVotesGauge = getOrCreateGauge({
  name: "suara_mandara_candidate_votes",
  help: "Votes per candidate or MPK member (from database)",
  labelNames: ["organization", "candidate"],
  collect() {
    const database = getDatabase();
    candidateVotesGauge.reset();

    const ballotRows = database
      .prepare(
        "SELECT organization_id, candidate_id, COUNT(*) AS total FROM ballots GROUP BY organization_id, candidate_id",
      )
      .all() as { organization_id: string; candidate_id: string; total: number }[];

    for (const row of ballotRows) {
      candidateVotesGauge.set(
        { organization: row.organization_id, candidate: row.candidate_id },
        row.total,
      );
    }

    const mpkRows = database
      .prepare(
        "SELECT position, member_id, COUNT(*) AS total FROM mpk_ballots GROUP BY position, member_id",
      )
      .all() as { position: string; member_id: string; total: number }[];

    for (const row of mpkRows) {
      candidateVotesGauge.set(
        { organization: "mpk", candidate: `${row.position}:${row.member_id}` },
        row.total,
      );
    }
  },
});

export const activeSessionsGauge = getOrCreateGauge({
  name: "suara_mandara_active_sessions",
  help: "Unexpired login sessions by role (from database)",
  labelNames: ["role"],
  collect() {
    const database = getDatabase();
    const now = Math.floor(Date.now() / 1000);

    const studentRow = database
      .prepare(
        "SELECT COUNT(*) AS total FROM sessions WHERE expires_at > ? AND nis NOT LIKE 'GUEST-%'",
      )
      .get(now) as { total: number };

    const guestRow = database
      .prepare(
        "SELECT COUNT(*) AS total FROM sessions WHERE expires_at > ? AND nis LIKE 'GUEST-%'",
      )
      .get(now) as { total: number };

    const adminRow = database
      .prepare("SELECT COUNT(*) AS total FROM admin_sessions WHERE expires_at > ?")
      .get(now) as { total: number };

    activeSessionsGauge.reset();
    activeSessionsGauge.set({ role: "student" }, studentRow.total);
    activeSessionsGauge.set({ role: "guest" }, guestRow.total);
    activeSessionsGauge.set({ role: "admin" }, adminRow.total);
  },
});

export const registeredVotersGauge = getOrCreateGauge({
  name: "suara_mandara_registered_voters",
  help: "Active registered student voter accounts, excluding guests (from database)",
  collect() {
    const row = getDatabase()
      .prepare(
        "SELECT COUNT(*) AS total FROM voters WHERE active = 1 AND nis NOT LIKE 'GUEST-%'",
      )
      .get() as { total: number };

    registeredVotersGauge.set(row.total);
  },
});
