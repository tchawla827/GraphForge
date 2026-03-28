import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/client";
import { StatsCards } from "./_components/StatsCards";
import { ShareModerationTable } from "./_components/ShareModerationTable";

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id || !isAdmin(session.user.email)) {
    redirect("/dashboard");
  }

  const [userCount, projectCount, shareCount, runCount, activeShares] = await Promise.all([
    prisma.user.count(),
    prisma.project.count({ where: { archivedAt: null } }),
    prisma.shareLink.count({ where: { isActive: true } }),
    prisma.algorithmRun.count(),
    prisma.shareLink.findMany({
      where: { isActive: true },
      include: { project: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const shareRows = activeShares.map((s) => ({
    id: s.id,
    type: s.type,
    slug: s.slug,
    projectId: s.projectId,
    projectTitle: s.project.title,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Platform overview and share moderation.
        </p>
      </div>

      <StatsCards stats={{ userCount, projectCount, shareCount, runCount }} />

      <div>
        <h2 className="text-lg font-semibold text-zinc-200 mb-3">Active shares</h2>
        <ShareModerationTable initialShares={shareRows} />
      </div>
    </div>
  );
}
