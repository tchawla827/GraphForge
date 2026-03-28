import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { runAlgorithm } from "@/server/algorithmService";

const RunRequestSchema = z.object({
  algorithm: z.enum([
    "bfs",
    "dfs",
    "dijkstra",
    "astar",
    "bellman_ford",
    "topological_sort",
    "cycle_detection",
    "prim",
    "kruskal",
  ]),
  sourceNodeId: z.string().optional(),
  targetNodeId: z.string().optional(),
  heuristic: z.enum(["euclidean", "manhattan", "zero"]).optional(),
});

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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const parsed = RunRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid run configuration",
          details: { issues: parsed.error.issues },
        },
      },
      { status: 400 }
    );
  }

  const { id } = await ctx.params;
  const result = await runAlgorithm(id, session.user.id, parsed.data);

  if (!result.ok) {
    const statusMap: Record<string, number> = {
      forbidden: 403,
      not_found: 404,
      validation_error: 400,
      unsupported_algorithm: 400,
    };

    const codeMap: Record<string, string> = {
      forbidden: "PERMISSION_DENIED",
      not_found: "NOT_FOUND",
      validation_error: "VALIDATION_ERROR",
      unsupported_algorithm: "VALIDATION_ERROR",
    };

    return NextResponse.json(
      {
        error: {
          code: codeMap[result.error] ?? "SERVER_ERROR",
          message: result.message,
        },
      },
      { status: statusMap[result.error] ?? 500 }
    );
  }

  return NextResponse.json({
    run: {
      algorithm: result.data.result.algorithm,
      events: result.data.events,
      result: result.data.result,
    },
  });
}
