"use client";

import { memo, useCallback } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
  type Edge,
} from "@xyflow/react";
import type { GraphEdgeData } from "@/features/editor/adapters/toReactFlow";
import { useGraphStore } from "@/features/editor/store/graphStore";

type GraphEdge = Edge<GraphEdgeData>;

const visualStateColors: Record<string, string> = {
  idle: "#52525b",
  discovered: "#60a5fa",
  visited: "#818cf8",
  finalized: "#34d399",
  path: "#fbbf24",
  rejected: "#3f3f46",
};

function getQuadraticPoint(
  sourceX: number,
  sourceY: number,
  controlX: number,
  controlY: number,
  targetX: number,
  targetY: number,
  t: number
) {
  const oneMinusT = 1 - t;

  return {
    x:
      oneMinusT * oneMinusT * sourceX +
      2 * oneMinusT * t * controlX +
      t * t * targetX,
    y:
      oneMinusT * oneMinusT * sourceY +
      2 * oneMinusT * t * controlY +
      t * t * targetY,
  };
}

function getCubicPoint(
  sourceX: number,
  sourceY: number,
  control1X: number,
  control1Y: number,
  control2X: number,
  control2Y: number,
  targetX: number,
  targetY: number,
  t: number
) {
  const oneMinusT = 1 - t;

  return {
    x:
      oneMinusT * oneMinusT * oneMinusT * sourceX +
      3 * oneMinusT * oneMinusT * t * control1X +
      3 * oneMinusT * t * t * control2X +
      t * t * t * targetX,
    y:
      oneMinusT * oneMinusT * oneMinusT * sourceY +
      3 * oneMinusT * oneMinusT * t * control1Y +
      3 * oneMinusT * t * t * control2Y +
      t * t * t * targetY,
  };
}

export const EdgeComponent = memo(function EdgeComponent({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerStart,
  markerEnd,
  data,
  selected,
}: EdgeProps<GraphEdge>) {
  const { screenToFlowPosition } = useReactFlow();
  const anchoredSourceX = data?.sourceAnchor?.x ?? sourceX;
  const anchoredSourceY = data?.sourceAnchor?.y ?? sourceY;
  const anchoredTargetX = data?.targetAnchor?.x ?? targetX;
  const anchoredTargetY = data?.targetAnchor?.y ?? targetY;
  const controlPoint = data?.controlPoint;
  const isSelfLoop = source === target;

  const [defaultPath, defaultLabelX, defaultLabelY] = getBezierPath({
    sourceX: anchoredSourceX,
    sourceY: anchoredSourceY,
    sourcePosition: data?.sourceAnchor?.position ?? sourcePosition,
    targetX: anchoredTargetX,
    targetY: anchoredTargetY,
    targetPosition: data?.targetAnchor?.position ?? targetPosition,
  });

  const selfLoopCenterX = (anchoredSourceX + anchoredTargetX) / 2;
  const selfLoopCenterY = Math.max(anchoredSourceY, anchoredTargetY) + 12;
  const selfLoopLift = 72;
  const selfLoopSpread = 44;
  const selfLoopControl1 = {
    x: selfLoopCenterX + selfLoopSpread,
    y: selfLoopCenterY - selfLoopLift,
  };
  const selfLoopControl2 = {
    x: selfLoopCenterX - selfLoopSpread,
    y: selfLoopCenterY - selfLoopLift,
  };

  const path = isSelfLoop
    ? `M ${anchoredSourceX},${anchoredSourceY} C ${selfLoopControl1.x},${selfLoopControl1.y} ${selfLoopControl2.x},${selfLoopControl2.y} ${anchoredTargetX},${anchoredTargetY}`
    : controlPoint
      ? `M ${anchoredSourceX},${anchoredSourceY} Q ${controlPoint.x},${controlPoint.y} ${anchoredTargetX},${anchoredTargetY}`
      : defaultPath;
  const labelPoint = isSelfLoop
    ? getCubicPoint(
        anchoredSourceX,
        anchoredSourceY,
        selfLoopControl1.x,
        selfLoopControl1.y,
        selfLoopControl2.x,
        selfLoopControl2.y,
        anchoredTargetX,
        anchoredTargetY,
        0.5
      )
    : controlPoint
      ? getQuadraticPoint(
          anchoredSourceX,
          anchoredSourceY,
          controlPoint.x,
          controlPoint.y,
          anchoredTargetX,
          anchoredTargetY,
          0.5
        )
      : { x: defaultLabelX, y: defaultLabelY };
  const handlePoint = isSelfLoop
    ? {
        x: selfLoopCenterX,
        y: selfLoopCenterY - selfLoopLift,
      }
    : controlPoint ?? labelPoint;

  const color =
    visualStateColors[data?.visualState ?? "idle"] ?? visualStateColors.idle;
  const strokeWidth = selected ? 2.5 : 1.5;
  const parts = [
    data?.showLabel && data.label?.trim() ? data.label.trim() : null,
    data?.showWeight && data?.weighted && data.weight !== null
      ? String(data.weight)
      : null,
  ].filter(Boolean);
  const label = parts.length > 0 ? parts.join(" | ") : null;

  const onControlPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const move = (moveEvent: PointerEvent) => {
        const position = screenToFlowPosition({
          x: moveEvent.clientX,
          y: moveEvent.clientY,
        });

        useGraphStore.getState().updateEdge(id, {
          metadata: {
            ...(useGraphStore.getState().graph?.edges.find((edge) => edge.id === id)
              ?.metadata ?? {}),
            controlPoint: position,
          },
        });
      };

      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [id, screenToFlowPosition]
  );

  return (
    <>
      {selected && (
        <BaseEdge
          path={path}
          markerStart={markerStart}
          markerEnd={markerEnd}
          style={{
            stroke: "#818cf8",
            strokeWidth: 8,
            opacity: 0.35,
            filter: "blur(6px)",
          }}
        />
      )}
      <BaseEdge
        id={id}
        path={path}
        markerStart={markerStart}
        markerEnd={markerEnd}
        style={{ stroke: color, strokeWidth }}
      />
      {selected && !isSelfLoop && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${handlePoint.x}px, ${handlePoint.y}px)`,
              pointerEvents: "all",
            }}
            className="absolute nodrag nopan"
          >
            <div
              onPointerDown={onControlPointerDown}
              className="h-3 w-3 rounded-full border border-indigo-200 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.75)] cursor-grab active:cursor-grabbing"
              title="Drag to reshape edge"
            />
          </div>
        </EdgeLabelRenderer>
      )}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelPoint.x}px, ${labelPoint.y}px)`,
              pointerEvents: "all",
            }}
            className="absolute max-w-[160px] bg-zinc-900/95 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-zinc-300 font-mono text-center break-words nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
