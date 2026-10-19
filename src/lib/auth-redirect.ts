const APP_ORIGIN = "https://devora.invalid";

export function getSafeCallbackUrl(candidate: string | null | undefined, fallback = "/dashboard"): string {
  if (!candidate?.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) {
    return fallback;
  }

  try {
    const url = new URL(candidate, APP_ORIGIN);
    if (url.origin !== APP_ORIGIN) {
      return fallback;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
