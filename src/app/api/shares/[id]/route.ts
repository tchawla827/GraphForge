import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { revokeShare } from "@/server/shareService";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "AUTH_REQUIRED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const { id } = await ctx.params;
  const result = await revokeShare(id, session.user.id);

  if (!result.ok) {
    return NextResponse.json(
      {
        error: {
          code: result.error === "forbidden" ? "PERMISSION_DENIED" : "NOT_FOUND",
          message:
            result.error === "forbidden"
              ? "You do not have permission to revoke this share"
              : "Share not found",
        },
      },
      { status: result.error === "forbidden" ? 403 : 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
