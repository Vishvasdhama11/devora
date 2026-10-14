import { describe, expect, it } from "vitest";

import { cn, formatDate } from "@/lib/utils";

describe("utility helpers", () => {
  it("merges class names without duplicates", () => {
    expect(cn("px-2", "px-4", "text-white")).toContain("px-4");
    expect(cn("text-white", "text-black")).toContain("text-black");
  });

  it("formats a date consistently", () => {
    const value = formatDate("2024-01-15T12:00:00.000Z");
    expect(value).toContain("Jan");
    expect(value).toContain("2024");
  });
});
