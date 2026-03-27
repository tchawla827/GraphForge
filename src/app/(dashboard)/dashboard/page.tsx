import { auth } from "@/lib/auth/config";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[40vh] border border-dashed border-border rounded-lg text-center px-4 py-16 gap-3">
        <p className="text-muted-foreground text-sm">No projects yet.</p>
        <p className="text-muted-foreground/60 text-xs">
          Graph editor coming in Phase 2.
        </p>
      </div>
    </div>
  );
}
