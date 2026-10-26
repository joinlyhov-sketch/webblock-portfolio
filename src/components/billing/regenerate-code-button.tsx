"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { regeneratePaymentAction } from "@/actions/billing-actions";
import { toast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";

/** "Generate new code" on an expired payment: asks the API for a fresh KHQR and opens it. */
export function RegenerateCodeButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function regenerate() {
    startTransition(async () => {
      const result = await regeneratePaymentAction(orderId);
      if (!result.ok) {
        toast.error("Could not create a new code", result.message);
        return;
      }
      router.push(`/billing/pay/${result.data.orderId}`);
    });
  }

  return (
    <Button onClick={regenerate} loading={pending}>
      Generate new code
    </Button>
  );
}
