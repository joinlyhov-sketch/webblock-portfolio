import { PaymentSummary, PaymentCardHeader, PaymentProgress, KhqrPanel, PaymentSuccessPanel, StatePill } from "./payment-parts";
import { Lock1 } from "iconsax-reactjs";
import { BillingBackdrop, BillingContent, BillingScreen, BillingTitle, BillingTopBar } from "./billing-shell";
import { PendingPayment } from "./pending-payment";
import type { PaymentView as PaymentData } from "@/service/billing-service";

/** Payment screen: waiting for payment, paid, or code expired. The API decides which. */
export function PaymentView({ view }: { view: PaymentData }) {
  const { order } = view;
  return (
    <BillingScreen>
      <BillingTopBar backHref={view.backHref} backLabel={view.backLabel} />
      <BillingBackdrop variant="payment" />
      <BillingContent>
        <BillingTitle eyebrow="Secure payment" icon={<Lock1 aria-hidden />} title="Payment" subtitle={view.subtitle} />
        <div className="mt-10 w-[960px] max-w-full overflow-hidden rounded-[32px] border border-border bg-background shadow-payment-card">
          {order.status === "PENDING" ? (
            <PendingPayment order={order} remainingMs={view.remainingMs} totalMs={view.totalMs}>
              <PaymentSummary order={order} />
            </PendingPayment>
          ) : order.status === "PAID" ? (
            <>
              <PaymentCardHeader order={order} aside={<StatePill tone="success">Paid</StatePill>} />
              <PaymentProgress percent={100} paid />
              <div className="flex items-start gap-3 bg-background p-4">
                <PaymentSuccessPanel order={order} />
                <PaymentSummary order={order} />
              </div>
            </>
          ) : (
            <>
              <PaymentCardHeader order={order} aside={<StatePill tone="danger">Code expired</StatePill>} />
              <PaymentProgress percent={0} />
              <div className="flex items-start gap-3 bg-background p-4">
                <KhqrPanel order={order} state="expired" />
                <PaymentSummary order={order} />
              </div>
            </>
          )}
        </div>
        <p className="flex items-center justify-center gap-1.5 pt-8 text-[13px] leading-[19.5px] text-muted-foreground">
          <Lock1 aria-hidden className="size-3.5" /> Payments are confirmed by your bank. We never see your banking details.
        </p>
      </BillingContent>
    </BillingScreen>
  );
}
