import assert from "node:assert/strict";
import { test } from "node:test";
import { mockLiveLogSnapshot, LOG_INTERVAL_MS, LOG_WINDOW_MS } from "../src/mocks/admin-live-logs.ts";

const now = Date.parse("2026-11-04T12:00:00Z");
const live = {
  liveSince: new Date(now - LOG_WINDOW_MS * 2).toISOString(),
  release: "R-1",
  previousRelease: null,
  requests5m: 96,
  errors5m: 1,
  errorRate5m: "1.04",
  avgResponseMs: 61,
  logCounts: { INFO: 94, WARN: 1, ERROR: 1 },
};

test("every filter count matches its actual current log rows", () => {
  const snapshot = mockLiveLogSnapshot("riverfish", live, now);
  for (const level of ["INFO", "WARN", "ERROR"]) {
    assert.equal(snapshot.live.logCounts[level], snapshot.lines.filter((line) => line.level === level).length);
    assert.ok(snapshot.live.logCounts[level] > 0);
  }
  assert.equal(snapshot.lines.length, Object.values(snapshot.live.logCounts).reduce((sum, count) => sum + count, 0));
  assert.equal(snapshot.live.requests5m, snapshot.lines.filter((line) => Date.parse(line.at) > now - 300_000).length);
  assert.ok(snapshot.lines.every((line) => Date.parse(line.at) <= now && Date.parse(line.at) > now - LOG_WINDOW_MS));
});

test("polling adds a new request, expires old logs, and preserves existing IDs", () => {
  const first = mockLiveLogSnapshot("riverfish", live, now);
  const next = mockLiveLogSnapshot("riverfish", live, now + LOG_INTERVAL_MS);
  assert.notEqual(first.lines[0].id, next.lines[0].id);
  assert.equal(first.lines[0].id, next.lines[1].id);
  assert.equal(first.lines.length, next.lines.length);
  assert.ok(!next.lines.some((line) => line.id === first.lines.at(-1).id));
});

test("healthy sites have no fabricated warnings or errors and logs start at go-live", () => {
  const snapshot = mockLiveLogSnapshot("healthy", {
    ...live,
    liveSince: new Date(now - LOG_INTERVAL_MS * 2).toISOString(),
    logCounts: { INFO: 10, WARN: 0, ERROR: 0 },
  }, now);
  assert.equal(snapshot.lines.length, 2);
  assert.ok(snapshot.lines.every((line) => line.level === "INFO"));
});
