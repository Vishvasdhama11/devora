import Link from "next/link";
import type { ToolDefinition } from "@/tools/registry";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ToolActions } from "@/components/tool-actions";

export function ToolShell({ tool }: { tool: ToolDefinition }) {
  const ToolComponent = tool.component;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-violet-300">{tool.category}</div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">{tool.name}</h1>
          <p className="mt-2 max-w-2xl text-zinc-400">{tool.description}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="secondary"><Link href="/tools">All tools</Link></Button>
          <Button asChild><Link href="/">Home</Link></Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="space-y-4">
          <Card className="p-5">
            <div className="mb-3 text-sm font-medium text-zinc-300">Tags</div>
            <div className="flex flex-wrap gap-2">
              {tool.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-1 text-[11px] text-violet-200">{tag}</span>
              ))}
            </div>
          </Card>
          <Card className="p-5 text-sm text-zinc-300">
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-500">Privacy</div>
            <p>Runs locally in your browser when possible.</p>
          </Card>
        </aside>

        <div>
          <ToolComponent />
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-500">Actions</div>
            <ToolActions tool={{ id: tool.id, name: tool.name, slug: tool.slug, category: tool.category }} />
          </Card>
          <Card className="p-5 text-sm text-zinc-300">
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-500">SEO</div>
            <p>Optimized metadata and structured URLs.</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
