import Link from "next/link";
import { ArrowLeft, Box, Chart, Clock, Global, InfoCircle, Refresh2 } from "iconsax-reactjs";
import { Callout } from "@/components/common/callout";
import { PlanBadge } from "@/components/common/plan-badge";
import { Button } from "@/components/ui/button";
import type { Page } from "@/lib/api/types";
import { formatPriceShort } from "@/lib/format";
import { tableHref, type SearchParams } from "@/lib/table-query";
import { cn } from "@/lib/utils";
import type { Plan, PlanCode } from "../types";
import { AdminPageHeader } from "./admin-page-header";
import { EditPlanDialog } from "./edit-plan-dialog";

const CARD = {
  FREE_TRIAL: "border-primary bg-background",
  PLUS: "border-border bg-primary-soft/60",
  PRO: "border-gold-strong/50 bg-gold-soft/60",
  ULTRA: "border-border bg-violet-soft/60",
} satisfies Record<PlanCode, string>;

const PRICE = {
  FREE_TRIAL: "text-brand",
  PLUS: "text-brand",
  PRO: "text-gold",
  ULTRA: "text-violet",
} satisfies Record<PlanCode, string>;

const count = new Intl.NumberFormat("en-US");

function features(plan: Plan) {
  return [
    plan.trialDays ? { icon: <Clock />, text: `Free for ${plan.trialDays} days` } : null,
    { icon: <Global />, text: plan.websiteLimit === 1 ? "1 website" : `Up to ${plan.websiteLimit} websites` },
    { icon: <Refresh2 />, text: `${plan.redeploysPerMonth} redeploys a month` },
    { icon: <Box />, text: `Up to ${count.format(plan.productLimit)} products` },
    { icon: <Chart />, text: plan.monitoring },
  ].filter((f) => f !== null);
}

export function PlansView({
  plans,
  searchParams,
  editing,
}: {
  plans: Page<Plan>;
  searchParams: SearchParams;
  /** The plan opened with `?edit=<planId>`. */
  editing: Plan | null;
}) {
  return (
    <>
      <AdminPageHeader
        title="Manage plans"
        description="Set the price and limits of each plan. They apply to every account on that plan."
      />

      <Link
        href="/admin/subscriptions"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-foreground-soft hover:text-primary"
      >
        <ArrowLeft aria-hidden className="size-4" />
        All subscriptions
      </Link>

      <Callout
        className="mb-5"
        icon={<InfoCircle />}
        title="Changes apply to new subscriptions and renewals. Current subscribers keep their price until their next renewal. Billing stays monthly only."
      />

      {plans.items.length === 0 ? (
        <p className="rounded-[20px] border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
          No plans are set up yet.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {plans.items.map((plan) => (
            <li
              key={plan.id}
              className={cn("flex flex-col gap-4 rounded-[20px] border p-5 shadow-card", CARD[plan.code])}
            >
              <div className="flex items-center justify-between gap-2">
                <PlanBadge plan={plan.code} className="uppercase tracking-wide" />
                {plan.mostPopular && (
                  <span className="rounded-full bg-gold-strong px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                    Most popular
                  </span>
                )}
              </div>
              <div className="border-b border-border pb-4">
                <p className={cn("font-heading text-[32px] leading-none font-bold", PRICE[plan.code])}>
                  {formatPriceShort(plan.priceMonthly, "USD")}
                  {plan.code !== "FREE_TRIAL" && <span className="ml-1 text-sm font-medium text-muted-foreground">/mo</span>}
                </p>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  {plan.trialDays ? `${plan.trialDays}-day trial` : `${count.format(plan.subscriberCount)} subscribers`}
                </p>
              </div>
              <Button asChild variant={plan.mostPopular ? "primary" : "secondary"} className="w-full">
                <Link href={tableHref(searchParams, { edit: plan.id })} scroll={false}>
                  Edit plan
                </Link>
              </Button>
              <ul className="space-y-2.5 text-[13px] text-foreground-soft">
                {features(plan).map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground">
                    {f.icon}
                    {f.text}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {editing && <EditPlanDialog key={editing.id} plan={editing} closeHref={tableHref(searchParams, { edit: null })} />}
    </>
  );
}
