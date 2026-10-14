"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to create your account right now.");
        setIsSubmitting(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Your account was created, but we could not log you in automatically. Please sign in.");
        router.push("/sign-in");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong while creating the account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-violet-950/20">
        <CardHeader className="p-0">
          <CardTitle className="text-2xl text-white">Create your account</CardTitle>
          <CardDescription className="mt-2 text-zinc-400">Set up your Devora workspace and start using the toolkit.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm text-zinc-300">Full name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
                placeholder="Ada Lovelace"
                required
              />
            </div>

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
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </div>

            {error ? <p className="text-sm text-rose-400">{error}</p> : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-violet-300 transition hover:text-violet-200">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
