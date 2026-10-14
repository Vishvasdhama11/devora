import { notFound, redirect } from "next/navigation";

import { getServerSession } from "next-auth";

import { authOptions } from "@/auth";
import { WorkspaceDetail } from "@/components/workspace-detail";
import { prisma } from "@/lib/prisma";

export default async function WorkspaceDetailPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { workspaceId } = await params;

  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, userId: session.user.id ?? "" },
  });

  if (!workspace) {
    notFound();
  }

  return <WorkspaceDetail workspace={workspace} />;
}
