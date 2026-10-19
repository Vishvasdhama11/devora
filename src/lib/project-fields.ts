export const PROJECT_STATUSES = ["active", "paused", "completed"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export function parseProjectDate(value: unknown): Date | null | undefined {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    date.toISOString().slice(0, 10) !== value
  ) {
    return undefined;
  }
  return date;
}

export function parseProjectUrl(value: unknown): string | null | undefined {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value !== "string" || value.length > 2048) {
    return undefined;
  }
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") &&
      !url.username &&
      !url.password
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export function isProjectStatus(value: unknown): value is ProjectStatus {
  return PROJECT_STATUSES.some((status) => status === value);
}
