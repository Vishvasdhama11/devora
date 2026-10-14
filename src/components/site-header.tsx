import Link from "next/link";
import { Sparkles } from "lucide-react";

import { AuthStatus } from "@/components/auth-status";
import { ThemeToggle } from "@/components/theme-toggle";
import { ToolSearch } from "@/components/tool-search";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/30">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight">Devora</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-zinc-300 md:flex">
          <Link href="/tools" className="transition hover:text-white">Tools</Link>
          <Link href="/categories" className="transition hover:text-white">Categories</Link>
          <Link href="/docs" className="transition hover:text-white">Docs</Link>
          <Link href="/github" className="transition hover:text-white">GitHub</Link>
          <Link href="/changelog" className="transition hover:text-white">Changelog</Link>
          <Link href="/pricing" className="transition hover:text-white">Pricing</Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden min-w-[220px] sm:block">
            <ToolSearch compact />
          </div>
          <ThemeToggle />
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}
