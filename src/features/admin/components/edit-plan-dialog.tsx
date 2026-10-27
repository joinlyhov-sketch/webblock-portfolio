"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/common/modal";
import { PlanBadge } from "@/components/common/plan-badge";
import { toast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/lib/actions/result";
import { formatPrice } from "@/lib/format";
import { updatePlanAction } from "../actions";
import type { Plan } from "../types";

const FORM_ID = "edit-plan-form";

/** "Edit Pro plan" popup. Opened with `?edit=<planId>`; saving or closing goes back to the plans. */
export function EditPlanDialog({ plan, closeHref }: { plan: Plan; closeHref: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    updatePlanAction.bind(null, plan.id),
    null,
  );
  const [price, setPrice] = useState(plan.priceMonthly);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(`${plan.name} plan saved`, state.message);
      router.push(closeHref, { scroll: false });
    } else if (!state.fieldErrors) {
      toast.error("Couldn't save the plan", state.message);
    }
  }, [state, plan.name, closeHref, router]);

  const errors = state?.ok === false ? state.fieldErrors : undefined;
  const values = state?.ok === false ? state.values : undefined;
  const diff = Number(price) - Number(plan.priceMonthly);
  const priceChanged = price.trim() !== "" && !Number.isNaN(diff) && Math.abs(diff) >= 0.005;

  return (
    <Modal
      title={`Edit ${plan.name} plan`}
      description={`${plan.subscriberCount.toLocaleString("en-US")} subscribers`}
      closeHref={closeHref}
      footer={
        <>
          <Button asChild variant="secondary">
            <a
              href={closeHref}
              onClick={(e) => {
                e.preventDefault();
                router.push(closeHref, { scroll: false });
              }}
            >
              Cancel
            </a>
          </Button>
          <Button type="submit" form={FORM_ID} loading={pending}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="mt-3 flex gap-1.5">
        <PlanBadge plan={plan.code} />
        {plan.mostPopular && (
          <span className="inline-flex h-6 items-center rounded-full bg-gold-strong px-2.5 text-xs font-medium text-primary-foreground">
            Most popular
          </span>
        )}
      </div>

      <form id={FORM_ID} action={formAction} noValidate className="mt-5 space-y-4 border-t border-border pt-5 pb-6">
        <Field label="Price per month" name="priceMonthly" errors={errors?.priceMonthly}>
          {(props) => (
            <div className="relative">
              <span aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                {...props}
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-7"
              />
            </div>
          )}
        </Field>
        {priceChanged && !errors?.priceMonthly && (
          <p className="-mt-2.5 text-xs text-brand" aria-live="polite">
            Unsaved · was {formatPrice(plan.priceMonthly, "USD")} ({diff > 0 ? "+" : "−"}
            {formatPrice(Math.abs(diff).toFixed(2), "USD")})
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Websites" name="websiteLimit" errors={errors?.websiteLimit}>
            {(props) => <Input {...props} inputMode="numeric" defaultValue={values?.websiteLimit ?? plan.websiteLimit} />}
          </Field>
          <Field label="Redeploys a month" name="redeploysPerMonth" errors={errors?.redeploysPerMonth}>
            {(props) => (
              <Input {...props} inputMode="numeric" defaultValue={values?.redeploysPerMonth ?? plan.redeploysPerMonth} />
            )}
          </Field>
          <Field label="Products" name="productLimit" errors={errors?.productLimit}>
            {(props) => <Input {...props} inputMode="numeric" defaultValue={values?.productLimit ?? plan.productLimit} />}
          </Field>
        </div>

        <Field label="Monitoring" name="monitoring" errors={errors?.monitoring}>
          {(props) => <Input {...props} defaultValue={values?.monitoring ?? plan.monitoring} />}
        </Field>

        <p className="text-xs text-muted-foreground">
          Changes apply to new subscriptions and renewals. Current subscribers keep their price until their next renewal.
        </p>
      </form>
    </Modal>
  );
}

type FieldProps = {
  id: string;
  name: string;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
};

function Field({
  label,
  name,
  errors,
  children,
}: {
  label: string;
  name: string;
  errors?: string[];
  children: (props: FieldProps) => ReactNode;
}) {
  const id = `plan-${name}`;
  const errorId = `${id}-error`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-semibold text-foreground">
        {label}
      </label>
      {children({ id, name, "aria-invalid": Boolean(errors?.length), "aria-describedby": errors?.length ? errorId : undefined })}
      {errors?.length ? (
        <p id={errorId} className="text-xs text-danger">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}
