"use client";

import { useRouter } from "next/navigation";
import { toast } from "@/components/common/toast";
import { startDeployAction } from "@/features/deploy/actions";

/**
 * Shared "Deploy" behaviour for the editor and the preview. The draft must already be saved. The backend
 * decides what is allowed, so this only follows its answer: the plans when the plan can't deploy,
 * the address picker for a first deploy, or the progress screen.
 */
export function useDeploy(websiteId: string): () => Promise<boolean> {
  const router = useRouter();

  return async function deploy() {
    const result = await startDeployAction(
      websiteId,
      null,
      crypto.randomUUID(),
    );
    if (!result.ok) {
      toast.error("Couldn’t deploy", result.message);
      return false;
    }
    const { data } = result;
    if (data.next === "PLANS")
      router.push(`/billing/plans?from=deploy&website=${websiteId}`);
    else if (data.next === "CHOOSE_DOMAIN")
      router.push(`/websites/${websiteId}/deploy`);
    else {
      if (data.kind === "REDEPLOY")
        toast.success("Redeploy started", "This takes about 2 minutes.");
      router.push(
        `/websites/${websiteId}/deploy?deployment=${data.deploymentId}`,
      );
    }
    return true;
  };
}
