import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { getProject, updateProject, deleteProject } from "@/server/projectService";
import { z } from "zod";

const UpdateProjectBody = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
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
  const project = await getProject(id, session.user.id);
  if (!project.ok) {
    return NextResponse.json(
      {
        error: {
          code: project.error === "forbidden" ? "PERMISSION_DENIED" : "NOT_FOUND",
          message:
            project.error === "forbidden"
              ? "You do not have access to this project"
              : "Project not found",
        },
      },
      { status: project.error === "forbidden" ? 403 : 404 }
    );
  }

  return NextResponse.json({ data: project.data });
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
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

  const parsed = UpdateProjectBody.safeParse(body);
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
  const project = await updateProject(id, session.user.id, parsed.data);
  if (!project.ok) {
    return NextResponse.json(
      {
        error: {
          code: project.error === "forbidden" ? "PERMISSION_DENIED" : "NOT_FOUND",
          message:
            project.error === "forbidden"
              ? "You do not have access to this project"
              : "Project not found",
        },
      },
      { status: project.error === "forbidden" ? 403 : 404 }
    );
  }

  return NextResponse.json({ data: project.data });
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
  const result = await deleteProject(id, session.user.id);
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

  return new NextResponse(null, { status: 204 });
}
