import { describe, expect, it } from "vitest";

import { formatDateOnly } from "@/lib/date-format";

describe("formatDateOnly", () => {
  it("formats date-only values without shifting the calendar day", () => {
    expect(formatDateOnly("2026-10-19T00:00:00.000Z")).toMatch(/Oct 19, 2026/);
  });
});
