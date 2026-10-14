import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  const name = String(body?.name ?? "Devora user").trim();

  if (!email || password.length < 8) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    return NextResponse.json({ error: "User already exists." }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
    },
  });

  return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 });
}
