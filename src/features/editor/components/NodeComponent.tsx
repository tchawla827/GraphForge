"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { GraphNodeData } from "@/features/editor/adapters/toReactFlow";
import { useUiStore } from "@/features/editor/store/uiStore";
import { cn } from "@/lib/utils";

type GraphNode = Node<GraphNodeData>;

const NODE_SIZE = 48;

const visualStateClasses: Record<string, string> = {
  idle: "bg-zinc-800 border-zinc-600 text-zinc-200",
  discovered: "bg-blue-900 border-blue-400 text-blue-100",
  visited: "bg-indigo-900 border-indigo-400 text-indigo-100",
  finalized: "bg-emerald-900 border-emerald-400 text-emerald-100",
  path: "bg-amber-900 border-amber-400 text-amber-100",
  rejected: "bg-zinc-900 border-zinc-700 text-zinc-500",
};

function getLabelStyle(label: string) {
  const length = label.trim().length;

  if (length <= 4) {
    return { fontSize: 12, lineHeight: 1.05 };
  }

  if (length <= 8) {
    return { fontSize: 10, lineHeight: 1.05 };
  }

  if (length <= 14) {
    return { fontSize: 8, lineHeight: 1 };
  }

  return { fontSize: 6, lineHeight: 1 };
}

export const NodeComponent = memo(function NodeComponent({
  data,
  selected,
}: NodeProps<GraphNode>) {
  const { toolMode } = useUiStore();
  const stateClass =
    visualStateClasses[data.visualState] ?? visualStateClasses.idle;
  const connectMode = toolMode === "connect";
  const labelStyle = getLabelStyle(data.label);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full border-2 text-xs font-semibold select-none transition-all",
        stateClass,
        selected && "border-indigo-300"
      )}
      style={{
        width: NODE_SIZE,
        height: NODE_SIZE,
        boxShadow: selected
          ? "0 0 0 1px rgba(165, 180, 252, 0.9), 0 0 12px rgba(99, 102, 241, 0.8), 0 0 28px rgba(99, 102, 241, 0.45)"
          : undefined,
      }}
    >
      <Handle
        type="source"
        position={Position.Top}
        id="surface"
        isConnectableStart={connectMode}
        isConnectableEnd={connectMode}
        className={cn(
          "!left-0 !top-0 !m-0 !border-0 !bg-transparent !opacity-0",
          connectMode
            ? "!pointer-events-auto cursor-crosshair"
            : "!pointer-events-none"
        )}
        style={{
          width: NODE_SIZE,
          height: NODE_SIZE,
          transform: "none",
          borderRadius: "9999px",
        }}
      />

      <span
        className="px-1 max-w-[40px] text-center whitespace-normal break-words overflow-hidden"
        style={labelStyle}
      >
        {data.label}
      </span>
    </div>
  );
});
