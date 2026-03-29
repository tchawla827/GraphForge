import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { track } from "@/lib/analytics/track";
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
    notFound();
  }

  const shareType =
    payload.share.type === "private_token" ? "private_token" : "public";
  void track({ name: "share_opened", type: shareType });

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
