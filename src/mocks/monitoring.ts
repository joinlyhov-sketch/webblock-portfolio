import type { ActivityEvent, Deploy, DeployStatus, PlanUsage, SiteStatus } from "@/features/monitoring/types";
import { NORTHPOINT_AUDIO_ID, PETAL_AND_STEM_ID } from "./session";
import { daysAgo, daysFromNow, hoursAgo } from "./time";

const HOUR = 3_600_000;

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

/** Oldest first. Petal & Stem: 10 deploys, 2 failed (the Figma "Monitor" numbers). */
export const deploys: Deploy[] = [
  ...toDeploys(PETAL_AND_STEM_ID, "d3a1e5c2-7b4f-4e8a-9c01", [
    [38, "SUCCEEDED", 112],
    [33, "SUCCEEDED", 97],
    [27, "FAILED", 64, "Image “hero-banner.png” is over 10 MB"],
    [22, "SUCCEEDED", 104],
    [19, "FAILED", 58, "Business email is missing"],
    [16, "SUCCEEDED", 112],
    [9, "SUCCEEDED", 104],
    [6, "FAILED", 69, "Image “spring-tulips.jpg” is over 10 MB"],
    [5, "SUCCEEDED", 98],
    [2, "SUCCEEDED", 101],
  ]),
  ...toDeploys(NORTHPOINT_AUDIO_ID, "e4b2f6d3-8c5a-4f9b-8d02", [
    [61, "SUCCEEDED", 121],
    [44, "SUCCEEDED", 95],
    [30, "FAILED", 41, "The build timed out. Try again in a few minutes."],
    [29, "SUCCEEDED", 99],
  ]),
];

export const siteStatus: SiteStatus[] = [
  { websiteId: PETAL_AND_STEM_ID, online: true, uptimePercent: "99.98", checkedAt: hoursAgo(0.05) },
  { websiteId: NORTHPOINT_AUDIO_ID, online: false, uptimePercent: "86.40", checkedAt: hoursAgo(0.05) },
];

/** Plan limits per website. "products" usage is counted live from the products store. */
export const planUsage: (PlanUsage & { websiteId: string })[] = [
  {
    websiteId: PETAL_AND_STEM_ID,
    plan: "PLUS",
    planName: "Plus",
    resetsAt: daysFromNow(5),
    metrics: [
      { key: "products", label: "Products", cardLabel: "Products", used: 0, limit: 30 },
      { key: "redeploys", label: "Redeploys", cardLabel: "Redeploys this month", used: 5, limit: 5 },
      { key: "websites", label: "Websites", cardLabel: "Websites", used: 1, limit: 1 },
    ],
  },
  {
    websiteId: NORTHPOINT_AUDIO_ID,
    plan: "PRO",
    planName: "Pro",
    resetsAt: daysFromNow(5),
    metrics: [
      { key: "products", label: "Products", cardLabel: "Products", used: 0, limit: 200 },
      { key: "redeploys", label: "Redeploys", cardLabel: "Redeploys this month", used: 5, limit: 30 },
      { key: "websites", label: "Websites", cardLabel: "Websites", used: 1, limit: 3 },
    ],
  },
];

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

/** Newest first. Only Pro and Ultra websites have an activity log. */
export const activity: ActivityEvent[] = [
  event(NORTHPOINT_AUDIO_ID, "DEPLOY", "SUCCEEDED", "Deploy 4 succeeded", daysAgo(29)),
  event(NORTHPOINT_AUDIO_ID, "PRODUCT", "CHANGED", "Product “Studio monitor pair” added", daysAgo(29.2)),
  event(NORTHPOINT_AUDIO_ID, "DEPLOY", "FAILED", "Deploy 3 failed", daysAgo(30), "The build timed out. Try again in a few minutes."),
  event(NORTHPOINT_AUDIO_ID, "BUSINESS_INFO", "CHANGED", "Opening hours updated", daysAgo(31)),
  event(NORTHPOINT_AUDIO_ID, "DEPLOY", "SUCCEEDED", "Deploy 2 succeeded", daysAgo(44)),
  event(NORTHPOINT_AUDIO_ID, "PRODUCT", "CHANGED", "Product “Wireless headphones” price changed", daysAgo(45)),
  event(NORTHPOINT_AUDIO_ID, "DEPLOY", "SUCCEEDED", "Deploy 1 succeeded", daysAgo(61)),
];
