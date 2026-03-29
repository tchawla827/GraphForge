import { auth } from "@/lib/auth/config";
import { signIn } from "@/lib/auth/config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button.variants";
import { Navbar } from "@/components/layout/navbar";
import { ALL_SAMPLES } from "@/lib/samples";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";

const ALGORITHM_NAMES = [
  "BFS",
  "DFS",
  "Dijkstra",
  "A*",
  "Bellman-Ford",
  "Topological Sort",
  "Cycle Detection",
  "Prim's MST",
  "Kruskal's MST",
];

const FEATURES = [
  {
    title: "Custom graphs",
    description: "Add nodes and edges visually, import from adjacency list, matrix, or JSON, and toggle directed / weighted modes.",
  },
  {
    title: "Step-by-step algorithms",
    description: "Run any of 9 algorithms and step through every decision — play, pause, rewind, and scrub the timeline.",
  },
  {
    title: "Save & share",
    description: "Projects are saved automatically. Share via public link or private token — viewers can fork to their own workspace.",
  },
];

export default async function LandingPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 text-center py-24">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground bg-muted/30">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            Graph algorithm workspace
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Build graphs.
            <br />
            <span className="text-primary">Run algorithms.</span>
          </h1>

          <p className="text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            GraphForge is a professional workspace for constructing custom graphs,
            stepping through algorithms visually, and sharing interactive snapshots.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/demo/dijkstra"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}
            >
              Try Demo
            </Link>
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
      </section>

      {/* Features */}
      <section className="border-t border-border py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold text-zinc-200 text-center mb-10">
            Everything you need to explore algorithms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ title, description }) => (
              <div
                key={title}
                className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-6 py-5 space-y-2"
              >
                <h3 className="text-zinc-100 font-semibold text-sm">{title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Algorithm list */}
      <section className="border-t border-border py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-xl font-semibold text-zinc-200">9 algorithms included</h2>
          <div className="flex flex-wrap gap-2 justify-center">
            {ALGORITHM_NAMES.map((name) => (
              <span
                key={name}
                className="px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-900 text-zinc-300 text-xs font-medium"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-xl font-semibold text-zinc-200">Public sample demos</h2>
          <p className="text-sm text-zinc-500">
            Open a read-only sample workspace instantly. No account required.
          </p>
          <div className="grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
            {ALL_SAMPLES.slice(0, 3).map((sample) => (
              <Link
                key={sample.key}
                href={`/demo/${sample.key}`}
                className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-4 transition-colors hover:bg-zinc-900"
              >
                <p className="text-sm font-semibold text-zinc-100">{sample.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">{sample.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-4 text-center text-xs text-zinc-600">
        GraphForge — built for engineers who think in graphs
      </footer>
    </div>
  );
}
