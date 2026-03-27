import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  return <div className="min-h-screen bg-background">{children}</div>;
}
