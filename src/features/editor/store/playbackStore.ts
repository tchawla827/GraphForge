"use client";

import { create } from "zustand";
import type { PlaybackEvent, AlgorithmRunResult } from "@/types/events";
import type { PlaybackHighlights } from "@/features/editor/adapters/toReactFlow";
import { PlaybackEngine } from "@/lib/playback/engine";
import { computeVisualState } from "@/lib/playback/applyEvent";
import type { RunStatus } from "@/lib/playback/types";

interface PlaybackState {
  events: PlaybackEvent[];
  result: AlgorithmRunResult | null;
  engine: PlaybackEngine | null;
  runStatus: RunStatus;
  currentStep: number;
  totalSteps: number;
  visualHighlights: PlaybackHighlights;
  speed: number; // multiplier: 0.5, 1, 2, 4
}

interface PlaybackActions {
  startRun: (events: PlaybackEvent[], result: AlgorithmRunResult) => void;
  invalidateRun: () => void;
  clearRun: () => void;
  setStep: (index: number) => void;
  stepForward: () => void;
  stepBackward: () => void;
  play: () => void;
  pause: () => void;
  restart: () => void;
  setSpeed: (speed: number) => void;
}

const BASE_INTERVAL_MS = 500;

export const usePlaybackStore = create<PlaybackState & PlaybackActions>(
  (set, get) => ({
    events: [],
    result: null,
    engine: null,
    runStatus: "idle",
    currentStep: -1,
    totalSteps: 0,
    visualHighlights: {},
    speed: 1,

    startRun(events, result) {
      const { engine: oldEngine } = get();
      oldEngine?.dispose();

      const engine = new PlaybackEngine(events);
      set({
        events,
        result,
        engine,
        runStatus: "ready",
        currentStep: -1,
        totalSteps: events.length,
        visualHighlights: {},
      });
    },

    invalidateRun() {
      const { engine } = get();
      engine?.dispose();
      set({
        runStatus: "invalidated",
        engine: null,
      });
    },

    clearRun() {
      const { engine } = get();
      engine?.dispose();
      set({
        events: [],
        result: null,
        engine: null,
        runStatus: "idle",
        currentStep: -1,
        totalSteps: 0,
        visualHighlights: {},
      });
    },

    setStep(index) {
      const { engine, events } = get();
      if (!engine) return;
      engine.goTo(index);
      set({
        currentStep: index,
        visualHighlights: computeVisualState(events, index) as PlaybackHighlights,
      });
    },

    stepForward() {
      const { engine, events } = get();
      if (!engine) return;
      const event = engine.next();
      if (event) {
        const step = engine.currentStep;
        set({
          currentStep: step,
          runStatus: "ready",
          visualHighlights: computeVisualState(events, step) as PlaybackHighlights,
        });
      }
    },

    stepBackward() {
      const { engine, events } = get();
      if (!engine) return;
      const event = engine.previous();
      if (event) {
        const step = engine.currentStep;
        set({
          currentStep: step,
          runStatus: "ready",
          visualHighlights: computeVisualState(events, step) as PlaybackHighlights,
        });
      }
    },

    play() {
      const { engine, events, speed } = get();
      if (!engine) return;

      set({ runStatus: "playing" });

      engine.play(
        () => {
          const step = engine.currentStep;
          set({
            currentStep: step,
            visualHighlights: computeVisualState(events, step) as PlaybackHighlights,
          });

          // Auto-pause at the end
          if (step >= events.length - 1) {
            set({ runStatus: "ready" });
          }
        },
        BASE_INTERVAL_MS / speed
      );
    },

    pause() {
      const { engine } = get();
      if (!engine) return;
      engine.pause();
      set({ runStatus: "ready" });
    },

    restart() {
      const { engine } = get();
      if (!engine) return;
      engine.restart();
      set({
        currentStep: -1,
        runStatus: "ready",
        visualHighlights: {},
      });
    },

    setSpeed(speed) {
      const { runStatus } = get();
      set({ speed });
      // If currently playing, restart play with new speed
      if (runStatus === "playing") {
        get().pause();
        get().play();
      }
    },
  })
);
