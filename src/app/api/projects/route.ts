import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { createProject, listProjects } from "@/server/projectService";
import { z } from "zod";

const CreateProjectBody = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "AUTH_REQUIRED", message: "Authentication required" } },
      { status: 401 }
    );
  }

  const projects = await listProjects(session.user.id);
  return NextResponse.json({ data: projects });
}

export async function POST(req: NextRequest) {
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

  const parsed = CreateProjectBody.safeParse(body);
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

  const project = await createProject(session.user.id, parsed.data);
  return NextResponse.json({ data: project }, { status: 201 });
}
