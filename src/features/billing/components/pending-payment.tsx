"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { PaymentOrder } from "../types";
import { KhqrPanel, PaymentCardHeader, PaymentProgress, StatePill } from "./payment-parts";

const POLL_MS = 3000;
const EXPIRING_MS = 60_000;

/** 09:42 while there is time, 0:45 in the last minute. */
function clock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return total >= 60 ? `${String(minutes).padStart(2, "0")}:${seconds}` : `${minutes}:${seconds}`;
}

/**
 * Waiting-for-payment card. The countdown is only a display of `expiresAt`; the status itself
 * belongs to the API, so the card re-reads the page every few seconds and the server swaps in the
 * Paid or Expired view when the API says so.
 */
export function PendingPayment({
  order,
  remainingMs,
  totalMs,
  children,
}: {
  order: PaymentOrder;
  remainingMs: number;
  totalMs: number;
  /** The right-hand summary, rendered on the server. */
  children: ReactNode;
}) {
  const router = useRouter();
  const [left, setLeft] = useState(remainingMs);

  useEffect(() => {
    const deadline = Date.now() + remainingMs;
    const tick = setInterval(() => setLeft(Math.max(0, deadline - Date.now())), 1000);
    const poll = setInterval(() => router.refresh(), POLL_MS);
    return () => {
      clearInterval(tick);
      clearInterval(poll);
    };
  }, [remainingMs, router]);

  const expiring = left < EXPIRING_MS;

  return (
    <>
      <PaymentCardHeader
        order={order}
        aside={
          <StatePill tone={expiring ? "warning" : "brand"}>
            Code expires in <span className="font-bold">{clock(left)}</span>
          </StatePill>
        }
      />
      <PaymentProgress percent={(left / totalMs) * 100} />
      <div className="flex items-start gap-3 bg-background p-4">
        <KhqrPanel order={order} state={expiring ? "expiring" : "waiting"} />
        {children}
      </div>
    </>
  );
}
