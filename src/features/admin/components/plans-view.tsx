import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  Box,
  Clock,
  DocumentText,
  Global,
  InfoCircle,
  Send2,
  TickCircle,
} from "iconsax-reactjs";
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
import { PLAN_LABEL, PLAN_SURFACE } from "./plan-styles";

// Free trial and Pro cards: a light plan-coloured border at rest (close to the neutral borders
// elsewhere), full strength on hover, press or keyboard focus. (The "Edit plan" popup keeps PLAN_SURFACE's border.)
const CARD_BORDER = {
  FREE_TRIAL:
    "border-primary/25 hover:border-primary/70 active:border-primary/70 focus-within:border-primary/70",
  PLUS: "",
  PRO: "border-gold-strong/25 hover:border-gold-strong/60 active:border-gold-strong/60 focus-within:border-gold-strong/60",
  ULTRA: "",
} satisfies Record<PlanCode, string>;

// "Edit plan" button: outlined for the free trial, filled in the plan colour otherwise.
const BUTTON = {
  FREE_TRIAL:
    "bg-background text-primary ring-1 ring-primary shadow-none hover:bg-primary-soft hover:shadow-none active:bg-brand-soft",
  PLUS: "",
  PRO: "bg-gold-strong hover:bg-gold active:bg-gold",
  ULTRA: "bg-violet hover:bg-violet/90 active:bg-violet",
} satisfies Record<PlanCode, string>;

const PRICE = {
  FREE_TRIAL: "text-primary",
  PLUS: "text-brand-strong",
  PRO: "text-gold",
  ULTRA: "text-violet",
} satisfies Record<PlanCode, string>;

const count = new Intl.NumberFormat("en-US");

type Feature = { icon: ReactNode; text: string };

/**
 * Card feature lines. Paid tiers after Plus start with "Everything in <previous>" and skip the
 * monitoring line when it is the same as the previous plan's.
 */
function features(plan: Plan, previous: Plan | undefined): Feature[] {
  const stacked = previous !== undefined && previous.code !== "FREE_TRIAL";
  const lines: (Feature | null)[] = [
    stacked
      ? { icon: <TickCircle />, text: `Everything in ${previous.name}` }
      : null,
    plan.trialDays
      ? { icon: <Clock />, text: `Free for ${plan.trialDays} days` }
      : null,
    {
      icon: <Global />,
      text:
        plan.websiteLimit === 1
          ? "1 website"
          : `Up to ${plan.websiteLimit} websites`,
    },
    { icon: <Send2 />, text: `${plan.redeploysPerMonth} redeploys a month` },
    {
      icon: <Box />,
      text: `Up to ${count.format(plan.productLimit)} products`,
    },
    stacked && previous.monitoring === plan.monitoring
      ? null
      : plan.monitoring === "Logs"
        ? { icon: <DocumentText className="text-gold-strong!" />, text: "Logs" }
        : { icon: <Activity />, text: plan.monitoring },
  ];
  return lines.filter((f) => f !== null);
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
          {plans.items.map((plan, index) => (
            <li
              key={plan.id}
              className={cn(
                "flex flex-col gap-4 rounded-[20px] border p-5 shadow-card transition-[border-color,box-shadow,transform] duration-200 ease-out hover:shadow-kpi motion-safe:hover:-translate-y-1 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.99] motion-safe:active:duration-100",
                PLAN_SURFACE[plan.code],
                CARD_BORDER[plan.code],
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <PlanBadge
                  plan={plan.code}
                  dot={false}
                  className={cn(
                    "font-semibold tracking-wide uppercase",
                    PLAN_LABEL[plan.code],
                  )}
                />
                {plan.mostPopular && (
                  <span className="rounded-full bg-gold-strong px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                    Most popular
                  </span>
                )}
              </div>
              <div className="border-b border-border pb-4">
                <p
                  className={cn(
                    "font-heading text-[32px] leading-none font-bold",
                    PRICE[plan.code],
                  )}
                >
                  {formatPriceShort(plan.priceMonthly, "USD")}
                  {plan.code !== "FREE_TRIAL" && (
                    <span className="ml-1 text-sm font-medium text-muted-foreground">
                      /mo
                    </span>
                  )}
                </p>
                <p className="mt-2 text-[13px] text-muted-foreground">
                  {plan.trialDays
                    ? `${plan.trialDays}-day trial`
                    : `${count.format(plan.subscriberCount)} subscribers`}
                </p>
              </div>
              <Button
                asChild
                size="sm"
                className={cn("w-full", BUTTON[plan.code])}
              >
                <Link
                  href={tableHref(searchParams, { edit: plan.id })}
                  scroll={false}
                >
                  Edit plan
                </Link>
              </Button>
              <ul className="space-y-2.5 text-[13px] text-foreground-soft">
                {features(plan, plans.items[index - 1]).map((f) => (
                  <li
                    key={f.text}
                    className="flex items-center gap-2.5 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-primary"
                  >
                    {f.icon}
                    {f.text}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <EditPlanDialog
          key={editing.id}
          plan={editing}
          closeHref={tableHref(searchParams, { edit: null })}
        />
      )}
    </>
  );
}
