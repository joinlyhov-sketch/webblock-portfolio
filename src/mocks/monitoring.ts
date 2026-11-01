import type { ActivityEvent, Deploy, DeployStatus, SiteStatus } from "@/features/monitoring/types";
import { NORTHPOINT_AUDIO_ID, PETAL_AND_STEM_ID } from "./session";
import { daysAgo, hoursAgo } from "./time";

const HOUR = 3_600_000;

// Kept on globalThis (like the websites) so a deploy made while the dev server runs survives hot reload.
const globalForMonitoring = globalThis as typeof globalThis & { __wbDeploys?: Deploy[]; __wbSiteStatus?: SiteStatus[] };

const maya = { fullName: "Maya Sok", initials: "MS" };
const sovannarith = { fullName: "Sovannarith Soeun", initials: "SV" };

type DeploySeed = [daysAgo: number, status: DeployStatus, durationSeconds: number, error?: string];

function toDeploys(websiteId: string, prefix: string, seeds: DeploySeed[]): Deploy[] {
  return seeds.map(([ago, status, durationSeconds, error], i) => {
    const finishedAt = new Date(Date.now() - ago * 24 * HOUR).toISOString();
    return {
      id: `${prefix}-${String(i + 1).padStart(12, "0")}`,
      websiteId,
      number: i + 1,
      startedBy: i % 3 === 2 ? sovannarith : maya,
      startedAt: new Date(new Date(finishedAt).getTime() - durationSeconds * 1000).toISOString(),
      finishedAt,
      durationSeconds,
      status,
      errorMessage: error ?? null,
    };
  });
}

/**
 * Oldest first. The owner's free trial started 5 days ago, so every deploy is newer than that:
 * Petal & Stem failed once (missing email), then went live; Northpoint Audio went live, then was suspended.
 */
export const deploys: Deploy[] = (globalForMonitoring.__wbDeploys ??= [
  ...toDeploys(PETAL_AND_STEM_ID, "d3a1e5c2-7b4f-4e8a-9c01", [
    [4, "FAILED", 64, "Business email is missing"],
    [0.08, "SUCCEEDED", 101],
  ]),
  ...toDeploys(NORTHPOINT_AUDIO_ID, "e4b2f6d3-8c5a-4f9b-8d02", [[4, "SUCCEEDED", 121]]),
]);

export const siteStatus: SiteStatus[] = (globalForMonitoring.__wbSiteStatus ??= [
  { websiteId: PETAL_AND_STEM_ID, online: true, uptimePercent: "99.98", checkedAt: hoursAgo(0.05) },
  { websiteId: NORTHPOINT_AUDIO_ID, online: false, uptimePercent: "86.40", checkedAt: hoursAgo(0.05) },
]);

let n = 0;
const event = (
  websiteId: string,
  type: ActivityEvent["type"],
  outcome: ActivityEvent["outcome"],
  title: string,
  occurredAt: string,
  detail: string | null = null,
): ActivityEvent => {
  n += 1;
  return { id: `f5c3a7e4-9d6b-4a0c-8e03-${String(n).padStart(12, "0")}`, websiteId, type, outcome, title, detail, occurredAt };
};

/** Newest first. Shown only on Pro and Ultra plans (the owner is on the free trial, so it stays hidden for now). */
export const activity: ActivityEvent[] = [
  event(NORTHPOINT_AUDIO_ID, "DEPLOY", "SUCCEEDED", "Deploy 1 succeeded", daysAgo(4)),
  event(NORTHPOINT_AUDIO_ID, "BUSINESS_INFO", "CHANGED", "Opening hours updated", daysAgo(4.1)),
  event(NORTHPOINT_AUDIO_ID, "PRODUCT", "CHANGED", "Product “Studio monitor pair” added", daysAgo(4.2)),
];
