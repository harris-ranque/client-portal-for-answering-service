const MINUTE_FORMATTER = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

export function formatMinutes(value: number) {
  return MINUTE_FORMATTER.format(value);
}

export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function formatAverageDuration(seconds: number) {
  if (seconds <= 0) {
    return "0:00";
  }

  return formatDuration(seconds);
}
