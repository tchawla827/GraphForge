import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth/config";
import { signIn, signOut } from "@/lib/auth/config";
import { Button } from "@/components/ui/button";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="h-16 border-b border-border/50 bg-background/60 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-screen-xl mx-auto px-6 h-full flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-all"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 group-hover:border-primary/50 group-hover:bg-primary/20 transition-all duration-300">
            <span className="text-primary font-bold text-lg leading-none group-hover:scale-110 transition-transform duration-300">▲</span>
            <div className="absolute inset-0 rounded-lg blur-lg bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-bold tracking-tight text-foreground text-lg group-hover:text-primary transition-colors">
            GraphForge
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          {session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-all hover:translate-y-[-1px]"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-4 pl-2 border-l border-border/50">
                {session.user.image && (
                  <div className="relative group/avatar">
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "User avatar"}
                      width={32}
                      height={32}
                      className="rounded-full border border-border group-hover/avatar:border-primary/50 transition-colors"
                    />
                    <div className="absolute inset-0 rounded-full blur-md bg-primary/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                  </div>
                )}
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <Button variant="ghost" size="sm" type="submit" className="text-xs font-semibold hover:text-red-400">
                    Sign out
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/demo/dijkstra"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Demo
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: "/dashboard" });
                }}
              >
                <Button size="sm" type="submit" className="font-bold px-5">
                  Sign in
                </Button>
              </form>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

