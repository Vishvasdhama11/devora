import { notFound } from "next/navigation";

import { ToolShell } from "@/components/tool-shell";
import { TOOL_MAP, TOOL_REGISTRY } from "@/tools/registry";

export function generateStaticParams() {
  return TOOL_REGISTRY.map((tool) => ({ slug: tool.slug }));
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = TOOL_MAP.get(slug);

  if (!tool) {
    notFound();
  }

  return <ToolShell tool={tool} />;
}
