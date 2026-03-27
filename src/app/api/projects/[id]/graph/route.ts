import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getGraph, replaceGraph } from "@/server/graphService";

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
  const graph = await getGraph(id, session.user.id);
  if (!graph.ok) {
    return NextResponse.json(
      {
        error: {
          code: graph.error === "forbidden" ? "PERMISSION_DENIED" : "NOT_FOUND",
          message:
            graph.error === "forbidden"
              ? "You do not have access to this graph"
              : "Graph not found",
        },
      },
      { status: graph.error === "forbidden" ? 403 : 404 }
    );
  }

  return NextResponse.json({ data: graph.data });
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "AUTH_REQUIRED", message: "Authentication required" } },
      { status: 401 }
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

  const { id } = await ctx.params;
  const result = await replaceGraph(id, session.user.id, body);

  if (!result.ok) {
    return NextResponse.json(
      {
        error: {
          code:
            result.error === "forbidden"
              ? "PERMISSION_DENIED"
              : result.error === "not_found"
                ? "NOT_FOUND"
                : "VALIDATION_ERROR",
          message: result.message,
          ...(result.details ? { details: result.details } : {}),
        },
      },
      {
        status:
          result.error === "forbidden"
            ? 403
            : result.error === "not_found"
              ? 404
              : 400,
      }
    );
  }

  return NextResponse.json({ data: result.data });
}
