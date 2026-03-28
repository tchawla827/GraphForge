import { NextRequest, NextResponse } from "next/server";
import { getShareBySlugOrToken } from "@/server/shareService";

interface RouteContext {
  params: Promise<{ slugOrToken: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { slugOrToken } = await ctx.params;
  const payload = await getShareBySlugOrToken(slugOrToken);

  if (!payload) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Share link not found or no longer active" } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    project: payload.project,
    graph: payload.graph,
    share: payload.share,
  });
}
