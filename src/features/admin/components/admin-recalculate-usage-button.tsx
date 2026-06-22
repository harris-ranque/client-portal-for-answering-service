"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { recalculateUsageAction } from "@/features/admin/actions/usage-actions";
import { Button } from "@/components/ui/button";

export function AdminRecalculateUsageButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await recalculateUsageAction();

          if (result.error) {
            toast.error(result.error);
            return;
          }

          toast.success(result.message ?? "Usage metrics recalculated.");
        });
      }}
    >
      {isPending ? "Recalculating..." : "Recalculate usage"}
    </Button>
  );
}
