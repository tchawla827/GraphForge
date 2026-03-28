import { create } from "zustand";
import type { CanonicalGraph, GraphNode, GraphEdge, GraphConfig } from "@/types/graph";
import {
  generateNodeId,
  generateEdgeId,
  getParallelEdgeKey,
  normalizeEdgesForConfig,
} from "@/lib/graph/utils";
import { useSelectionStore } from "@/features/editor/store/selectionStore";

interface GraphState {
  graph: CanonicalGraph | null;
  isDirty: boolean;
}

interface GraphActions {
  setGraph: (graph: CanonicalGraph) => void;
  addNode: (position: { x: number; y: number }) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (
    source: string,
    target: string,
    metadata?: Record<string, unknown>
  ) => void;
  removeEdge: (edgeId: string) => void;
  updateNode: (nodeId: string, patch: Partial<Pick<GraphNode, "label" | "position">>) => void;
  updateEdge: (
    edgeId: string,
    patch: Partial<Pick<GraphEdge, "weight" | "label" | "metadata">>
  ) => void;
  reconnectEdge: (
    edgeId: string,
    newSource: string,
    newTarget: string,
    metadata?: Record<string, unknown>
  ) => void;
  updateConfig: (patch: Partial<GraphConfig>) => void;
  markClean: () => void;
}

export const useGraphStore = create<GraphState & GraphActions>((set, get) => ({
  graph: null,
  isDirty: false,

  setGraph(graph) {
    useSelectionStore.getState().reconcileSelection(graph);
    set({ graph, isDirty: false });
  },

  addNode(position) {
    const { graph } = get();
    if (!graph) return;
    const newNode: GraphNode = {
      id: generateNodeId(),
      label: `Node ${graph.nodes.length + 1}`,
      position,
    };
    set({
      graph: { ...graph, nodes: [...graph.nodes, newNode] },
      isDirty: true,
    });
  },

  removeNode(nodeId) {
    const { graph } = get();
    if (!graph) return;
    const nextGraph = {
      ...graph,
      nodes: graph.nodes.filter((n) => n.id !== nodeId),
      edges: graph.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
    };
    useSelectionStore.getState().reconcileSelection(nextGraph);
    set({
      graph: nextGraph,
      isDirty: true,
    });
  },

  addEdge(source, target, metadata) {
    const { graph } = get();
    if (!graph) return;

    const { allowSelfLoops, allowParallelEdges } = graph.config;
    if (!allowSelfLoops && source === target) return;
    if (!allowParallelEdges) {
      const newEdgeKey = getParallelEdgeKey(source, target, graph.config.directed);
      const exists = graph.edges.some(
        (e) =>
          getParallelEdgeKey(e.source, e.target, graph.config.directed) ===
          newEdgeKey
      );
      if (exists) return;
    }

    const newEdge: GraphEdge = {
      id: generateEdgeId(),
      source,
      target,
      weight: null,
      label: null,
      metadata,
    };
    set({
      graph: { ...graph, edges: [...graph.edges, newEdge] },
      isDirty: true,
    });
  },

  removeEdge(edgeId) {
    const { graph } = get();
    if (!graph) return;
    const nextGraph = {
      ...graph,
      edges: graph.edges.filter((e) => e.id !== edgeId),
    };
    useSelectionStore.getState().reconcileSelection(nextGraph);
    set({
      graph: nextGraph,
      isDirty: true,
    });
  },

  updateNode(nodeId, patch) {
    const { graph } = get();
    if (!graph) return;
    set({
      graph: {
        ...graph,
        nodes: graph.nodes.map((n) =>
          n.id === nodeId ? { ...n, ...patch } : n
        ),
      },
      isDirty: true,
    });
  },

  updateEdge(edgeId, patch) {
    const { graph } = get();
    if (!graph) return;
    set({
      graph: {
        ...graph,
        edges: graph.edges.map((e) =>
          e.id === edgeId ? { ...e, ...patch } : e
        ),
      },
      isDirty: true,
    });
  },

  reconnectEdge(edgeId, newSource, newTarget, metadata) {
    const { graph } = get();
    if (!graph) return;

    const { allowSelfLoops, allowParallelEdges, directed } = graph.config;
    if (!allowSelfLoops && newSource === newTarget) return;
    if (!allowParallelEdges) {
      const newKey = getParallelEdgeKey(newSource, newTarget, directed);
      const exists = graph.edges.some(
        (e) =>
          e.id !== edgeId &&
          getParallelEdgeKey(e.source, e.target, directed) === newKey
      );
      if (exists) return;
    }

    set({
      graph: {
        ...graph,
        edges: graph.edges.map((e) =>
          e.id === edgeId
            ? { ...e, source: newSource, target: newTarget, metadata: metadata ?? e.metadata }
            : e
        ),
      },
      isDirty: true,
    });
  },

  updateConfig(patch) {
    const { graph } = get();
    if (!graph) return;
    const nextConfig = { ...graph.config, ...patch };
    const nextGraph = {
      ...graph,
      config: nextConfig,
      edges: normalizeEdgesForConfig(graph.edges, nextConfig),
    };
    useSelectionStore.getState().reconcileSelection(nextGraph);
    set({
      graph: nextGraph,
      isDirty: true,
    });
  },

  markClean() {
    set({ isDirty: false });
  },
}));
