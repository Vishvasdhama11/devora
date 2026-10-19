import { describe, expect, it } from "vitest";

import { getSafeCallbackUrl } from "@/lib/auth-redirect";

describe("getSafeCallbackUrl", () => {
  it("preserves a safe local path and its query string", () => {
    expect(getSafeCallbackUrl("/dashboard?tab=workspaces#recent")).toBe("/dashboard?tab=workspaces#recent");
  });

  it("uses the fallback for external and malformed callback URLs", () => {
    expect(getSafeCallbackUrl("https://example.com")).toBe("/dashboard");
    expect(getSafeCallbackUrl("//example.com")).toBe("/dashboard");
    expect(getSafeCallbackUrl("/\\example.com")).toBe("/dashboard");
    expect(getSafeCallbackUrl(null, "/")).toBe("/");
  });
});
