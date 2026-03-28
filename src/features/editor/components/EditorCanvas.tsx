"use client";

import { useCallback, useMemo, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ConnectionMode,
  getBezierPath,
  useReactFlow,
  type NodeChange,
  type EdgeChange,
  type ConnectionLineComponentProps,
  type OnConnectStartParams,
  type FinalConnectionState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useGraphStore } from "@/features/editor/store/graphStore";
import { useSelectionStore } from "@/features/editor/store/selectionStore";
import { useUiStore } from "@/features/editor/store/uiStore";
import { usePlaybackStore } from "@/features/editor/store/playbackStore";
import { toReactFlow } from "@/features/editor/adapters/toReactFlow";
import {
  handleNodesChange,
  handleEdgesChange,
  handleConnect,
} from "@/features/editor/adapters/fromReactFlow";
import { NodeComponent } from "./NodeComponent";
import { EdgeComponent } from "./EdgeComponent";

const nodeTypes = { graphNode: NodeComponent };
const edgeTypes = { graphEdge: EdgeComponent };
const NODE_SIZE = 48;

type Anchor = { x: number; y: number };

function getEventClientPosition(event: MouseEvent | TouchEvent): Anchor | null {
  if ("touches" in event && event.touches.length > 0) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }

  if ("changedTouches" in event && event.changedTouches.length > 0) {
    return {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY,
    };
  }

  if ("clientX" in event) {
    return { x: event.clientX, y: event.clientY };
  }

  return null;
}

function getNodeRelativeAnchor(nodeId: string, client: Anchor) {
  const nodeElement = document.querySelector<HTMLElement>(
    `.react-flow__node[data-id="${nodeId}"]`
  );
  if (!nodeElement) return undefined;

  const rect = nodeElement.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return undefined;

  return {
    x: Math.min(1, Math.max(0, (client.x - rect.left) / rect.width)),
    y: Math.min(1, Math.max(0, (client.y - rect.top) / rect.height)),
  };
}

interface EditorCanvasProps {
  readOnly?: boolean;
}

