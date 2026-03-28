import type { CanonicalGraph, AlgorithmRunConfig } from "@/types/graph";
import type { PlaybackEvent, AlgorithmRunResult } from "@/types/events";

export interface AlgorithmInput {
  graph: CanonicalGraph;
  config: AlgorithmRunConfig;
}

export interface AlgorithmOutput {
  events: PlaybackEvent[];
  result: AlgorithmRunResult;
}

export type AlgorithmFn = (input: AlgorithmInput) => AlgorithmOutput;
