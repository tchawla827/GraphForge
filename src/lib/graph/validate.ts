import { z } from "zod";
import { getParallelEdgeKey } from "@/lib/graph/utils";

export const GraphConfigSchema = z.object({
  directed: z.boolean(),
  weighted: z.boolean(),
  allowSelfLoops: z.boolean(),
  allowParallelEdges: z.boolean(),
});

export const GraphNodeSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const GraphEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  weight: z.number().nullable().optional(),
  label: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const CanonicalGraphSchema = z
  .object({
    schemaVersion: z.literal(1),
    id: z.string().min(1),
    projectId: z.string().min(1),
    config: GraphConfigSchema,
    nodes: z.array(GraphNodeSchema),
    edges: z.array(GraphEdgeSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .superRefine((graph, ctx) => {
    if (graph.nodes.length > 200) {
      ctx.addIssue({
        code: "custom",
        path: ["nodes"],
        message: "Graph exceeds the maximum of 200 nodes",
      });
    }

    if (graph.edges.length > 1000) {
      ctx.addIssue({
        code: "custom",
        path: ["edges"],
        message: "Graph exceeds the maximum of 1000 edges",
      });
    }

    const nodeIds = new Set<string>();
    for (const [index, node] of graph.nodes.entries()) {
      if (nodeIds.has(node.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["nodes", index, "id"],
          message: `Duplicate node id "${node.id}"`,
        });
      }
      nodeIds.add(node.id);
    }

    const edgeIds = new Set<string>();
    const parallelKeys = new Set<string>();

    for (const [index, edge] of graph.edges.entries()) {
      if (edgeIds.has(edge.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["edges", index, "id"],
          message: `Duplicate edge id "${edge.id}"`,
        });
      }
      edgeIds.add(edge.id);

      if (!nodeIds.has(edge.source)) {
        ctx.addIssue({
          code: "custom",
          path: ["edges", index, "source"],
          message: `Edge source "${edge.source}" does not reference an existing node`,
        });
      }

      if (!nodeIds.has(edge.target)) {
        ctx.addIssue({
          code: "custom",
          path: ["edges", index, "target"],
          message: `Edge target "${edge.target}" does not reference an existing node`,
        });
      }

      if (!graph.config.allowSelfLoops && edge.source === edge.target) {
        ctx.addIssue({
          code: "custom",
          path: ["edges", index],
          message: "Self-loops are disabled by graph config",
        });
      }

      if (!graph.config.allowParallelEdges) {
        const key = getParallelEdgeKey(
          edge.source,
          edge.target,
          graph.config.directed
        );

        if (parallelKeys.has(key)) {
          ctx.addIssue({
            code: "custom",
            path: ["edges", index],
            message: "Parallel edges are disabled by graph config",
          });
        }

        parallelKeys.add(key);
      }
    }
  });

export type ValidatedCanonicalGraph = z.infer<typeof CanonicalGraphSchema>;
