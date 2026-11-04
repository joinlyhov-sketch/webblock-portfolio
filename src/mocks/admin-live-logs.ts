import type { LogLine, LiveStats } from "../features/admin/monitoring/types";

export const LOG_WINDOW_MS = 15 * 60_000;
export const LOG_INTERVAL_MS = 5_000;

/** Deterministic mock traffic: new requests every five seconds, retained for fifteen minutes. */
export function mockLiveLogSnapshot(websiteId: string, live: LiveStats, now = Date.now()) {
  const latest = Math.floor(now / LOG_INTERVAL_MS);
  const start = Math.max(now - LOG_WINDOW_MS, Date.parse(live.liveSince));
  const lines: LogLine[] = [];
  for (let tick = latest; tick * LOG_INTERVAL_MS > start; tick--) {
    const error = live.logCounts.ERROR > 0 && tick % 90 === 0;
    const warning = !error && live.logCounts.WARN > 0 && tick % 30 === 0;
    lines.push({
      id: `${websiteId}-${tick}`,
      at: new Date(tick * LOG_INTERVAL_MS).toISOString(),
      level: error ? "ERROR" : warning ? "WARN" : "INFO",
      method: "GET",
      path: error ? "/menu" : warning ? "/favicon.ico" : ["/", "/menu", "/about"][tick % 3],
      note: error ? "render timeout" : warning ? "page not found" : null,
      statusCode: error ? 500 : warning ? 404 : 200,
      durationMs: error ? 2500 : 25 + tick % 65,
    });
  }
  const logCounts = { INFO: 0, WARN: 0, ERROR: 0 };
  for (const line of lines) logCounts[line.level]++;
  const recent = lines.filter((line) => Date.parse(line.at) > now - 5 * 60_000);
  const errors5m = recent.filter((line) => line.level === "ERROR").length;
  return {
    lines,
    live: {
      ...live,
      logCounts,
      requests5m: recent.length,
      errors5m,
      errorRate5m: recent.length ? (errors5m / recent.length * 100).toFixed(2) : "0.00",
      avgResponseMs: recent.length
        ? Math.round(recent.reduce((sum, line) => sum + line.durationMs, 0) / recent.length)
        : 0,
    },
  };
}
