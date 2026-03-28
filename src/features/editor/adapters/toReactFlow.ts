import { Position, type Node, type Edge } from "@xyflow/react";
import type { CanonicalGraph } from "@/types/graph";

const NODE_SIZE = 48;

export type VisualState =
  | "idle"
  | "discovered"
  | "visited"
  | "finalized"
  | "considered"
  | "relaxed"
  | "path"
  | "rejected";

export type PlaybackHighlights = Record<string, VisualState>;

export interface GraphNodeData extends Record<string, unknown> {
  label: string;
  visualState: VisualState;
}

export interface GraphEdgeData extends Record<string, unknown> {
  label: string | null;
  weight: number | null;
  weighted: boolean;
  showLabel: boolean;
  showWeight: boolean;
  visualState: VisualState;
  sourceAnchor?: { x: number; y: number; position: Position };
  targetAnchor?: { x: number; y: number; position: Position };
  controlPoint?: { x: number; y: number };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getAnchorPosition(x: number, y: number): Position {
  const distances = [
    { position: Position.Top, distance: y },
    { position: Position.Right, distance: 1 - x },
    { position: Position.Bottom, distance: 1 - y },
    { position: Position.Left, distance: x },
  ];

  distances.sort((a, b) => a.distance - b.distance);
  return distances[0].position;
}

function getCircularAnchor(
  node: CanonicalGraph["nodes"][number],
  anchor?: { x?: number; y?: number }
) {
  const x = clamp(anchor?.x ?? 0.5, 0, 1);
  const y = clamp(anchor?.y ?? 0.5, 0, 1);
  const center = NODE_SIZE / 2;
  const radius = NODE_SIZE / 2;

  let dx = x * NODE_SIZE - center;
  let dy = y * NODE_SIZE - center;

  if (dx === 0 && dy === 0) {
    dx = radius;
    dy = 0;
  }

  const scale = radius / Math.hypot(dx, dy);
  const edgeX = center + dx * scale;
  const edgeY = center + dy * scale;

  return {
    x: node.position.x + edgeX,
    y: node.position.y + edgeY,
    position: getAnchorPosition(edgeX / NODE_SIZE, edgeY / NODE_SIZE),
  };
}

function getDirectionalAnchor(
  fromNode: CanonicalGraph["nodes"][number],
  toNode: CanonicalGraph["nodes"][number]
) {
  const dx = toNode.position.x - fromNode.position.x;
  const dy = toNode.position.y - fromNode.position.y;
  const distance = Math.hypot(dx, dy);

  if (distance === 0) {
    return { x: 1, y: 0.5 };
  }

  return {
    x: clamp(0.5 + dx / (2 * distance), 0, 1),
    y: clamp(0.5 + dy / (2 * distance), 0, 1),
  };
}

export function toReactFlow(
  graph: CanonicalGraph,
  playbackHighlights?: PlaybackHighlights,
  selection?: {
    selectedNodeIds?: string[];
    selectedEdgeIds?: string[];
  },
  display?: {
    showEdgeLabels?: boolean;
    showEdgeWeights?: boolean;
  }
): { nodes: Node<GraphNodeData>[]; edges: Edge<GraphEdgeData>[] } {
  const highlights = playbackHighlights ?? {};
  const selectedNodeIds = new Set(selection?.selectedNodeIds ?? []);
  const selectedEdgeIds = new Set(selection?.selectedEdgeIds ?? []);
  const showEdgeLabels = display?.showEdgeLabels ?? true;
  const showEdgeWeights = display?.showEdgeWeights ?? true;

  const nodes: Node<GraphNodeData>[] = graph.nodes.map((n) => ({
    id: n.id,
    type: "graphNode",
    position: { x: n.position.x, y: n.position.y },
    selected: selectedNodeIds.has(n.id),
    data: {
      label: n.label,
      visualState: (highlights[n.id] ?? "idle") as VisualState,
    },
  }));

  const nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));

  const edges: Edge<GraphEdgeData>[] = graph.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "graphEdge",
    selected: selectedEdgeIds.has(e.id),
    markerEnd: graph.config.directed
      ? { type: "arrowclosed" as const }
      : undefined,
    data: {
      label: e.label ?? null,
      weight: e.weight ?? null,
      weighted: graph.config.weighted,
      showLabel: showEdgeLabels,
      showWeight: showEdgeWeights,
      visualState: (highlights[e.id] ?? "idle") as VisualState,
      sourceAnchor: (() => {
        const node = nodeMap.get(e.source);
        const otherNode = nodeMap.get(e.target);
        if (!node) return undefined;
        const anchor = (
          e.source === e.target
            ? { x: 0.78, y: 0.24 }
            : e.metadata?.sourceAnchor ??
              (otherNode ? getDirectionalAnchor(node, otherNode) : undefined)
        ) as
          | { x?: number; y?: number }
          | undefined;
        return getCircularAnchor(node, anchor);
      })(),
      targetAnchor: (() => {
        const node = nodeMap.get(e.target);
        const otherNode = nodeMap.get(e.source);
        if (!node) return undefined;
        const anchor = (
          e.source === e.target
            ? { x: 0.22, y: 0.24 }
            : e.metadata?.targetAnchor ??
              (otherNode ? getDirectionalAnchor(node, otherNode) : undefined)
        ) as
          | { x?: number; y?: number }
          | undefined;
        return getCircularAnchor(node, anchor);
      })(),
      controlPoint: (() => {
        const controlPoint = e.metadata?.controlPoint as
          | { x?: number; y?: number }
          | undefined;
        if (
          typeof controlPoint?.x !== "number" ||
          typeof controlPoint?.y !== "number"
        ) {
          return undefined;
        }

        return { x: controlPoint.x, y: controlPoint.y };
      })(),
    },
  }));

  return { nodes, edges };
}
