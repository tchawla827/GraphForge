import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { parseAdjacencyMatrix } from "@/lib/parsers/adjacencyMatrix";
import { importGraph } from "@/server/importService";
import { track } from "@/lib/analytics/track";

const MAX_INPUT_BYTES = 1024 * 1024;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "AUTH_REQUIRED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  let body: { text?: unknown; filename?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  if (typeof body.text !== "string") {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Field 'text' (string) is required" } },
      { status: 400 }
    );
  }

  if (new TextEncoder().encode(body.text).length > MAX_INPUT_BYTES) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Input exceeds maximum size of 1 MB",
        },
      },
      { status: 400 }
    );
  }

  const parsed = parseAdjacencyMatrix(body.text);
  if (!parsed.ok) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Adjacency matrix parse failed",
          details: { errors: parsed.errors },
        },
      },
      { status: 400 }
    );
  }

  const { id } = await ctx.params;
  const result = await importGraph(
    id,
    session.user.id,
    parsed.data,
    "adjacency_matrix",
    typeof body.filename === "string" ? body.filename : undefined
  );

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
        },
      },
      {
        status:
          result.error === "forbidden" ? 403 : result.error === "not_found" ? 404 : 400,
      }
    );
  }

  void track({ name: "graph_imported", format: "adjacency_matrix" });
  return NextResponse.json({
    data: {
      graph: result.data,
      summary: {
        nodeCount: result.data.nodes.length,
        edgeCount: result.data.edges.length,
      },
    },
  });
}
