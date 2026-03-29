import { prisma } from "@/lib/db/client";
import { Prisma } from "@prisma/client";
import { CanonicalGraphSchema } from "@/lib/graph/validate";
import type { CanonicalGraph } from "@/types/graph";

export type GraphServiceError =
  | "not_found"
  | "forbidden"
  | "validation_error";

export type GraphResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: GraphServiceError;
      message: string;
      details?: Record<string, unknown>;
    };

export async function getGraph(
  projectId: string,
  ownerId: string
): Promise<GraphResult<CanonicalGraph>> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      graphs: {
        include: { nodes: true, edges: true },
      },
    },
  });

  if (!project || project.archivedAt !== null) {
    return { ok: false, error: "not_found", message: "Graph not found" };
  }

  if (project.ownerId !== ownerId) {
    return { ok: false, error: "forbidden", message: "Access denied" };
  }

  const record = project.graphs;
  if (!record) {
    return { ok: false, error: "not_found", message: "Graph not found" };
  }

  const graph: CanonicalGraph = {
    schemaVersion: 1,
    id: record.id,
    projectId,
    config: {
      directed: record.isDirected,
      weighted: record.isWeighted,
      allowSelfLoops: record.allowSelfLoops,
      allowParallelEdges: record.allowParallelEdges,
    },
    nodes: record.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      position: { x: n.x, y: n.y },
      metadata: (n.metadataJson as Record<string, unknown>) ?? undefined,
    })),
    edges: record.edges.map((e) => ({
      id: e.id,
      source: e.sourceNodeId,
      target: e.targetNodeId,
      weight: e.weight ?? null,
      label: e.label ?? null,
      metadata: (e.metadataJson as Record<string, unknown>) ?? undefined,
    })),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };

  return { ok: true, data: graph };
}

export async function replaceGraph(
  projectId: string,
  ownerId: string,
  input: unknown
): Promise<GraphResult<CanonicalGraph>> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { graphs: true },
  });

  if (!project || project.archivedAt !== null) {
    return { ok: false, error: "not_found", message: "Graph not found" };
  }

  if (project.ownerId !== ownerId) {
    return { ok: false, error: "forbidden", message: "Access denied" };
  }

  const parsed = CanonicalGraphSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "validation_error",
      message: "Invalid graph payload",
      details: { issues: parsed.error.issues },
    };
  }

  const graph = parsed.data;
  const record = project.graphs;
  if (!record) {
    return { ok: false, error: "not_found", message: "Graph not found" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.graphRecord.update({
      where: { id: record.id },
      data: {
        isDirected: graph.config.directed,
        isWeighted: graph.config.weighted,
        allowSelfLoops: graph.config.allowSelfLoops,
        allowParallelEdges: graph.config.allowParallelEdges,
      },
    });

    await tx.nodeRecord.deleteMany({ where: { graphId: record.id } });
    await tx.edgeRecord.deleteMany({ where: { graphId: record.id } });

    if (graph.nodes.length > 0) {
      await tx.nodeRecord.createMany({
        data: graph.nodes.map((n) => ({
          id: n.id,
          graphId: record.id,
          label: n.label,
          x: n.position.x,
          y: n.position.y,
          metadataJson: n.metadata
            ? (n.metadata as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        })),
      });
    }

    if (graph.edges.length > 0) {
      await tx.edgeRecord.createMany({
        data: graph.edges.map((e) => ({
          id: e.id,
          graphId: record.id,
          sourceNodeId: e.source,
          targetNodeId: e.target,
          weight: e.weight ?? null,
          label: e.label ?? null,
          metadataJson: e.metadata
            ? (e.metadata as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        })),
      });
    }

    await tx.project.update({
      where: { id: projectId },
      data: { updatedAt: new Date() },
    });
  });

  const saved = await getGraph(projectId, ownerId);
  if (!saved.ok) {
    return {
      ok: false,
      error: saved.error,
      message: "Failed to read back saved graph",
    };
  }

  return { ok: true, data: saved.data };
}
