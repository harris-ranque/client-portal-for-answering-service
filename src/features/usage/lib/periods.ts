export function getCurrentMonthBounds() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export function formatPeriodLabel(periodStart: string) {
  return new Date(periodStart).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

export function formatPeriodRange(periodStart: string, periodEnd: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${formatter.format(new Date(periodStart))} – ${formatter.format(new Date(periodEnd))}`;
}
