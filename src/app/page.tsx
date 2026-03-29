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
    <div className="flex flex-col min-h-screen bg-[#030303] text-foreground selection:bg-primary/30">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-32 relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <div className="max-w-3xl space-y-8 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 text-[10px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Next-Gen Graph Algorithm Workspace
          </div>

          <h1 className="text-5xl font-black tracking-tight sm:text-7xl lg:text-8xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            Design <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-primary-foreground bg-[length:200%_auto] animate-gradient">Visual</span>
            <br />
            Architectures.
          </h1>

          <p className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            GraphForge is a professional environment for constructing complex graphs, 
            debugging algorithms step-by-step, and sharing interactive engineering snapshots.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            <Link
              href="/demo/dijkstra"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto h-12 px-8 font-bold border-white/10 hover:border-primary/50")}
            >
              Interactive Demo
            </Link>
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
            >
              <Button size="lg" type="submit" className="w-full sm:w-auto h-12 px-8 font-black tracking-wide">
                Start Building Free
              </Button>
            </form>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="border-t border-white/5 py-32 px-6 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
              Engineered for Algorithm Mastery
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">
              A complete toolset for developers, students, and researchers to explore graph theory visually.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map(({ title, description }) => (
              <div
                key={title}
                className="group rounded-2xl border border-white/5 bg-zinc-900/30 p-8 space-y-4 hover:border-primary/30 transition-all duration-500 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-lg font-bold text-zinc-100 group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Algorithm list */}
      <section className="border-t border-white/5 py-32 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">9 Core Algorithms</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {ALGORITHM_NAMES.map((name) => (
              <span
                key={name}
                className="px-4 py-2 rounded-xl border border-white/5 bg-zinc-900/50 text-zinc-300 text-xs font-bold uppercase tracking-wider hover:border-primary/30 transition-colors"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/5 py-32 px-6 bg-zinc-950/30">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-100">Public Sample Demos</h2>
            <p className="text-zinc-500 max-w-lg mx-auto">
              Jump straight into a workspace with pre-built scenarios. No authentication required.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
            {ALL_SAMPLES.slice(0, 3).map((sample) => (
              <Link
                key={sample.key}
                href={`/demo/${sample.key}`}
                className="group rounded-2xl border border-white/5 bg-zinc-900/40 p-6 transition-all duration-300 hover:border-primary/50 hover:bg-zinc-900/60 hover:-translate-y-1"
              >
                <p className="text-sm font-bold text-zinc-100 group-hover:text-primary transition-colors">{sample.label}</p>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500 group-hover:text-zinc-400 transition-colors">{sample.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
        GraphForge &copy; 2026 &mdash; Built for engineers who think in graphs
      </footer>
    </div>
  );
}

