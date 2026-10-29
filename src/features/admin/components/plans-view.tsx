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
  MagicStar,
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

// "Edit plan" button, glass style: a see-through plan-coloured fill that deepens towards the
// bottom, a bright inner rim, a soft glow under it, and a light that runs round its edge on hover
// (`border-beam` in globals.css). GLASS_BUTTON is shared; BUTTON adds the plan colour.
const GLASS_BUTTON =
  "bg-transparent bg-linear-to-b text-primary-foreground ring-1 inset-ring-1 inset-ring-background/40 backdrop-blur-md hover:bg-transparent hover:brightness-110 active:bg-transparent active:brightness-95";

const BUTTON = {
  FREE_TRIAL:
    "from-primary/70 to-primary ring-primary/30 shadow-[0_8px_18px_-8px_var(--color-primary)] [--beam-color:var(--color-primary)]",
  PLUS: "from-brand/70 to-brand ring-brand/30 shadow-[0_8px_18px_-8px_var(--color-brand)] [--beam-color:var(--color-brand)]",
  PRO: "from-gold-strong/70 to-gold-strong ring-gold-strong/30 shadow-[0_8px_18px_-8px_var(--color-gold-strong)] [--beam-color:var(--color-gold-strong)]",
  ULTRA:
    "from-violet/70 to-violet ring-violet/30 shadow-[0_8px_18px_-8px_var(--color-violet)] [--beam-color:var(--color-violet)]",
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
                "relative isolate flex flex-col gap-4 overflow-hidden rounded-[20px] border p-5 shadow-card inset-ring-1 inset-ring-background/80 transition-[border-color,box-shadow,transform] duration-200 ease-out hover:shadow-kpi motion-safe:hover:-translate-y-1 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.99] motion-safe:active:duration-100",
                PLAN_SURFACE[plan.code],
                CARD_BORDER[plan.code],
              )}
            >
              {/* Glass glint: a soft white streak sweeps across every few seconds, each card a beat after the last. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-1/3 bg-linear-to-r from-transparent via-background/90 to-transparent opacity-0 motion-safe:animate-glass-shine"
                style={{ animationDelay: `${index * 0.6}s` }}
              />
              {/* Glass sheen on the top edge. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/3 bg-linear-to-b from-background/70 to-transparent"
              />
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
                  <span className="relative isolate overflow-hidden rounded-full bg-gold-strong px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                    {/* Same glint, quicker and brighter, on the badge. */}
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 -z-10 w-1/2 bg-linear-to-r from-transparent via-background/60 to-transparent opacity-0 motion-safe:animate-glass-shine [animation-duration:3s]"
                    />
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
                size="md"
                className={cn(
                  "w-full border-beam",
                  GLASS_BUTTON,
                  BUTTON[plan.code],
                )}
              >
                <Link
                  href={tableHref(searchParams, { edit: plan.id })}
                  scroll={false}
                >
                  {/* Glass sheen on the top half. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-2 top-0.5 h-1/2 rounded-full bg-linear-to-b from-background/40 to-transparent"
                  />
                  <MagicStar aria-hidden variant="Bold" className="opacity-90" />
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
