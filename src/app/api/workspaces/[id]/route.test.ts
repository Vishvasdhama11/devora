import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAuthenticatedUser, prisma } = vi.hoisted(() => ({
  getAuthenticatedUser: vi.fn(),
  prisma: {
    workspace: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth-user", () => ({ getAuthenticatedUser }));
vi.mock("@/lib/prisma", () => ({ prisma }));

import { PATCH } from "@/app/api/workspaces/[id]/route";

const workspace = {
  id: "workspace-1",
  userId: "user-1",
  name: "Original",
  description: "Existing description",
  visibility: "team",
};

function makeRequest(body: string) {
  return new Request("http://localhost/api/workspaces/workspace-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("PATCH /api/workspaces/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthenticatedUser.mockResolvedValue({ user: { id: "user-1" } });
    prisma.workspace.findFirst.mockResolvedValue(workspace);
    prisma.workspace.update.mockResolvedValue({ ...workspace, name: "Renamed" });
    prisma.activityLog.create.mockResolvedValue({});
    prisma.$transaction.mockImplementation(async (operation) =>
      operation({
        workspace: { update: prisma.workspace.update },
        activityLog: { create: prisma.activityLog.create },
      }),
    );
  });

  it("rejects malformed JSON and unknown visibility values", async () => {
    const malformed = await PATCH(makeRequest("{invalid"), {
      params: Promise.resolve({ id: workspace.id }),
    });
    const invalidVisibility = await PATCH(
      makeRequest(JSON.stringify({ visibility: "public" })),
      { params: Promise.resolve({ id: workspace.id }) },
    );

    expect(malformed.status).toBe(400);
    expect(invalidVisibility.status).toBe(400);
    expect(prisma.workspace.update).not.toHaveBeenCalled();
  });

  it("applies a partial update without overwriting omitted fields", async () => {
    const response = await PATCH(makeRequest(JSON.stringify({ name: " Renamed " })), {
      params: Promise.resolve({ id: workspace.id }),
    });

    expect(response.status).toBe(200);
    expect(prisma.workspace.update).toHaveBeenCalledWith({
      where: { id: workspace.id },
      data: { name: "Renamed" },
    });
    expect(prisma.activityLog.create).toHaveBeenCalledOnce();
  });

  it("rejects empty updates and overlong descriptions", async () => {
    const emptyUpdate = await PATCH(makeRequest("{}"), {
      params: Promise.resolve({ id: workspace.id }),
    });
    const overlongDescription = await PATCH(
      makeRequest(JSON.stringify({ description: "x".repeat(1001) })),
      { params: Promise.resolve({ id: workspace.id }) },
    );

    expect(emptyUpdate.status).toBe(400);
    expect(overlongDescription.status).toBe(400);
    expect(prisma.workspace.update).not.toHaveBeenCalled();
  });
});
