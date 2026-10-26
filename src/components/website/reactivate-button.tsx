"use client";

import { useTransition } from "react";
import { Refresh2 } from "iconsax-reactjs";
import { reactivateWebsiteAction } from "@/actions/website-actions";
import { toast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReactivateButton({
  websiteId,
  variant = "primary",
}: {
  websiteId: string;
  variant?: "primary" | "secondary";
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant={variant}
      loading={pending}
      className={cn("flex-1", variant === "primary" && "bg-primary hover:bg-brand")}
      onClick={() =>
        startTransition(async () => {
          const result = await reactivateWebsiteAction(websiteId);
          if (result.ok) toast.success(result.message ?? "Website reactivated");
          else toast.error("Could not reactivate the website", result.message);
        })
      }
    >
      {variant === "primary" && <Refresh2 aria-hidden />} Reactivate
    </Button>
  );
}
