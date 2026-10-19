"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GitHubSignInButton } from "@/components/github-sign-in-button";
import { getSafeCallbackUrl } from "@/lib/auth-redirect";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Try again.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Sign-in failed. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-violet-950/20">
        <CardHeader className="p-0">
          <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
          <CardDescription className="mt-2 text-zinc-400">Sign in to your Devora workspace and continue building.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          <GitHubSignInButton callbackUrl={getSafeCallbackUrl(searchParams.get("callbackUrl"))} />
          <div className="my-5 flex items-center gap-3 text-xs text-zinc-500">
            <span className="h-px flex-1 bg-white/10" />
            OR CONTINUE WITH EMAIL
            <span className="h-px flex-1 bg-white/10" />
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-zinc-300">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-zinc-300">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            {error ? <p className="text-sm text-rose-400">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            No account yet?{" "}
            <Link href="/sign-up" className="font-medium text-violet-300 transition hover:text-violet-200">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4 py-12 text-zinc-400">Loading sign in...</div>}>
      <SignInForm />
    </Suspense>
  );
}
