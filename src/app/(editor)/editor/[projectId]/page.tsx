interface EditorPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { projectId } = await params;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center gap-3">
      <h1 className="text-xl font-semibold text-foreground">Editor</h1>
      <p className="text-muted-foreground text-sm">
        Project <code className="font-mono text-primary">{projectId}</code>
      </p>
      <p className="text-muted-foreground/60 text-xs">
        Graph editor coming in Phase 2.
      </p>
    </div>
  );
}