export function EditorCanvas({ readOnly = false }: EditorCanvasProps) {
  const { graph, addNode, removeNode } = useGraphStore();
  const {
    selectedNodeIds,
    selectedEdgeIds,
    selectNodes,
    selectEdges,
    clearSelection,
  } = useSelectionStore();
  const { toolMode, showEdgeLabels, showEdgeWeights } = useUiStore();
  const visualHighlights = usePlaybackStore((s) => s.visualHighlights);
  const { screenToFlowPosition } = useReactFlow();
  const pendingConnectionAnchor = useRef<{
    nodeId: string;
    sourceAnchor?: { x: number; y: number };
  } | null>(null);

  const hasHighlights = Object.keys(visualHighlights).length > 0;
  const flow = useMemo(
    () =>
      graph
        ? toReactFlow(
            graph,
            hasHighlights ? visualHighlights : undefined,
            { selectedNodeIds, selectedEdgeIds },
            { showEdgeLabels, showEdgeWeights }
          )
        : { nodes: [], edges: [] },
    [graph, visualHighlights, hasHighlights, selectedNodeIds, selectedEdgeIds, showEdgeLabels, showEdgeWeights]
  );
  const { nodes, edges } = flow;

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    handleNodesChange(changes);
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    handleEdgesChange(changes);
  }, []);

  const onConnectStart = useCallback(
    (event: MouseEvent | TouchEvent, params: OnConnectStartParams) => {
      if (!params.nodeId) {
        pendingConnectionAnchor.current = null;
        return;
      }

      const client = getEventClientPosition(event);
      pendingConnectionAnchor.current = {
        nodeId: params.nodeId,
        sourceAnchor: client
          ? getNodeRelativeAnchor(params.nodeId, client)
          : undefined,
      };
    },
    []
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
      if (!graph) return;

      const pending = pendingConnectionAnchor.current;
      pendingConnectionAnchor.current = null;

      const source = pending?.nodeId ?? connectionState.fromNode?.id;
      const target = connectionState.toNode?.id;
      if (!source || !target) return;

      const client = getEventClientPosition(event);
      const targetAnchor =
        client && target ? getNodeRelativeAnchor(target, client) : undefined;

      handleConnect(
        {
          source,
          target,
          sourceHandle: null,
          targetHandle: null,
        },
        graph.config,
        {
          sourceAnchor: pending?.sourceAnchor,
          targetAnchor,
        }
      );
    },
    [graph]
  );

  const connectionLineComponent = useCallback(
    ({
      fromX,
      fromY,
      toX,
      toY,
      fromPosition,
      toPosition,
    }: ConnectionLineComponentProps) => {
      const pending = pendingConnectionAnchor.current;
      const sourceNode = pending?.nodeId
        ? graph?.nodes.find((node) => node.id === pending.nodeId)
        : undefined;
      const sourceX =
        sourceNode && pending?.sourceAnchor
          ? sourceNode.position.x + pending.sourceAnchor.x * NODE_SIZE
          : fromX;
      const sourceY =
        sourceNode && pending?.sourceAnchor
          ? sourceNode.position.y + pending.sourceAnchor.y * NODE_SIZE
          : fromY;

      const [path] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition: fromPosition,
        targetX: toX,
        targetY: toY,
        targetPosition: toPosition,
      });

      return <path d={path} fill="none" stroke="#818cf8" strokeWidth={1.5} />;
    },
    [graph]
  );

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (readOnly) return;
      if (toolMode === "addNode") {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        addNode(position);
      } else {
        clearSelection();
      }
    },
    [readOnly, toolMode, addNode, clearSelection, screenToFlowPosition]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      if (readOnly) return;
      if (toolMode === "delete") {
        removeNode(node.id);
      } else {
        selectNodes([node.id]);
      }
    },
    [readOnly, toolMode, removeNode, selectNodes]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: { id: string }) => {
      if (readOnly) return;
      if (toolMode === "delete") {
        useGraphStore.getState().removeEdge(edge.id);
      } else {
        selectEdges([edge.id]);
      }
    },
    [readOnly, toolMode, selectEdges]
  );

  const onSelectionChange = useCallback(
    ({
      nodes: selNodes,
      edges: selEdges,
    }: {
      nodes: { id: string }[];
      edges: { id: string }[];
    }) => {
      if (selNodes.length > 0) {
        selectNodes(selNodes.map((n) => n.id));
      } else if (selEdges.length > 0) {
        selectEdges(selEdges.map((e) => e.id));
      }
    },
    [selectNodes, selectEdges]
  );

  const hint =
    toolMode === "addNode"
      ? "Click the canvas to add a node - Escape to cancel"
      : toolMode === "connect"
        ? "Drag from anywhere on a node to anywhere on another node"
        : toolMode === "delete"
          ? "Click a node or edge to delete it"
          : null;

  return (
    <div className="flex-1 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnectStart={readOnly ? undefined : onConnectStart}
        onConnectEnd={readOnly ? undefined : onConnectEnd}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onSelectionChange={onSelectionChange}
        connectionMode={ConnectionMode.Loose}
        connectionLineComponent={readOnly ? undefined : connectionLineComponent}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        fitView
        deleteKeyCode={null}
        colorMode="dark"
        className="bg-zinc-950"
        style={{ cursor: !readOnly && toolMode === "addNode" ? "crosshair" : undefined }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#27272a"
        />
        <Controls className="[&>button]:bg-zinc-800 [&>button]:border-zinc-700 [&>button]:text-zinc-300" />
        <MiniMap
          nodeColor="#4f46e5"
          maskColor="rgba(0,0,0,0.6)"
          className="!bg-zinc-900 !border-zinc-800"
        />
      </ReactFlow>

      {hint && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 rounded-full px-3 py-1 text-xs text-zinc-300 pointer-events-none whitespace-nowrap">
          {hint}
        </div>
      )}
    </div>
  );
}
