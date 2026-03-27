import type { NodeChange, EdgeChange, Connection } from "@xyflow/react";
import type { GraphConfig } from "@/types/graph";
import { useGraphStore } from "@/features/editor/store/graphStore";
import { getParallelEdgeKey } from "@/lib/graph/utils";

export function handleNodesChange(changes: NodeChange[]) {
  const { updateNode, removeNode } = useGraphStore.getState();

  for (const change of changes) {
    if (change.type === "position" && change.position) {
      updateNode(change.id, { position: change.position });
    }
    if (change.type === "remove") {
      removeNode(change.id);
    }
  }
}

export function handleEdgesChange(changes: EdgeChange[]) {
  const { removeEdge } = useGraphStore.getState();

  for (const change of changes) {
    if (change.type === "remove") {
      removeEdge(change.id);
    }
  }
}

export function handleConnect(
  connection: Connection,
  config: GraphConfig,
  metadata?: Record<string, unknown>
) {
  const { addEdge } = useGraphStore.getState();
  const { source, target } = connection;
  if (!source || !target) return;

  if (!config.allowSelfLoops && source === target) return;
  if (!config.allowParallelEdges) {
    const { graph } = useGraphStore.getState();
    if (!graph) return;
    const newEdgeKey = getParallelEdgeKey(source, target, config.directed);
    const exists = graph.edges.some(
      (e) => getParallelEdgeKey(e.source, e.target, config.directed) === newEdgeKey
    );
    if (exists) return;
  }

  addEdge(source, target, metadata);
}
