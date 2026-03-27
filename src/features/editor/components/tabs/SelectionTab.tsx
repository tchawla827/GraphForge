"use client";

import { useState } from "react";
import { useGraphStore } from "@/features/editor/store/graphStore";
import { useSelectionStore } from "@/features/editor/store/selectionStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { GraphNode, GraphEdge } from "@/types/graph";

function NodeEditor({ node }: { node: GraphNode }) {
  const { updateNode } = useGraphStore();
  const [label, setLabel] = useState(node.label);

  return (
    <div className="px-4 py-3 flex flex-col gap-3">
      <div className="text-xs text-zinc-500 font-mono">{node.id}</div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="node-label" className="text-zinc-300 text-xs">
          Label
        </Label>
        <Input
          id="node-label"
          value={label}
          onChange={(e) => {
            const nextLabel = e.target.value;
            setLabel(nextLabel);
            updateNode(node.id, { label: nextLabel });
          }}
          onBlur={() => {
            updateNode(node.id, { label });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateNode(node.id, { label });
              (e.target as HTMLInputElement).blur();
            }
          }}
          className="bg-zinc-900 border-zinc-700 text-zinc-100 h-8 text-sm"
        />
      </div>
    </div>
  );
}

function EdgeEditor({
  edge,
  weighted,
}: {
  edge: GraphEdge;
  weighted: boolean;
}) {
  const { updateEdge } = useGraphStore();
  const [weight, setWeight] = useState(
    edge.weight !== null && edge.weight !== undefined ? String(edge.weight) : ""
  );
  const [label, setLabel] = useState(edge.label ?? "");

  return (
    <div className="px-4 py-3 flex flex-col gap-3">
      <div className="text-xs text-zinc-500 font-mono">{edge.id}</div>
      {weighted && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edge-weight" className="text-zinc-300 text-xs">
            Weight
          </Label>
          <Input
            id="edge-weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={() => {
              const num = Number(weight);
              updateEdge(edge.id, {
                weight: weight === "" ? null : isNaN(num) ? null : num,
              });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            className="bg-zinc-900 border-zinc-700 text-zinc-100 h-8 text-sm"
          />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="edge-label" className="text-zinc-300 text-xs">
          Label
        </Label>
        <Input
          id="edge-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => {
            updateEdge(edge.id, { label: label.trim() || null });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="bg-zinc-900 border-zinc-700 text-zinc-100 h-8 text-sm"
        />
      </div>
    </div>
  );
}

export function SelectionTab() {
  const { graph } = useGraphStore();
  const { selectedNodeIds, selectedEdgeIds } = useSelectionStore();

  const selectedNode =
    selectedNodeIds.length === 1
      ? graph?.nodes.find((n) => n.id === selectedNodeIds[0])
      : null;

  const selectedEdge =
    selectedEdgeIds.length === 1
      ? graph?.edges.find((e) => e.id === selectedEdgeIds[0])
      : null;

  if (!selectedNode && !selectedEdge) {
    return (
      <div className="px-4 py-6 text-zinc-500 text-sm text-center">
        Select a node or edge to inspect
      </div>
    );
  }

  if (selectedNode) {
    return <NodeEditor key={selectedNode.id} node={selectedNode} />;
  }

  if (selectedEdge && graph) {
    return (
      <EdgeEditor
        key={selectedEdge.id}
        edge={selectedEdge}
        weighted={graph.config.weighted}
      />
    );
  }

  return null;
}
