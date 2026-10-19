import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthenticatedUser, prisma } = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  prisma: {
    note: { findMany: vi.fn(), create: vi.fn() },
    workspace: { findFirst: vi.fn() },
  },
}));

vi.mock("@/lib/auth-user", () => ({ getAuthenticatedUser }));
vi.mock("@/lib/prisma", () => ({ prisma }));

import { GET, POST } from "@/app/api/notes/route";

function makeRequest(body: string) {
  return new Request("http://localhost/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("/api/notes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUser.mockResolvedValue({ user: { id: "user-1" } });
    prisma.note.findMany.mockResolvedValue([]);
    prisma.note.create.mockResolvedValue({
      id: "note-1",
      title: "Idea",
      userId: "user-1",
    });
    prisma.workspace.findFirst.mockResolvedValue({
      id: "workspace-1",
      userId: "user-1",
    });
  });

  it("only lists notes owned by the authenticated user", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(prisma.note.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" } }),
    );
  });

  it("validates and creates a note attached to an owned project", async () => {
    const response = await POST(
      makeRequest(
        JSON.stringify({
          title: "  Idea  ",
          content: "Markdown",
          workspaceId: "workspace-1",
          pinned: true,
        }),
      ),
    );
    expect(response.status).toBe(201);
    expect(prisma.note.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        workspaceId: "workspace-1",
        title: "Idea",
        content: "Markdown",
        pinned: true,
      }),
    });
  });

  it("rejects malformed notes and projects owned by someone else", async () => {
    prisma.workspace.findFirst.mockResolvedValue(null);
    const invalid = await POST(makeRequest(JSON.stringify({ title: "" })));
    const foreignProject = await POST(
      makeRequest(JSON.stringify({ title: "Idea", workspaceId: "foreign" })),
    );
    expect(invalid.status).toBe(400);
    expect(foreignProject.status).toBe(404);
    expect(prisma.note.create).not.toHaveBeenCalled();
  });
});
