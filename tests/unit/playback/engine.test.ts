import { describe, expect, it, vi, afterEach } from "vitest";
import { PlaybackEngine } from "../../../src/lib/playback/engine";
import type { PlaybackEvent } from "../../../src/types/events";

function makeEvents(count: number): PlaybackEvent[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `evt_${i}`,
    stepIndex: i,
    type: "NODE_VISITED" as const,
    payload: { nodeId: `n${i}` },
    message: `Step ${i}`,
  }));
}

describe("PlaybackEngine", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with currentStep -1", () => {
    const engine = new PlaybackEngine(makeEvents(5));
    expect(engine.currentStep).toBe(-1);
    expect(engine.totalSteps).toBe(5);
  });

  it("next() advances step index", () => {
    const engine = new PlaybackEngine(makeEvents(3));

    const e1 = engine.next();
    expect(e1?.stepIndex).toBe(0);
    expect(engine.currentStep).toBe(0);

    const e2 = engine.next();
    expect(e2?.stepIndex).toBe(1);
    expect(engine.currentStep).toBe(1);
  });

  it("next() returns null at end", () => {
    const engine = new PlaybackEngine(makeEvents(2));
    engine.next();
    engine.next();
    expect(engine.next()).toBeNull();
    expect(engine.currentStep).toBe(1);
  });

  it("previous() rewinds step index", () => {
    const engine = new PlaybackEngine(makeEvents(3));
    engine.next();
    engine.next();
    expect(engine.currentStep).toBe(1);

    const e = engine.previous();
    expect(e?.stepIndex).toBe(0);
    expect(engine.currentStep).toBe(0);
  });

  it("previous() returns null at start", () => {
    const engine = new PlaybackEngine(makeEvents(3));
    expect(engine.previous()).toBeNull();

    engine.next();
    expect(engine.previous()).toBeNull();
    expect(engine.currentStep).toBe(-1);
    expect(engine.previous()).toBeNull();
  });

  it("goTo(n) jumps to arbitrary step", () => {
    const engine = new PlaybackEngine(makeEvents(5));

    const e = engine.goTo(3);
    expect(e?.stepIndex).toBe(3);
    expect(engine.currentStep).toBe(3);
  });

  it("goTo() returns null for out-of-range index", () => {
    const engine = new PlaybackEngine(makeEvents(3));
    engine.goTo(1);
    expect(engine.goTo(-1)).toBeNull();
    expect(engine.currentStep).toBe(-1);
    expect(engine.goTo(5)).toBeNull();
  });

  it("play() fires onStep callback at interval", () => {
    vi.useFakeTimers();
    const engine = new PlaybackEngine(makeEvents(3));
    const steps: number[] = [];

    engine.play((e) => steps.push(e.stepIndex), 100);
    expect(engine.isPlaying).toBe(true);

    vi.advanceTimersByTime(100);
    expect(steps).toEqual([0]);

    vi.advanceTimersByTime(100);
    expect(steps).toEqual([0, 1]);

    vi.advanceTimersByTime(100);
    expect(steps).toEqual([0, 1, 2]);

    // Auto-stops after last event
    vi.advanceTimersByTime(100);
    expect(steps).toEqual([0, 1, 2]);
    expect(engine.isPlaying).toBe(false);

    vi.useRealTimers();
  });

  it("pause() stops playback", () => {
    vi.useFakeTimers();
    const engine = new PlaybackEngine(makeEvents(5));
    const steps: number[] = [];

    engine.play((e) => steps.push(e.stepIndex), 100);
    vi.advanceTimersByTime(200);
    engine.pause();

    expect(engine.isPlaying).toBe(false);
    vi.advanceTimersByTime(300);
    expect(steps.length).toBe(2); // no more steps after pause

    vi.useRealTimers();
  });

  it("restart() resets to beginning", () => {
    const engine = new PlaybackEngine(makeEvents(5));
    engine.next();
    engine.next();
    engine.next();
    expect(engine.currentStep).toBe(2);

    engine.restart();
    expect(engine.currentStep).toBe(-1);
    expect(engine.isPlaying).toBe(false);
  });
});
