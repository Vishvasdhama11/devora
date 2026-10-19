import { describe, expect, it } from "vitest";

import {
  isProjectStatus,
  parseProjectDate,
  parseProjectUrl,
} from "@/lib/project-fields";

describe("project fields", () => {
  it("parses optional due dates and rejects invalid dates", () => {
    expect(parseProjectDate(null)).toBeNull();
    expect(parseProjectDate("2026-12-31")).toBeInstanceOf(Date);
    expect(parseProjectDate("not a date")).toBeUndefined();
    expect(parseProjectDate("2026-02-30")).toBeUndefined();
  });

  it("accepts only HTTP(S) project links", () => {
    expect(parseProjectUrl("https://github.com/example/project")).toBe(
      "https://github.com/example/project",
    );
    expect(parseProjectUrl("javascript:alert(1)")).toBeUndefined();
    expect(parseProjectUrl("invalid")).toBeUndefined();
  });

  it("validates the supported project statuses", () => {
    expect(isProjectStatus("active")).toBe(true);
    expect(isProjectStatus("completed")).toBe(true);
    expect(isProjectStatus("in-progress")).toBe(false);
  });
});
