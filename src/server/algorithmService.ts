import { prisma } from "@/lib/db/client";
import { Prisma } from "@prisma/client";
import { getGraph, type GraphResult } from "@/server/graphService";
import { validateAlgorithmInput } from "@/lib/algorithms/validate";
import { getAlgorithm } from "@/lib/algorithms/registry";
import type { AlgorithmRunConfig } from "@/types/graph";
import type { AlgorithmOutput } from "@/lib/algorithms/types";

export type AlgorithmServiceError =
  | "not_found"
  | "forbidden"
  | "validation_error"
  | "unsupported_algorithm";

export type AlgorithmResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: AlgorithmServiceError; message: string };

export async function runAlgorithm(
  projectId: string,
  userId: string,
  config: AlgorithmRunConfig
): Promise<AlgorithmResult<AlgorithmOutput>> {
  // 1. Get the graph (includes auth + ownership check)
  const graphResult = await getGraph(projectId, userId);
  if (!graphResult.ok) {
    return {
      ok: false,
      error: graphResult.error as AlgorithmServiceError,
      message: graphResult.message,
    };
  }

  const graph = graphResult.data;

  // 2. Validate the algorithm input
  const validation = validateAlgorithmInput(graph, config);
  if (!validation.ok) {
    return {
      ok: false,
      error: "validation_error",
      message: validation.error,
    };
  }

  // 3. Get the algorithm function
  const algorithmFn = getAlgorithm(config.algorithm);
  if (!algorithmFn) {
    return {
      ok: false,
      error: "unsupported_algorithm",
      message: `Algorithm "${config.algorithm}" is not yet implemented.`,
    };
  }

  // 4. Run the algorithm
  const startMs = performance.now();
  const output = algorithmFn({ graph, config });
  const runtimeMs = Math.round(performance.now() - startMs);

  // Inject runtime
  output.result.metrics.runtimeMs = runtimeMs;

  // 5. Persist summary metadata (not the full event array)
  await prisma.algorithmRun.create({
    data: {
      projectId,
      algorithm: config.algorithm,
      sourceNodeId: config.sourceNodeId ?? null,
      targetNodeId: config.targetNodeId ?? null,
      configJson: config as unknown as Prisma.InputJsonValue,
      resultJson: output.result as unknown as Prisma.InputJsonValue,
      eventCount: output.events.length,
    },
  });

  return { ok: true, data: output };
}
