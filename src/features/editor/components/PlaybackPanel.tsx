"use client";

import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlaybackStore } from "@/features/editor/store/playbackStore";
import { TimelineScrubber } from "./timeline/TimelineScrubber";
import { StepDescription } from "./timeline/StepDescription";
import { RunSummary } from "./timeline/RunSummary";

const SPEED_OPTIONS = [0.5, 1, 2, 4] as const;

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

  if (runStatus === "idle") {
    return (
      <div className="h-12 border-t border-zinc-800 bg-zinc-950 flex items-center justify-center px-4 shrink-0">
        <span className="text-xs text-zinc-600">
          Run an algorithm to see playback controls
        </span>
      </div>
    );
  }

  if (runStatus === "invalidated") {
    return (
      <div className="h-12 border-t border-zinc-800 bg-zinc-950 flex items-center justify-center px-4 shrink-0 gap-2">
        <span className="text-xs text-amber-400">
          Graph changed — run invalidated
        </span>
      </div>
    );
  }

  const isPlaying = runStatus === "playing";
  const atStart = currentStep <= -1;
  const atEnd = currentStep >= totalSteps - 1;

  return (
    <div className="border-t border-zinc-800 bg-zinc-950 shrink-0">
      <div className="flex items-center gap-2 px-3 py-1.5">
        {/* Controls */}
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

        {/* Speed selector */}
        <div className="flex items-center gap-0.5 ml-1">
          {SPEED_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-1 py-0.5 text-[10px] rounded ${
                speed === s
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              aria-label={`Speed ${s}x`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Step counter */}
        <span className="text-[10px] text-zinc-500 ml-2 tabular-nums">
          {Math.max(0, currentStep + 1)}/{totalSteps}
        </span>

        {/* Scrubber */}
        <div className="flex-1 mx-2">
          <TimelineScrubber />
        </div>

        {/* Step description */}
        <div className="max-w-[200px] overflow-hidden">
          <StepDescription />
        </div>
      </div>

      <RunSummary />
    </div>
  );
}
