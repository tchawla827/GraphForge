"use client";

import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePlaybackStore } from "@/features/editor/store/playbackStore";
import {
  DEFAULT_PLAYBACK_PANEL_HEIGHT,
  useUiStore,
} from "@/features/editor/store/uiStore";
import { TimelineScrubber } from "./timeline/TimelineScrubber";
import { StepDescription } from "./timeline/StepDescription";
import { RunSummary } from "./timeline/RunSummary";
import { PlaybackLegend } from "./timeline/PlaybackLegend";
import { PlaybackInsights } from "./timeline/PlaybackInsights";

const SPEED_OPTIONS = [0.5, 1, 2, 4] as const;
const MIN_PANEL_HEIGHT = 120;
const FALLBACK_MAX_PANEL_HEIGHT = 640;

export function PlaybackPanel() {
  const {
    runStatus,
    currentStep,
    totalSteps,
    speed,
    stepForward,
    stepBackward,
    play,
    pause,
    restart,
    setSpeed,
  } = usePlaybackStore();
  const playbackPanelHeight = useUiStore((state) => state.playbackPanelHeight);
  const setPlaybackPanelHeight = useUiStore(
    (state) => state.setPlaybackPanelHeight
  );

  const dragStateRef = useRef<{ startY: number; startHeight: number } | null>(
    null
  );
  const [isResizing, setIsResizing] = useState(false);

  const clampPanelHeight = useCallback((height: number) => {
    if (typeof window === "undefined") {
      return Math.min(FALLBACK_MAX_PANEL_HEIGHT, Math.max(MIN_PANEL_HEIGHT, height));
    }

    const maxHeight = Math.min(
      FALLBACK_MAX_PANEL_HEIGHT,
      Math.max(MIN_PANEL_HEIGHT, Math.floor(window.innerHeight * 0.7))
    );

    return Math.min(maxHeight, Math.max(MIN_PANEL_HEIGHT, height));
  }, []);

  const stopResizing = useCallback(() => {
    dragStateRef.current = null;
    setIsResizing(false);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }, []);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState) return;

      const nextHeight =
        dragState.startHeight + (dragState.startY - event.clientY);
      setPlaybackPanelHeight(clampPanelHeight(nextHeight));
    },
    [clampPanelHeight, setPlaybackPanelHeight]
  );

  const handlePointerUp = useCallback(() => {
    stopResizing();
  }, [stopResizing]);

  useEffect(() => {
    if (!isResizing) return;

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp, isResizing]);

  useEffect(() => {
    return () => {
      stopResizing();
    };
  }, [stopResizing]);

  const handleResizeStart = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (runStatus === "idle" || runStatus === "invalidated") return;

      event.preventDefault();
      dragStateRef.current = {
        startY: event.clientY,
        startHeight: playbackPanelHeight,
      };
      setIsResizing(true);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "ns-resize";
    },
    [playbackPanelHeight, runStatus]
  );

  const handleResetHeight = useCallback(() => {
    setPlaybackPanelHeight(DEFAULT_PLAYBACK_PANEL_HEIGHT);
  }, [setPlaybackPanelHeight]);

  if (runStatus === "idle") {
    return (
      <div className="flex h-12 shrink-0 items-center justify-center border-t border-zinc-800 bg-zinc-950 px-4">
        <span className="text-xs text-zinc-600">
          Run an algorithm to see playback controls
        </span>
      </div>
    );
  }

  if (runStatus === "invalidated") {
    return (
      <div className="flex h-12 shrink-0 items-center justify-center gap-2 border-t border-zinc-800 bg-zinc-950 px-4">
        <span className="text-xs text-amber-400">
          Graph changed - run invalidated
        </span>
      </div>
    );
  }

  const isPlaying = runStatus === "playing";
  const atStart = currentStep <= -1;
  const atEnd = currentStep >= totalSteps - 1;

  return (
    <div
      className="flex shrink-0 flex-col border-t border-zinc-800 bg-zinc-950"
      data-testid="playback-panel"
      style={{ height: playbackPanelHeight }}
    >
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize playback panel"
        className={`flex h-3 shrink-0 cursor-row-resize items-center justify-center bg-zinc-950 ${
          isResizing ? "text-indigo-300" : "text-zinc-600 hover:text-zinc-400"
        }`}
        onPointerDown={handleResizeStart}
        onDoubleClick={handleResetHeight}
        title="Drag to resize. Double-click to reset height."
      >
        <div className="h-1 w-14 rounded-full bg-current/70" />
      </div>

      <div className="flex shrink-0 items-center gap-2 px-3 py-1.5">
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={restart}
            title="Restart"
            aria-label="Restart playback"
          >
            <RotateCcw size={12} />
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={stepBackward}
            disabled={atStart}
            title="Step back"
            aria-label="Step backward"
          >
            <SkipBack size={12} />
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={isPlaying ? pause : play}
            disabled={atEnd && !isPlaying}
            title={isPlaying ? "Pause" : "Play"}
            aria-label={isPlaying ? "Pause playback" : "Play"}
            className="text-indigo-400"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={stepForward}
            disabled={atEnd}
            title="Step forward"
            aria-label="Step forward"
          >
            <SkipForward size={12} />
          </Button>
        </div>

        <div className="ml-1 flex items-center gap-0.5">
          {SPEED_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setSpeed(option)}
              className={`rounded px-1 py-0.5 text-[10px] ${
                speed === option
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              aria-label={`Speed ${option}x`}
            >
              {option}x
            </button>
          ))}
        </div>

        <span
          className="ml-2 text-[10px] tabular-nums text-zinc-500"
          data-testid="step-counter"
        >
          {Math.max(0, currentStep + 1)}/{totalSteps}
        </span>

        <div className="mx-2 flex-1">
          <TimelineScrubber />
        </div>

        <div className="max-w-[280px] overflow-hidden">
          <StepDescription />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <PlaybackInsights />
        <PlaybackLegend />
        <RunSummary />
      </div>
    </div>
  );
}
