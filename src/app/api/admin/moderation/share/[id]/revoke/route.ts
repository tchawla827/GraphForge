import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/client";

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "AUTH_REQUIRED", message: "Authentication required" } },
      { status: 401 }
    );
  }
  if (!isAdmin(session.user.email)) {
    return NextResponse.json(
      { error: { code: "PERMISSION_DENIED", message: "Admin access required" } },
      { status: 403 }
    );
  }

  const { id } = await ctx.params;
  const share = await prisma.shareLink.findUnique({ where: { id } });
  if (!share) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Share not found" } },
      { status: 404 }
    );
  }

  await prisma.shareLink.update({
    where: { id },
    data: { isActive: false, revokedAt: new Date() },
  });

  console.log(`[admin] Share ${id} revoked by ${session.user.email} at ${new Date().toISOString()}`);

  return NextResponse.json({ data: { revoked: true } });
}
