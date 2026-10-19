import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthenticatedUser, prisma } = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  prisma: {
    workspace: {
      create: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth-user", () => ({ getAuthenticatedUser }));
vi.mock("@/lib/prisma", () => ({ prisma }));

import { POST } from "@/app/api/workspaces/route";

const workspace = {
  id: "workspace-1",
  userId: "user-1",
  name: "Tooling",
  description: "Developer tools",
  visibility: "private",
};

function makeRequest(body: string) {
  return new Request("http://localhost/api/workspaces", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("POST /api/workspaces", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUser.mockResolvedValue({ user: { id: "user-1" } });
    prisma.workspace.create.mockResolvedValue(workspace);
    prisma.activityLog.create.mockResolvedValue({});
    prisma.$transaction.mockImplementation(async (operation) =>
      operation({
        workspace: { create: prisma.workspace.create },
        activityLog: { create: prisma.activityLog.create },
      }),
    );
  });

  it("rejects malformed or invalid workspace data", async () => {
    const malformed = await POST(makeRequest("{invalid"));
    const invalidVisibility = await POST(
      makeRequest(JSON.stringify({ name: "Tooling", visibility: "public" })),
    );
    const overlongName = await POST(
      makeRequest(JSON.stringify({ name: "x".repeat(101) })),
    );

    expect(malformed.status).toBe(400);
    expect(invalidVisibility.status).toBe(400);
    expect(overlongName.status).toBe(400);
    expect(prisma.workspace.create).not.toHaveBeenCalled();
  });

  it("creates a workspace and activity entry in one transaction", async () => {
    const response = await POST(
      makeRequest(
        JSON.stringify({
          name: " Tooling ",
          description: " Developer tools ",
          visibility: "team",
        }),
      ),
    );

    expect(response.status).toBe(201);
    expect(prisma.workspace.create).toHaveBeenCalledWith({
      data: {
        userId: "user-1",
        name: "Tooling",
        description: "Developer tools",
        visibility: "team",
        status: "active",
        techStack: "",
        progress: 0,
        deadline: null,
        repositoryUrl: null,
        demoUrl: null,
      },
    });
    expect(prisma.activityLog.create).toHaveBeenCalledOnce();
    expect(prisma.$transaction).toHaveBeenCalledOnce();
  });

  it("accepts project metadata and rejects invalid links or progress", async () => {
    const response = await POST(
      makeRequest(
        JSON.stringify({
          name: "Devora",
          techStack: "Next.js, TypeScript",
          progress: 35,
          deadline: "2026-12-31",
          repositoryUrl: "https://github.com/example/devora",
          demoUrl: "https://devora.example",
          status: "active",
        }),
      ),
    );
    const invalidLink = await POST(
      makeRequest(
        JSON.stringify({
          name: "Bad link",
          repositoryUrl: "javascript:alert(1)",
        }),
      ),
    );
    const invalidProgress = await POST(
      makeRequest(JSON.stringify({ name: "Bad progress", progress: 101 })),
    );

    expect(response.status).toBe(201);
    expect(prisma.workspace.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        techStack: "Next.js, TypeScript",
        progress: 35,
        deadline: expect.any(Date),
        repositoryUrl: "https://github.com/example/devora",
        demoUrl: "https://devora.example/",
      }),
    });
    expect(invalidLink.status).toBe(400);
    expect(invalidProgress.status).toBe(400);
  });
});
