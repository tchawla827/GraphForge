import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { forkSharedProject } from "@/server/shareService";
import { track } from "@/lib/analytics/track";

interface RouteContext {
  params: Promise<{ slugOrToken: string }>;
}

export async function POST(_req: NextRequest, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "AUTH_REQUIRED", message: "Sign in to fork this project" } },
      { status: 401 }
    );
  }

  const { slugOrToken } = await ctx.params;
  const result = await forkSharedProject(slugOrToken, session.user.id);

  if (!result.ok) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Share link not found or no longer active" } },
      { status: 404 }
    );
  }

  void track({ name: "project_forked" });
  return NextResponse.json({ project: result.data }, { status: 201 });
}
