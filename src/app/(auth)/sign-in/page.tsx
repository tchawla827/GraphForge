import { auth } from "@/lib/auth/config";
import { signIn } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-sm bg-card border-border">
        <CardHeader className="text-center space-y-1">
          <div className="text-2xl font-bold text-primary mb-1">▲</div>
          <CardTitle className="text-xl">GraphForge</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to access your graph workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              Continue with Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
