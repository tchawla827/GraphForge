import type { PlaybackEvent, PlaybackEventType } from "@/types/events";

let globalCounter = 0;

export class EventBuilder {
  private step = 0;
  private startTime = Date.now();

  emit(
    type: PlaybackEventType,
    payload: Record<string, unknown>,
    message: string
  ): PlaybackEvent {
    return {
      id: `evt_${Date.now()}_${++globalCounter}`,
      stepIndex: this.step++,
      type,
      atMs: Date.now() - this.startTime,
      payload,
      message,
    };
  }
}
