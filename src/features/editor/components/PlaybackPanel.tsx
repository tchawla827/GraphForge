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
      <div className="flex h-12 shrink-0 items-center justify-center border-t border-white/5 bg-zinc-950/50 backdrop-blur-md px-4">
        <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600">
          Ready for algorithm execution
        </span>
      </div>
    );
  }

  if (runStatus === "invalidated") {
    return (
      <div className="flex h-12 shrink-0 items-center justify-center gap-2 border-t border-white/5 bg-zinc-950/50 backdrop-blur-md px-4">
        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500/80">
          Graph changed — run invalidated
        </span>
      </div>
    );
  }

  const isPlaying = runStatus === "playing";
  const atStart = currentStep <= -1;
  const atEnd = currentStep >= totalSteps - 1;

  return (
    <div
      className="flex shrink-0 flex-col border-t border-white/5 bg-zinc-950/50 backdrop-blur-md z-20 shadow-2xl"
      data-testid="playback-panel"
      style={{ height: playbackPanelHeight }}
    >
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Resize playback panel"
        className={`flex h-3 shrink-0 cursor-row-resize items-center justify-center transition-colors ${
          isResizing ? "bg-primary/20 text-primary" : "bg-transparent text-zinc-800 hover:text-zinc-600"
        }`}
        onPointerDown={handleResizeStart}
        onDoubleClick={handleResetHeight}
        title="Drag to resize. Double-click to reset height."
      >
        <div className="h-1 w-12 rounded-full bg-current" />
      </div>

      <div className="flex shrink-0 items-center gap-4 px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={restart}
            title="Restart"
            aria-label="Restart playback"
            className="hover:bg-white/10"
          >
            <RotateCcw size={14} />
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={stepBackward}
            disabled={atStart}
            title="Step back"
            aria-label="Step backward"
            className="hover:bg-white/10"
          >
            <SkipBack size={14} />
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={isPlaying ? pause : play}
            disabled={atEnd && !isPlaying}
            title={isPlaying ? "Pause" : "Play"}
            aria-label={isPlaying ? "Pause playback" : "Play"}
            className="text-primary hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={stepForward}
            disabled={atEnd}
            title="Step forward"
            aria-label="Step forward"
            className="hover:bg-white/10"
          >
            <SkipForward size={14} />
          </Button>
        </div>

        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
          {SPEED_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setSpeed(option)}
              className={`rounded-md px-2 py-1 text-[10px] font-bold transition-all ${
                speed === option
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              }`}
              aria-label={`Speed ${option}x`}
            >
              {option}x
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 min-w-[60px]">
          <span
            className="text-[11px] font-mono font-bold text-primary tabular-nums"
            data-testid="step-counter"
          >
            {String(Math.max(0, currentStep + 1)).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-zinc-600 font-bold">/</span>
          <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
            {String(totalSteps).padStart(2, '0')}
          </span>
        </div>

        <div className="flex-1 max-w-md">
          <TimelineScrubber />
        </div>

        <div className="flex-1 min-w-0 max-w-[400px]">
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
