"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { GraphNodeData } from "@/features/editor/adapters/toReactFlow";
import { useUiStore } from "@/features/editor/store/uiStore";
import { cn } from "@/lib/utils";

type GraphNode = Node<GraphNodeData>;

const NODE_SIZE = 48;

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized.split("").map((char) => char + char).join("")
      : normalized;

  const parsed = Number.parseInt(value, 16);
  if (Number.isNaN(parsed)) {
    return { r: 113, g: 113, b: 122 };
  }

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

function getPlaybackNodeStyle(
  visualState: GraphNodeData["visualState"],
  playbackColors: ReturnType<typeof useUiStore.getState>["playbackColors"]
) {
  if (visualState === "idle") {
    return {
      backgroundColor: "#27272a",
      borderColor: "#52525b",
      color: "#e4e4e7",
    };
  }

  if (visualState === "rejected") {
    return {
      backgroundColor: "#18181b",
      borderColor: playbackColors.rejected,
      color: "#a1a1aa",
    };
  }

  const baseColor =
    visualState === "considered" || visualState === "discovered"
      ? playbackColors.discovered
      : visualState === "relaxed" || visualState === "finalized"
        ? playbackColors.finalized
        : visualState === "path"
          ? playbackColors.path
          : playbackColors.visited;
  const { r, g, b } = hexToRgb(baseColor);

  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.20)`,
    borderColor: baseColor,
    color: "#fafafa",
  };
}

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
  const { toolMode, playbackColors } = useUiStore();
  const connectMode = toolMode === "connect";
  const labelStyle = getLabelStyle(data.label);
  const playbackStyle = getPlaybackNodeStyle(data.visualState, playbackColors);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full border-2 text-xs font-semibold select-none transition-all",
        selected && "border-indigo-300"
      )}
      style={{
        width: NODE_SIZE,
        height: NODE_SIZE,
        backgroundColor: playbackStyle.backgroundColor,
        borderColor: selected ? undefined : playbackStyle.borderColor,
        color: playbackStyle.color,
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
