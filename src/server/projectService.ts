import { prisma } from "@/lib/db/client";
import type { Project } from "@prisma/client";

export interface CreateProjectInput {
  title: string;
  description?: string;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
}

export interface ProjectWithStats extends Project {
  nodeCount: number;
  edgeCount: number;
}

export type ProjectServiceError = "not_found" | "forbidden";

export type ProjectResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ProjectServiceError };

export async function createProject(
  ownerId: string,
  input: CreateProjectInput
): Promise<Project> {
  return prisma.project.create({
    data: {
      ownerId,
      title: input.title.trim(),
      description: input.description?.trim() ?? null,
      graphs: {
        create: {
          schemaVersion: 1,
          isDirected: true,
          isWeighted: false,
          allowSelfLoops: false,
          allowParallelEdges: false,
        },
      },
    },
  });
}

export async function listProjects(
  ownerId: string
): Promise<ProjectWithStats[]> {
  const projects = await prisma.project.findMany({
    where: { ownerId, archivedAt: null },
    orderBy: { updatedAt: "desc" },
    include: {
      graphs: {
        include: {
          _count: { select: { nodes: true, edges: true } },
        },
      },
    },
  });

  return projects.map((p) => {
    const graph = p.graphs[0];
    return {
      ...p,
      nodeCount: graph?._count.nodes ?? 0,
      edgeCount: graph?._count.edges ?? 0,
    };
  });
}

export async function getProject(
  projectId: string,
  ownerId: string
): Promise<ProjectResult<Project>> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project || project.archivedAt !== null) {
    return { ok: false, error: "not_found" };
  }
  if (project.ownerId !== ownerId) {
    return { ok: false, error: "forbidden" };
  }
  return { ok: true, data: project };
}

export async function updateProject(
  projectId: string,
  ownerId: string,
  input: UpdateProjectInput
): Promise<ProjectResult<Project>> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project || project.archivedAt !== null) {
    return { ok: false, error: "not_found" };
  }
  if (project.ownerId !== ownerId) {
    return { ok: false, error: "forbidden" };
  }

  const updatedProject = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description.trim() || null }
        : {}),
    },
  });

  return { ok: true, data: updatedProject };
}

export async function deleteProject(
  projectId: string,
  ownerId: string
): Promise<ProjectResult<null>> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });
  if (!project || project.archivedAt !== null) {
    return { ok: false, error: "not_found" };
  }
  if (project.ownerId !== ownerId) {
    return { ok: false, error: "forbidden" };
  }
  await prisma.project.update({
    where: { id: projectId },
    data: { archivedAt: new Date() },
  });
  return { ok: true, data: null };
}
