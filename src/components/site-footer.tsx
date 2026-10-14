import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 text-sm text-zinc-300 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="mb-4 text-lg font-semibold text-white">Devora</div>
          <p className="max-w-xs text-zinc-400">Built for developers, by developers.</p>
        </div>
        <div>
          <h3 className="mb-4 text-white">Explore</h3>
          <ul className="space-y-2">
            <li><Link href="/tools">Tools</Link></li>
            <li><Link href="/categories">Categories</Link></li>
            <li><Link href="/docs">Docs</Link></li>
            <li><Link href="/roadmap">Roadmap</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-white">Community</h3>
          <ul className="space-y-2">
            <li><Link href="/github">GitHub</Link></li>
            <li><Link href="/changelog">Changelog</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/blog">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-white">Legal</h3>
          <ul className="space-y-2">
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
            <li><Link href="/contributing">Contributing</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
