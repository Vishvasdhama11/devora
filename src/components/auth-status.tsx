"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Button variant="secondary" className="hidden sm:inline-flex" disabled>Loading...</Button>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="hidden text-sm text-zinc-300 transition hover:text-white md:inline-flex">
          {session.user?.name ?? session.user?.email ?? "Dashboard"}
        </Link>
        <Button
          variant="secondary"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="hidden sm:inline-flex"
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button asChild variant="secondary" className="hidden sm:inline-flex">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild>
        <Link href="/sign-up">Create account</Link>
      </Button>
    </div>
  );
}
