export function indexLatestByCompanyId<T extends { company_id: string; created_at: string }>(
  rows: readonly T[],
): Map<string, T> {
  const latestByCompany = new Map<string, T>();

  for (const row of rows) {
    const existing = latestByCompany.get(row.company_id);

    if (!existing || row.created_at > existing.created_at) {
      latestByCompany.set(row.company_id, row);
    }
  }

  return latestByCompany;
}

export function indexByCompanyId<T extends { company_id: string }>(
  rows: readonly T[],
): Map<string, T> {
  return new Map(rows.map((row) => [row.company_id, row]));
}

export function findMetricForPeriod<T extends { period_start: string; period_end: string }>(
  metrics: readonly T[],
  periodStart: string,
  periodEnd: string,
): T | null {
  return (
    metrics.find(
      (metric) => metric.period_start === periodStart && metric.period_end === periodEnd,
    ) ?? null
  );
}
