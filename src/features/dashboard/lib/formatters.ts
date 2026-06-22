const MINUTE_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatMinutes(value: number) {
  return MINUTE_FORMATTER.format(value);
}

export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function formatCallDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatCurrency(cents: number, currency = "usd") {
  if (currency.toLowerCase() !== "usd") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  }

  return CURRENCY_FORMATTER.format(cents / 100);
}

export function getGreeting(name: string | null) {
  const hour = new Date().getHours();

  if (hour < 12) {
    return `Good morning${name ? `, ${name.split(" ")[0]}` : ""}`;
  }

  if (hour < 18) {
    return `Good afternoon${name ? `, ${name.split(" ")[0]}` : ""}`;
  }

  return `Good evening${name ? `, ${name.split(" ")[0]}` : ""}`;
}

export function getSubscriptionStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}

export function getBillingStatusVariant(
  status: string | null | undefined,
): "default" | "secondary" | "destructive" | "outline" {
  if (!status) {
    return "outline";
  }

  const normalized = status.toLowerCase();

  if (["paid", "active", "trialing"].includes(normalized)) {
    return "default";
  }

  if (["open", "pending", "past_due", "unpaid"].includes(normalized)) {
    return "destructive";
  }

  return "secondary";
}
