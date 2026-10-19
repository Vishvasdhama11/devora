import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Please submit valid JSON." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Please submit valid account details." }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isValidEmail || email.length > 254 || password.length < 8 || new TextEncoder().encode(password).length > 72 || !name || name.length > 80) {
    return NextResponse.json(
      { error: "Enter a valid email, a name up to 80 characters, and a password between 8 and 72 bytes." },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    return NextResponse.json({ error: "User already exists." }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);
  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    });
    return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ error: "User already exists." }, { status: 409 });
    }
    throw error;
  }
}
