import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { z } from "zod";
import {
  createPublicShare,
  createPrivateShare,
  listProjectShares,
} from "@/server/shareService";
import { checkRateLimit } from "@/lib/server/rateLimit";

const CreateShareBody = z.object({
  type: z.enum(["public", "private_token"]),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "AUTH_REQUIRED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const { id } = await ctx.params;
  const result = await listProjectShares(id, session.user.id);

  if (!result.ok) {
    return NextResponse.json(
      {
        error: {
          code: result.error === "forbidden" ? "PERMISSION_DENIED" : "NOT_FOUND",
          message:
            result.error === "forbidden"
              ? "You do not have access to this project"
              : "Project not found",
        },
      },
      { status: result.error === "forbidden" ? 403 : 404 }
    );
  }

  return NextResponse.json({ data: result.data });
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "AUTH_REQUIRED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const rateLimit = checkRateLimit("share", session.user.id);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMITED",
          message: "Too many share links created. Please try again shortly.",
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const parsed = CreateShareBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request body",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 }
    );
  }

  const { id } = await ctx.params;

  if (parsed.data.type === "public") {
    const result = await createPublicShare(id, session.user.id);
    if (!result.ok) {
      return NextResponse.json(
        {
          error: {
            code: result.error === "forbidden" ? "PERMISSION_DENIED" : "NOT_FOUND",
            message:
              result.error === "forbidden"
                ? "You do not have access to this project"
                : "Project not found",
          },
        },
        { status: result.error === "forbidden" ? 403 : 404 }
      );
    }
    const { id: shareId, type, url, isActive } = result.data;
    return NextResponse.json(
      { share: { id: shareId, type, url, isActive } },
      { status: 201 }
    );
  } else {
    const result = await createPrivateShare(id, session.user.id);
    if (!result.ok) {
      return NextResponse.json(
        {
          error: {
            code: result.error === "forbidden" ? "PERMISSION_DENIED" : "NOT_FOUND",
            message:
              result.error === "forbidden"
                ? "You do not have access to this project"
                : "Project not found",
          },
        },
        { status: result.error === "forbidden" ? 403 : 404 }
      );
    }
    const { id: shareId, type, url, isActive, rawToken } = result.data;
    return NextResponse.json(
      { share: { id: shareId, type, url, isActive, rawToken } },
      { status: 201 }
    );
  }
}
