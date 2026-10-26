"use client";

import { useState } from "react";
import Link from "next/link";
import { Add, DocumentText, TickCircle } from "iconsax-reactjs";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatDayMonthYear, formatPrice } from "@/lib/format";
import type { Subscription } from "../types";
import { BillingCard, CardHeader } from "./billing-card";

type PlanDetailsCardProps = {
  subscription: Subscription;
  daysLeft: number;
};

const percent = (used: number, limit: number) => (limit > 0 ? (used / limit) * 100 : 0);

/** Plan summary with usage bars. "View details" opens the full plan dialog. */
export function PlanDetailsCard({ subscription, daysLeft }: PlanDetailsCardProps) {
  const [open, setOpen] = useState(false);
  const paid = subscription.renewsAt !== null;
  const subtitle = paid
    ? `${subscription.planName} · ${formatPrice(subscription.monthlyPrice ?? "0", "USD")} / month`
    : `${subscription.planName} · ${subscription.trialDays} days`;

  return (
    <>
      <BillingCard className="justify-between">
        <CardHeader
          tone="brand"
          icon={<DocumentText />}
          title="Plan details"
          description={subtitle}
          action={
            <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
              View details
            </Button>
          }
        />
        <ul className="flex flex-col gap-[11px]">
          {subscription.usage.map((metric) => (
            <li key={metric.key} className="flex flex-col gap-1.5">
              <div className="flex items-start justify-between text-[12.5px]">
                <span className="text-muted-foreground">{metric.cardLabel}</span>
                <span className="text-muted-foreground tabular-nums">
                  <span className="font-medium text-foreground">{metric.used}</span> / {metric.limit}
                </span>
              </div>
              <Progress value={percent(metric.used, metric.limit)} label={`${metric.cardLabel} used`} />
            </li>
          ))}
        </ul>
      </BillingCard>

      <PlanDetailsDialog
        open={open}
        onClose={() => setOpen(false)}
        subscription={subscription}
        daysLeft={daysLeft}
      />
    </>
  );
}

function PlanDetailsDialog({
  open,
  onClose,
  subscription,
  daysLeft,
}: PlanDetailsCardProps & { open: boolean; onClose: () => void }) {
  const paid = subscription.renewsAt !== null;
  const price = formatPrice(subscription.monthlyPrice ?? "0", "USD");
  const planLower = subscription.planName.toLowerCase();
  const endDate = formatDayMonthYear(subscription.renewsAt ?? subscription.trialEndsAt);
  const startDay = formatDayMonthYear(subscription.trialStartsAt).replace(/ \d{4}$/, "");
  const daysText = `${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`;

  const rows: [string, string][] = paid
    ? [
        ["Plan", subscription.planName],
        ["Price", `${price} / month`],
        ["Renews on", endDate],
        ["Time left", daysText],
      ]
    : [
        ["Trial period", `${startDay} – ${endDate}`],
        ["Trial ends", daysText],
        ["Price", "Free"],
        ["After the trial", "Choose Plus, Pro or Ultra"],
      ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      label={paid ? `Your ${planLower} plan` : `Your ${planLower}`}
      className="max-w-[520px] rounded-[18px] shadow-dialog"
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col gap-5 overflow-y-auto px-7 pt-7 pb-6">
        <div className="flex items-center gap-3.5">
          <span className="inline-flex h-11 items-center rounded-xl bg-linear-[160.66deg,var(--color-plan-from)_0%,var(--color-plan-to)_71.429%] px-3.5 font-heading text-[17px] font-semibold whitespace-nowrap text-primary-foreground">
            {subscription.planName}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h2 className="text-xl font-semibold">{paid ? `Your ${planLower} plan` : `Your ${planLower}`}</h2>
            <p className="text-[13px] text-muted-foreground">
              {paid ? `${price} / month` : `Free for ${subscription.trialDays} days · No payment needed`}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-panel text-muted-foreground outline-none transition-colors hover:bg-primary-soft hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <Add aria-hidden className="size-[18px] rotate-45" />
          </button>
        </div>
        <hr className="border-border" />

        <section className="flex flex-col gap-2.5">
          <h3 className="font-sans text-[11px] font-semibold tracking-[0.66px] text-placeholder uppercase">Billing</h3>
          <dl className="flex flex-col gap-3 rounded-xl border border-border bg-panel px-[18px] py-4 text-[13px]">
            {rows.map(([term, value]) => (
              <div key={term} className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">{term}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="font-sans text-[11px] font-semibold tracking-[0.66px] text-placeholder uppercase">
            {paid ? "Usage this month" : "Usage during trial"}
          </h3>
          <ul className="flex flex-col gap-3">
            {subscription.usage.map((metric) => (
              <li key={metric.key} className="flex flex-col gap-1.5">
                <div className="flex items-start justify-between text-[13px]">
                  <span className="font-medium">{metric.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {metric.used} of {metric.limit}
                  </span>
                </div>
                <Progress variant="solid" value={percent(metric.used, metric.limit)} label={`${metric.label} used`} />
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="font-sans text-[11px] font-semibold tracking-[0.66px] text-placeholder uppercase">
            What’s included
          </h3>
          <ul className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
            {subscription.includes.map((item) => (
              <li key={item} className="flex items-center gap-2 text-[13px]">
                <TickCircle aria-hidden className="size-4 shrink-0 text-brand" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <hr className="border-border" />
        <div className="flex items-center justify-end gap-2.5">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button asChild size="sm">
            <Link href="/billing/plans?from=settings">{paid ? "Change plan" : "Choose a plan"}</Link>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
