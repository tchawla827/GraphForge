"use client";

import { memo, useCallback, useState } from "react";
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
import { useUiStore } from "@/features/editor/store/uiStore";

type GraphEdge = Edge<GraphEdgeData>;

type EdgeEndpoint = "source" | "target";
type DragPreview = {
  endpoint: EdgeEndpoint;
  point: { x: number; y: number };
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

function getNodeTargetAtClientPoint(clientX: number, clientY: number) {
  const nodeElement = document
    .elementsFromPoint(clientX, clientY)
    .find((element) => element.classList.contains("react-flow__node"))
    ?.closest<HTMLElement>(".react-flow__node");
  const nodeId = nodeElement?.dataset.id;
  if (!nodeElement || !nodeId) {
    return null;
  }

  const rect = nodeElement.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return null;
  }

  return {
    nodeId,
    anchor: {
      x: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height)),
    },
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
  const playbackColors = useUiStore((state) => state.playbackColors);
  const [dragPreview, setDragPreview] = useState<DragPreview | null>(null);
  const anchoredSourceX = data?.sourceAnchor?.x ?? sourceX;
  const anchoredSourceY = data?.sourceAnchor?.y ?? sourceY;
  const anchoredTargetX = data?.targetAnchor?.x ?? targetX;
  const anchoredTargetY = data?.targetAnchor?.y ?? targetY;
  const controlPoint = data?.controlPoint;
  const isSelfLoop = source === target;
  const renderedSourceX =
    dragPreview?.endpoint === "source" ? dragPreview.point.x : anchoredSourceX;
  const renderedSourceY =
    dragPreview?.endpoint === "source" ? dragPreview.point.y : anchoredSourceY;
  const renderedTargetX =
    dragPreview?.endpoint === "target" ? dragPreview.point.x : anchoredTargetX;
  const renderedTargetY =
    dragPreview?.endpoint === "target" ? dragPreview.point.y : anchoredTargetY;

  const [defaultPath, defaultLabelX, defaultLabelY] = getBezierPath({
    sourceX: renderedSourceX,
    sourceY: renderedSourceY,
    sourcePosition: data?.sourceAnchor?.position ?? sourcePosition,
    targetX: renderedTargetX,
    targetY: renderedTargetY,
    targetPosition: data?.targetAnchor?.position ?? targetPosition,
  });

  const selfLoopCenterX = (renderedSourceX + renderedTargetX) / 2;
  const selfLoopCenterY = Math.max(renderedSourceY, renderedTargetY) + 12;
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
    ? `M ${renderedSourceX},${renderedSourceY} C ${selfLoopControl1.x},${selfLoopControl1.y} ${selfLoopControl2.x},${selfLoopControl2.y} ${renderedTargetX},${renderedTargetY}`
    : controlPoint
      ? `M ${renderedSourceX},${renderedSourceY} Q ${controlPoint.x},${controlPoint.y} ${renderedTargetX},${renderedTargetY}`
      : defaultPath;
  const labelPoint = isSelfLoop
    ? getCubicPoint(
        renderedSourceX,
        renderedSourceY,
        selfLoopControl1.x,
        selfLoopControl1.y,
        selfLoopControl2.x,
        selfLoopControl2.y,
        renderedTargetX,
        renderedTargetY,
        0.5
      )
    : controlPoint
      ? getQuadraticPoint(
          renderedSourceX,
          renderedSourceY,
          controlPoint.x,
          controlPoint.y,
          renderedTargetX,
          renderedTargetY,
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
    data?.visualState === "discovered"
      ? playbackColors.discovered
      : data?.visualState === "visited"
        ? playbackColors.visited
        : data?.visualState === "finalized"
          ? playbackColors.finalized
          : data?.visualState === "considered"
            ? playbackColors.considered
            : data?.visualState === "relaxed"
              ? playbackColors.relaxed
              : data?.visualState === "path"
                ? playbackColors.path
                : data?.visualState === "rejected"
                  ? playbackColors.rejected
                  : "#52525b";
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

  const onEndpointPointerDown = useCallback(
    (endpoint: EdgeEndpoint) => (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      document.body.style.cursor = "grabbing";

      const setPreviewPoint = (clientX: number, clientY: number) => {
        setDragPreview({
          endpoint,
          point: screenToFlowPosition({ x: clientX, y: clientY }),
        });
      };

      setPreviewPoint(event.clientX, event.clientY);

      const move = (moveEvent: PointerEvent) => {
        setPreviewPoint(moveEvent.clientX, moveEvent.clientY);
      };

      const up = (upEvent: PointerEvent) => {
        document.body.style.cursor = "";
        setDragPreview(null);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);

        const nextTarget = getNodeTargetAtClientPoint(
          upEvent.clientX,
          upEvent.clientY
        );
        if (!nextTarget) {
          return;
        }

        const graphEdge = useGraphStore
          .getState()
          .graph?.edges.find((edge) => edge.id === id);
        if (!graphEdge) {
          return;
        }

        const metadata = { ...(graphEdge.metadata ?? {}) };
        delete metadata.controlPoint;

        if (endpoint === "target") {
          metadata.targetAnchor = nextTarget.anchor;
          useGraphStore.getState().reconnectEdge(
            id,
            graphEdge.source,
            nextTarget.nodeId,
            metadata
          );
          return;
        }

        metadata.sourceAnchor = nextTarget.anchor;
        useGraphStore.getState().reconnectEdge(
          id,
          nextTarget.nodeId,
          graphEdge.target,
          metadata
        );
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up, { once: true });
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
              zIndex: 2,
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
      {selected && !isSelfLoop && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${renderedSourceX}px, ${renderedSourceY}px)`,
              pointerEvents: "all",
              zIndex: 3,
            }}
            className="absolute nodrag nopan"
          >
            <div
              onPointerDown={onEndpointPointerDown("source")}
              className="h-2.5 w-2.5 rounded-full border border-zinc-200 bg-zinc-700 shadow-[0_0_8px_rgba(24,24,27,0.9)] cursor-grab active:cursor-grabbing"
              title="Drag edge tail to reconnect"
            />
          </div>
        </EdgeLabelRenderer>
      )}
      {selected && !isSelfLoop && (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${renderedTargetX}px, ${renderedTargetY}px)`,
              pointerEvents: "all",
              zIndex: 3,
            }}
            className="absolute nodrag nopan"
          >
            <div
              onPointerDown={onEndpointPointerDown("target")}
              className="h-3.5 w-3.5 rounded-full border border-emerald-200 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.75)] cursor-grab active:cursor-grabbing"
              title="Drag edge head to reconnect"
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
              zIndex: 1,
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
