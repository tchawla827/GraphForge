import { auth } from "@/lib/auth/config";
import { getShareBySlugOrToken } from "@/server/shareService";
import { SharedEditorClient } from "./_components/SharedEditorClient";

interface SharedPageProps {
  params: Promise<{ slugOrToken: string }>;
}

export default async function SharedPage({ params }: SharedPageProps) {
  const { slugOrToken } = await params;

  const [payload, session] = await Promise.all([
    getShareBySlugOrToken(slugOrToken),
    auth(),
  ]);

  if (!payload) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-zinc-400 gap-3">
        <p className="text-lg font-semibold text-zinc-200">Link not found</p>
        <p className="text-sm">This share link is no longer active or does not exist.</p>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-zinc-950">
      <SharedEditorClient
        projectTitle={payload.project.title}
        graph={payload.graph}
        slugOrToken={slugOrToken}
        isAuthenticated={!!session?.user?.id}
      />
    </div>
  );
}
