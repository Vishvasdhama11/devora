import Link from "next/link";
import { redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in");
  }

  const history = await prisma.activityLog.findMany({
    where: { userId: session.user.id ?? "" },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">Activity</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">History</h1>
        </div>
        <Link href="/dashboard" className="text-sm text-violet-300 hover:text-violet-200">Back to dashboard</Link>
      </div>

      <div className="space-y-3">
        {history.length === 0 ? (
          <Card className="p-8">
            <p className="text-zinc-400">No recent activity yet. Use the toolbox to generate a record of the work you do most often.</p>
          </Card>
        ) : (
          history.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-violet-300">{item.action}</div>
                  <div className="mt-2 text-lg font-medium text-white">{item.title}</div>
                  {item.description ? <p className="mt-2 text-sm text-zinc-400">{item.description}</p> : null}
                </div>
                <div className="text-xs text-zinc-500">{new Date(item.createdAt).toLocaleString()}</div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
