export function formatDateOnly(value: Date | string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}
