import Link from "next/link";

import { Card } from "@/components/ui/card";
import { TOOL_REGISTRY } from "@/tools/registry";

export default function CategoriesPage() {
  const counts = TOOL_REGISTRY.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-white">Categories</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(counts).map(([category, count]) => (
          <Link key={category} href={`/categories/${category.toLowerCase()}`}>
            <Card className="p-5">
              <div className="text-xl font-semibold text-white">{category}</div>
              <div className="mt-2 text-sm text-zinc-400">{count} tools</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
