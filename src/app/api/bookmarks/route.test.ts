import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthenticatedUser, prisma } = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  prisma: {
    bookmark: { findMany: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("@/lib/auth-user", () => ({ getAuthenticatedUser }));
vi.mock("@/lib/prisma", () => ({ prisma }));

import { GET, POST } from "@/app/api/bookmarks/route";

function makeRequest(body: string) {
  return new Request("http://localhost/api/bookmarks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("/api/bookmarks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUser.mockResolvedValue({ user: { id: "user-1" } });
    prisma.bookmark.findMany.mockResolvedValue([]);
    prisma.bookmark.create.mockResolvedValue({
      id: "bookmark-1",
      userId: "user-1",
    });
  });

  it("lists bookmarks scoped to the signed-in user", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(prisma.bookmark.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" } }),
    );
  });

  it("creates an HTTP(S) bookmark and normalizes its URL", async () => {
    const response = await POST(
      makeRequest(
        JSON.stringify({
          title: "Docs",
          url: "https://example.com/docs",
          tags: "reference",
        }),
      ),
    );
    expect(response.status).toBe(201);
    expect(prisma.bookmark.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        title: "Docs",
        url: "https://example.com/docs",
        tags: "reference",
      }),
    });
  });

  it("rejects unsafe protocols and malformed bookmark data", async () => {
    const unsafe = await POST(
      makeRequest(
        JSON.stringify({ title: "Unsafe", url: "javascript:alert(1)" }),
      ),
    );
    const malformed = await POST(makeRequest("{invalid"));
    expect(unsafe.status).toBe(400);
    expect(malformed.status).toBe(400);
    expect(prisma.bookmark.create).not.toHaveBeenCalled();
  });
});
