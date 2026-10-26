"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send2 as Rocket } from "iconsax-reactjs";
import { toast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import { deployPageAction } from "../../actions";
import type { PageData } from "../../types";

/** "Deploy" from Preview: publishes the saved draft that is on screen. */
export function DeployButton({ websiteId, data, domain }: { websiteId: string; data: PageData; domain: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      loading={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await deployPageAction(websiteId, data, crypto.randomUUID());
          if (!result.ok) {
            toast.error("Couldn't deploy", result.message);
            return;
          }
          toast.success("Website deployed", `Your changes are live at ${domain}.`);
          router.refresh();
        })
      }
    >
      {!pending && <Rocket />} Deploy
    </Button>
  );
}
