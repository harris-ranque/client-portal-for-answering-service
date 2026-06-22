export {
  formatCurrency,
  getBillingStatusVariant,
  getSubscriptionStatusLabel,
} from "@/features/dashboard/lib/formatters";

export function formatBillingDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatBillingPeriod(start: string | null, end: string | null) {
  if (!start || !end) {
    return "—";
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${formatter.format(new Date(start))} – ${formatter.format(new Date(end))}`;
}
