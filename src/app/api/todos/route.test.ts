import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthenticatedUser, prisma } = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  prisma: {
    todo: { findMany: vi.fn(), create: vi.fn() },
    workspace: { findFirst: vi.fn() },
  },
}));

vi.mock("@/lib/auth-user", () => ({ getAuthenticatedUser }));
vi.mock("@/lib/prisma", () => ({ prisma }));

import { GET, POST } from "@/app/api/todos/route";

function makeRequest(body: string) {
  return new Request("http://localhost/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("/api/todos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUser.mockResolvedValue({ user: { id: "user-1" } });
    prisma.todo.findMany.mockResolvedValue([]);
    prisma.todo.create.mockResolvedValue({
      id: "todo-1",
      userId: "user-1",
      title: "Ship",
    });
    prisma.workspace.findFirst.mockResolvedValue({
      id: "workspace-1",
      userId: "user-1",
    });
  });

  it("lists only the signed-in user's tasks", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(prisma.todo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" } }),
    );
  });

  it("creates tasks with due dates, priorities, and project ownership", async () => {
    const response = await POST(
      makeRequest(
        JSON.stringify({
          title: " Ship feature ",
          dueAt: "2026-12-01",
          priority: "high",
          workspaceId: "workspace-1",
        }),
      ),
    );
    expect(response.status).toBe(201);
    expect(prisma.todo.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        title: "Ship feature",
        priority: "high",
        workspaceId: "workspace-1",
        dueAt: expect.any(Date),
      }),
    });
  });

  it("rejects invalid priorities, dates, and non-owned projects", async () => {
    prisma.workspace.findFirst.mockResolvedValue(null);
    const invalidPriority = await POST(
      makeRequest(JSON.stringify({ title: "Ship", priority: "urgent" })),
    );
    const invalidDate = await POST(
      makeRequest(JSON.stringify({ title: "Ship", dueAt: "not a date" })),
    );
    const impossibleDate = await POST(
      makeRequest(JSON.stringify({ title: "Ship", dueAt: "2026-02-30" })),
    );
    const foreignProject = await POST(
      makeRequest(JSON.stringify({ title: "Ship", workspaceId: "other" })),
    );
    expect(invalidPriority.status).toBe(400);
    expect(invalidDate.status).toBe(400);
    expect(impossibleDate.status).toBe(400);
    expect(foreignProject.status).toBe(404);
    expect(prisma.todo.create).not.toHaveBeenCalled();
  });
});
