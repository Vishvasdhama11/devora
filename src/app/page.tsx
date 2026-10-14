import Link from "next/link";

import { ToolSearch } from "@/components/tool-search";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TOOL_REGISTRY } from "@/tools/registry";

const featureList = [
  "50+ developer tools",
  "Open source",
  "Fast",
  "Privacy-friendly",
];

const workflow = [
  {
    title: "Discover",
    description: "Search tools by name, category, or keyword.",
  },
  {
    title: "Transform",
    description: "Format, parse, validate, and generate code.",
  },
  {
    title: "Share",
    description: "Copy results and ship clean output instantly.",
  },
];

export default function Home() {
  const popularTools = TOOL_REGISTRY.slice(0, 6);
  const categoryCounts = TOOL_REGISTRY.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-zinc-950/60 px-6 py-12 shadow-2xl shadow-violet-950/30 md:px-10 lg:px-14">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.24),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.22),_transparent_30%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Badge className="mb-5">Open source dev toolkit</Badge>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your Developer Command Center
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-zinc-300">
              Code. Test. Convert. Generate. Optimize.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-xl px-7 text-base shadow-lg shadow-violet-950/40"
              >
                <Link href="/tools">
                  Start using Devora <span aria-hidden="true">→</span>
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/github">View on GitHub</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-zinc-300">
              {featureList.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-violet-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
              <div className="mb-4 rounded-2xl bg-zinc-950/80 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-violet-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Live
                  platform
                </div>
                <div className="space-y-3">
                  {popularTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-300"
                    >
                      <span>{tool.name}</span>
                      <span className="rounded border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-violet-200">
                        {tool.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-violet-300">
              Search
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Find the right tool fast
            </h2>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-950/70 p-4">
          <ToolSearch inline />
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-violet-300">
              Popular tools
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Fast favorite utilities
            </h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {popularTools.map((tool) => (
            <Link key={tool.id} href={`/tools/${tool.slug}`}>
              <Card className="h-full border border-white/10 bg-zinc-950/60 p-5 transition hover:border-violet-500/40 hover:bg-zinc-900/80">
                <CardHeader className="p-0">
                  <CardTitle className="text-lg text-white">
                    {tool.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-4">
                  <CardDescription>{tool.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6 text-xs uppercase tracking-[0.2em] text-violet-300">
          Categories
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(categoryCounts).map(([name, count]) => (
            <Link key={name} href={`/categories/${name.toLowerCase()}`}>
              <Card className="p-5 text-left">
                <div className="text-xl font-semibold text-white">{name}</div>
                <div className="mt-2 text-sm text-zinc-400">{count} tools</div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6 text-xs uppercase tracking-[0.2em] text-violet-300">
          Why Devora
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              "Privacy first",
              "Sensitive utilities run locally in-browser as often as possible.",
            ],
            [
              "Built to scale",
              "Registry-first architecture makes it easy to expand the platform.",
            ],
            [
              "Serious tooling",
              "Everything is designed for developer workflows, not generic demos.",
            ],
          ].map(([title, description]) => (
            <Card key={title} className="p-5">
              <div className="mb-3 text-lg font-medium text-white">{title}</div>
              <p className="text-zinc-400">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-[28px] border border-white/10 bg-zinc-950/70 p-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-violet-300">
              Open source
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Built in the open.
            </h2>
          </div>
        </div>
        <p className="max-w-2xl text-zinc-300">
          Devora is a growing collection of fast, privacy-friendly tools for
          developers. Housed in a GitHub-first workflow and designed for
          community contribution.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/github">GitHub stars</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/roadmap">View roadmap</Link>
          </Button>
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6 text-xs uppercase tracking-[0.2em] text-violet-300">
          Developer workflow
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {workflow.map((step, index) => (
            <Card key={step.title} className="p-5">
              <div className="mb-3 text-sm text-violet-300">0{index + 1}</div>
              <div className="text-xl font-semibold text-white">
                {step.title}
              </div>
              <p className="mt-2 text-zinc-400">{step.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6 text-xs uppercase tracking-[0.2em] text-violet-300">
          FAQ
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            [
              "Is Devora free?",
              "Yes — the core toolbox remains open source and free.",
            ],
            [
              "Does it run locally?",
              "Many tools work directly in the browser without any server roundtrip.",
            ],
            [
              "Can I contribute?",
              "Absolutely. The project is GitHub-first and welcomes new tools and improvements.",
            ],
            [
              "Is it production-ready?",
              "The architecture is designed for scale while remaining accessible for community contributions.",
            ],
          ].map(([question, answer]) => (
            <Card key={question} className="p-5">
              <div className="font-medium text-white">{question}</div>
              <p className="mt-2 text-sm text-zinc-400">{answer}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
