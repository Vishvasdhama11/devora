import { beforeEach, describe, expect, it, vi } from "vitest";

const { hash, prisma } = vi.hoisted(() => ({
  hash: vi.fn(),
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({ hash }));
vi.mock("@/lib/prisma", () => ({ prisma }));

import { POST } from "@/app/api/register/route";

function makeRequest(body: string) {
  return new Request("http://localhost/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("POST /api/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hash.mockResolvedValue("hashed-password");
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: "user-1",
      email: "ada@example.com",
      name: "Ada Lovelace",
    });
  });

  it("rejects malformed JSON and invalid account fields", async () => {
    const malformed = await POST(makeRequest("{invalid"));
    const invalidEmail = await POST(makeRequest(JSON.stringify({ name: "Ada", email: "not-an-email", password: "password123" })));
    const shortPassword = await POST(makeRequest(JSON.stringify({ name: "Ada", email: "ada@example.com", password: "short" })));
    const longPassword = await POST(makeRequest(JSON.stringify({ name: "Ada", email: "ada@example.com", password: "😀".repeat(19) })));
    const blankName = await POST(makeRequest(JSON.stringify({ name: " ", email: "ada@example.com", password: "password123" })));

    expect(malformed.status).toBe(400);
    expect(invalidEmail.status).toBe(400);
    expect(shortPassword.status).toBe(400);
    expect(longPassword.status).toBe(400);
    expect(blankName.status).toBe(400);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("returns a conflict when the email is already registered", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "existing-user" });

    const response = await POST(makeRequest(JSON.stringify({
      name: "Ada",
      email: "ADA@example.com",
      password: "password123",
    })));

    expect(response.status).toBe(409);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("handles a duplicate registration race without returning a server error", async () => {
    prisma.user.create.mockRejectedValue(Object.assign(new Error("Unique constraint failed"), { code: "P2002" }));

    const response = await POST(makeRequest(JSON.stringify({
      name: "Ada",
      email: "ada@example.com",
      password: "password123",
    })));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ error: "User already exists." });
  });

  it("normalizes email, hashes the password, and creates the account", async () => {
    const response = await POST(makeRequest(JSON.stringify({
      name: " Ada Lovelace ",
      email: " ADA@EXAMPLE.COM ",
      password: "password123",
    })));

    expect(response.status).toBe(201);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "ada@example.com" } });
    expect(hash).toHaveBeenCalledWith("password123", 12);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: "ada@example.com",
        name: "Ada Lovelace",
        passwordHash: "hashed-password",
      },
    });
    await expect(response.json()).resolves.toMatchObject({ id: "user-1", email: "ada@example.com" });
  });
});
