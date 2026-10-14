import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthenticatedUser, prisma } = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  prisma: {
    favorite: {
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth-user", () => ({ getAuthenticatedUser }));
vi.mock("@/lib/prisma", () => ({ prisma }));

import { POST } from "@/app/api/favorites/route";

const favorite = {
  id: "favorite-1",
  userId: "user-1",
  name: "JSON Formatter",
  tool: "json",
  url: "/tools/json-formatter",
};

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/favorites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUser.mockResolvedValue({ user: { id: "user-1" } });
    prisma.favorite.findFirst.mockResolvedValue(null);
    prisma.favorite.create.mockResolvedValue(favorite);
    prisma.activityLog.create.mockResolvedValue({});
    prisma.$transaction.mockImplementation(async (operation) =>
      operation({
        favorite: { create: prisma.favorite.create },
        activityLog: { create: prisma.activityLog.create },
      }),
    );
  });

  it("rejects non-tool URLs", async () => {
    const response = await POST(
      makeRequest({ name: favorite.name, tool: favorite.tool, url: "https://example.com" }),
    );

    expect(response.status).toBe(400);
    expect(prisma.favorite.create).not.toHaveBeenCalled();
    expect(prisma.activityLog.create).not.toHaveBeenCalled();
  });

  it("logs the favorite once as part of the create transaction", async () => {
    const response = await POST(
      makeRequest({ name: favorite.name, tool: favorite.tool, url: favorite.url }),
    );

    expect(response.status).toBe(201);
    expect(prisma.$transaction).toHaveBeenCalledOnce();
    expect(prisma.activityLog.create).toHaveBeenCalledOnce();
    expect(prisma.activityLog.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        action: "favorite-added",
        title: "Saved JSON Formatter",
        description: "Added JSON Formatter to favorites.",
      },
    });
  });

  it("does not create another favorite or activity entry for an existing favorite", async () => {
    prisma.favorite.findFirst.mockResolvedValue(favorite);

    const response = await POST(
      makeRequest({ name: favorite.name, tool: favorite.tool, url: favorite.url }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.created).toBe(false);
    expect(prisma.favorite.create).not.toHaveBeenCalled();
    expect(prisma.activityLog.create).not.toHaveBeenCalled();
  });
});
