import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthenticatedUser, prisma } = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  prisma: {
    activityLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth-user", () => ({ getAuthenticatedUser }));
vi.mock("@/lib/prisma", () => ({ prisma }));

import { POST } from "@/app/api/history/route";

function makeRequest(body: string) {
  return new Request("http://localhost/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("POST /api/history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUser.mockResolvedValue({ user: { id: "user-1" } });
    prisma.activityLog.create.mockResolvedValue({ id: "activity-1" });
  });

  it("rejects malformed JSON with a client error", async () => {
    const response = await POST(makeRequest("{invalid"));

    expect(response.status).toBe(400);
    expect(prisma.activityLog.create).not.toHaveBeenCalled();
  });

  it("rejects invalid entry values and oversized fields", async () => {
    const invalidAction = await POST(
      makeRequest(JSON.stringify({ action: "not allowed", title: "Tool run" })),
    );
    const oversizedTitle = await POST(
      makeRequest(JSON.stringify({ title: "x".repeat(161) })),
    );
    const oversizedDescription = await POST(
      makeRequest(JSON.stringify({ description: "x".repeat(1001) })),
    );

    expect(invalidAction.status).toBe(400);
    expect(oversizedTitle.status).toBe(400);
    expect(oversizedDescription.status).toBe(400);
    expect(prisma.activityLog.create).not.toHaveBeenCalled();
  });

  it("stores a valid activity with defaults and trimmed user content", async () => {
    const response = await POST(
      makeRequest(
        JSON.stringify({
          action: "used-tool",
          title: "  Formatted JSON  ",
          description: "  Ran the JSON formatter.  ",
        }),
      ),
    );

    expect(response.status).toBe(201);
    expect(prisma.activityLog.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        action: "used-tool",
        title: "Formatted JSON",
        description: "Ran the JSON formatter.",
      },
    });
  });
});
