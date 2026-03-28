import { prisma } from "@/lib/db/client";
import { getGraph, replaceGraph } from "@/server/graphService";
import type { CanonicalGraph } from "@/types/graph";
import type { GraphResult } from "@/server/graphService";

export type ImportType = "adjacency_list" | "adjacency_matrix" | "json";

/**
 * Merge real graph IDs into the placeholder graph returned by parsers, then
 * persist it via graphService.replaceGraph and record the import attempt.
 */
export async function importGraph(
  projectId: string,
  ownerId: string,
  parsedGraph: CanonicalGraph,
  importType: ImportType,
  filename?: string
): Promise<GraphResult<CanonicalGraph>> {
  // Fetch the existing graph to get the real graph record ID and projectId.
  const existing = await getGraph(projectId, ownerId);
  if (!existing.ok) {
    await recordImport(projectId, importType, "error", existing.message, filename);
    return existing;
  }

  // Stamp the parsed graph with real IDs so CanonicalGraphSchema validation passes.
  const stamped: CanonicalGraph = {
    ...parsedGraph,
    id: existing.data.id,
    projectId,
    createdAt: existing.data.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const result = await replaceGraph(projectId, ownerId, stamped);

  if (!result.ok) {
    await recordImport(projectId, importType, "error", result.message, filename);
    return result;
  }

  await recordImport(projectId, importType, "success", undefined, filename);
  return result;
}

async function recordImport(
  projectId: string,
  type: ImportType,
  status: "success" | "error",
  errorSummary?: string,
  filename?: string
) {
  try {
    await prisma.importRecord.create({
      data: {
        projectId,
        type,
        status,
        originalFilename: filename ?? null,
        errorSummary: errorSummary ?? null,
      },
    });
  } catch {
    // Never let DB logging failures propagate to the caller.
  }
}
