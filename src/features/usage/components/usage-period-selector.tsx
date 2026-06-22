"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PERIOD_OPTIONS = [
  { value: "6", label: "6 months" },
  { value: "12", label: "12 months" },
  { value: "24", label: "24 months" },
] as const;

interface UsagePeriodSelectorProps {
  months: number;
}

export function UsagePeriodSelector({ months }: UsagePeriodSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("months", event.target.value);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className={cn("flex items-center gap-3", isPending && "opacity-70")}>
      <Label htmlFor="months" className="text-sm text-muted-foreground">
        Show
      </Label>
      <select
        id="months"
        name="months"
        value={String(months)}
        onChange={handleChange}
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
      >
        {PERIOD_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
