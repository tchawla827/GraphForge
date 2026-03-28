import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { getSampleByKey, hydrateSampleGraph } from "@/lib/samples";
import { SharedEditorClient } from "@/app/share/[slugOrToken]/_components/SharedEditorClient";

interface DemoPageProps {
  params: Promise<{ sampleKey: string }>;
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { sampleKey } = await params;
  const sample = getSampleByKey(sampleKey);
  const graph = hydrateSampleGraph(sampleKey);

  if (!sample || !graph) {
    notFound();
  }

  const session = await auth();

  return (
    <div className="h-screen overflow-hidden bg-zinc-950">
      <SharedEditorClient
        projectTitle={`${sample.label} Demo`}
        graph={graph}
        isAuthenticated={Boolean(session?.user?.id)}
        showForkButton={false}
      />
    </div>
  );
}
