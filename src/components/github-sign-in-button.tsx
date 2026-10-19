"use client";

import { useEffect, useState } from "react";
import { signIn, getProviders } from "next-auth/react";
import { GitBranch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getSafeCallbackUrl } from "@/lib/auth-redirect";

type ProviderStatus = "checking" | "available" | "unavailable" | "error";

export function GitHubSignInButton({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getProviders()
      .then((providers) => {
        if (isMounted) {
          setProviderStatus(providers?.github ? "available" : "unavailable");
        }
      })
      .catch(() => {
        if (isMounted) {
          setProviderStatus("error");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSignIn() {
    setError("");
    try {
      await signIn("github", { callbackUrl: getSafeCallbackUrl(callbackUrl) });
    } catch {
      setError("GitHub sign-in could not be started. Please try again.");
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleSignIn}
        disabled={providerStatus === "checking" || providerStatus === "unavailable"}
      >
        <GitBranch className="h-4 w-4" />
        {providerStatus === "checking" ? "Checking GitHub..." : "Continue with GitHub"}
      </Button>
      {providerStatus === "unavailable" ? (
        <p className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs text-amber-200" role="status">
          GitHub sign-in is disabled until GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are set in .env.local. In your GitHub OAuth App, set the callback URL to this site&apos;s /api/auth/callback/github, then restart the dev server.
        </p>
      ) : null}
      {providerStatus === "error" ? (
        <p className="text-xs text-amber-200" role="status">Unable to check GitHub sign-in availability. You can still try the button.</p>
      ) : null}
      {error ? <p className="text-xs text-rose-300" role="alert">{error}</p> : null}
    </div>
  );
}
