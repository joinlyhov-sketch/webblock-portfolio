import type { Page } from "@/lib/api/types";
import { plans } from "@/mocks/plans";
import type { Plan } from "./types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Public plan list for the pricing section, cheapest first. Spring: `GET /plans`. */
export async function listPublicPlans(): Promise<Page<Plan>> {
  await delay(250);
  return { items: plans, page: 0, size: plans.length, totalItems: plans.length };
}
