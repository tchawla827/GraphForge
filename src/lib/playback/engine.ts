import type { PlaybackEvent } from "@/types/events";

export class PlaybackEngine {
  private _currentStep = -1;
  private _intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly events: readonly PlaybackEvent[]) {}

  get currentStep(): number {
    return this._currentStep;
  }

  get totalSteps(): number {
    return this.events.length;
  }

  get isPlaying(): boolean {
    return this._intervalId !== null;
  }

  get currentEvent(): PlaybackEvent | null {
    if (this._currentStep < 0 || this._currentStep >= this.events.length) {
      return null;
    }
    return this.events[this._currentStep];
  }

  next(): PlaybackEvent | null {
    if (this._currentStep >= this.events.length - 1) return null;
    this._currentStep++;
    return this.events[this._currentStep];
  }

  previous(): PlaybackEvent | null {
    if (this._currentStep < 0) return null;
    if (this._currentStep === 0) {
      this._currentStep = -1;
      return null;
    }
    this._currentStep--;
    return this.events[this._currentStep];
  }

  goTo(index: number): PlaybackEvent | null {
    if (index === -1) {
      this._currentStep = -1;
      return null;
    }
    if (index < -1 || index >= this.events.length) return null;
    this._currentStep = index;
    return this.events[this._currentStep];
  }

  play(onStep: (event: PlaybackEvent) => void, intervalMs: number): void {
    this.pause();
    this._intervalId = setInterval(() => {
      const event = this.next();
      if (event) {
        onStep(event);
      } else {
        this.pause();
      }
    }, intervalMs);
  }

  pause(): void {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  restart(): void {
    this.pause();
    this._currentStep = -1;
  }

  dispose(): void {
    this.pause();
  }
}
