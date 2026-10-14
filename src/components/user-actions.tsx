"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

function useSessionStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const updateAuthState = () => {
      const stored = document.cookie
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith("next-auth.session-token="));

      setIsAuthenticated(Boolean(stored));
    };

    updateAuthState();
    const interval = window.setInterval(updateAuthState, 2000);
    return () => window.clearInterval(interval);
  }, []);

  return isAuthenticated;
}

export function UserActions() {
  const isAuthenticated = useSessionStatus();

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="secondary" className="border-white/10 bg-zinc-900/80 text-zinc-100">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button asChild className="bg-violet-600 text-white hover:bg-violet-500">
          <Link href="/settings">Settings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="secondary" className="border-white/10 bg-zinc-900/80 text-zinc-100">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild className="bg-violet-600 text-white hover:bg-violet-500">
        <Link href="/sign-up">Get started</Link>
      </Button>
    </div>
  );
}
