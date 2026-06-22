import type { CallLogRecord } from "@/features/calls/types/call-logs.types";
import { CALL_LOG_CSV_COLUMNS } from "@/features/calls/types/call-logs.types";

function escapeCsvValue(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function callLogsToCsv(rows: CallLogRecord[]) {
  const header = CALL_LOG_CSV_COLUMNS.map((column) => column.header).join(",");
  const body = rows
    .map((row) =>
      CALL_LOG_CSV_COLUMNS.map((column) =>
        escapeCsvValue(row[column.key as keyof CallLogRecord]),
      ).join(","),
    )
    .join("\n");

  return `${header}\n${body}\n`;
}
