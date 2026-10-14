import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TOOL_BY_CATEGORY, TOOL_REGISTRY } from "@/tools/registry";

const normalizedCategories = new Map(
  TOOL_REGISTRY.map((tool) => [tool.category.toLowerCase(), tool.category]),
);

export function generateStaticParams() {
  return Array.from(new Set(TOOL_REGISTRY.map((tool) => tool.category.toLowerCase()))).map((slug) => ({ slug }));
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = normalizedCategories.get(slug);

  if (!category) {
    notFound();
  }

  const tools = TOOL_BY_CATEGORY[category] ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-violet-300">Category</div>
          <h1 className="mt-2 text-3xl font-semibold text-white">{category}</h1>
        </div>
        <Link href="/categories" className="text-sm text-zinc-400 transition hover:text-white">
          Back to categories
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.id} href={`/tools/${tool.slug}`}>
            <Card className="h-full border border-white/10 bg-zinc-950/60 p-5 transition hover:border-violet-500/40 hover:bg-zinc-900/80">
              <CardHeader className="p-0">
                <CardTitle className="text-lg text-white">{tool.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <p className="text-sm text-zinc-400">{tool.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-violet-200">
                  {tool.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 px-2 py-1 text-zinc-300">
                      #{tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
