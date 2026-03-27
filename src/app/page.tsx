import { auth } from "@/lib/auth/config";
import { signIn } from "@/lib/auth/config";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground bg-muted/30">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            Graph algorithm workspace
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Build graphs.
            <br />
            <span className="text-primary">Run algorithms.</span>
          </h1>

          <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            GraphForge is a professional workspace for constructing custom graphs,
            stepping through algorithms, and sharing interactive visualizations.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
            >
              <Button size="lg" type="submit" className="w-full sm:w-auto">
                Sign in with Google
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
