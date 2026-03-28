import type { CanonicalGraph } from "@/types/graph";

export interface SampleGraph {
  key: string;
  label: string;
  description: string;
  graph: Omit<CanonicalGraph, "id" | "projectId" | "createdAt" | "updatedAt">;
}

export const dijkstraSample: SampleGraph = {
  key: "dijkstra",
  label: "Dijkstra Demo",
  description: "6-node directed weighted graph — ideal for shortest path algorithms",
  graph: {
    schemaVersion: 1,
    config: { directed: true, weighted: true, allowSelfLoops: false, allowParallelEdges: false },
    nodes: [
      { id: "s1", label: "A", position: { x: 100, y: 200 } },
      { id: "s2", label: "B", position: { x: 300, y: 80 } },
      { id: "s3", label: "C", position: { x: 300, y: 320 } },
      { id: "s4", label: "D", position: { x: 500, y: 80 } },
      { id: "s5", label: "E", position: { x: 500, y: 320 } },
      { id: "s6", label: "F", position: { x: 700, y: 200 } },
    ],
    edges: [
      { id: "se1", source: "s1", target: "s2", weight: 4, label: "4" },
      { id: "se2", source: "s1", target: "s3", weight: 2, label: "2" },
      { id: "se3", source: "s2", target: "s4", weight: 5, label: "5" },
      { id: "se4", source: "s2", target: "s3", weight: 1, label: "1" },
      { id: "se5", source: "s3", target: "s5", weight: 6, label: "6" },
      { id: "se6", source: "s4", target: "s6", weight: 2, label: "2" },
      { id: "se7", source: "s5", target: "s6", weight: 3, label: "3" },
      { id: "se8", source: "s3", target: "s4", weight: 3, label: "3" },
    ],
  },
};

export const dagSample: SampleGraph = {
  key: "dag",
  label: "DAG / Topological Sort",
  description: "7-node directed acyclic graph — no cycles, ready for topological sort",
  graph: {
    schemaVersion: 1,
    config: { directed: true, weighted: false, allowSelfLoops: false, allowParallelEdges: false },
    nodes: [
      { id: "d1", label: "Build", position: { x: 100, y: 200 } },
      { id: "d2", label: "Lint", position: { x: 300, y: 100 } },
      { id: "d3", label: "Test", position: { x: 300, y: 300 } },
      { id: "d4", label: "Bundle", position: { x: 500, y: 100 } },
      { id: "d5", label: "Types", position: { x: 500, y: 300 } },
      { id: "d6", label: "Deploy", position: { x: 700, y: 200 } },
      { id: "d7", label: "Notify", position: { x: 900, y: 200 } },
    ],
    edges: [
      { id: "de1", source: "d1", target: "d2", label: null },
      { id: "de2", source: "d1", target: "d3", label: null },
      { id: "de3", source: "d2", target: "d4", label: null },
      { id: "de4", source: "d3", target: "d5", label: null },
      { id: "de5", source: "d4", target: "d6", label: null },
      { id: "de6", source: "d5", target: "d6", label: null },
      { id: "de7", source: "d6", target: "d7", label: null },
    ],
  },
};

export const mstSample: SampleGraph = {
  key: "mst",
  label: "MST Demo (Prim / Kruskal)",
  description: "5-node undirected weighted graph — run Prim's or Kruskal's to find the MST",
  graph: {
    schemaVersion: 1,
    config: { directed: false, weighted: true, allowSelfLoops: false, allowParallelEdges: false },
    nodes: [
      { id: "m1", label: "A", position: { x: 300, y: 100 } },
      { id: "m2", label: "B", position: { x: 100, y: 300 } },
      { id: "m3", label: "C", position: { x: 300, y: 500 } },
      { id: "m4", label: "D", position: { x: 500, y: 300 } },
      { id: "m5", label: "E", position: { x: 300, y: 300 } },
    ],
    edges: [
      { id: "me1", source: "m1", target: "m2", weight: 4, label: "4" },
      { id: "me2", source: "m1", target: "m5", weight: 2, label: "2" },
      { id: "me3", source: "m2", target: "m3", weight: 6, label: "6" },
      { id: "me4", source: "m2", target: "m5", weight: 1, label: "1" },
      { id: "me5", source: "m3", target: "m4", weight: 5, label: "5" },
      { id: "me6", source: "m3", target: "m5", weight: 3, label: "3" },
      { id: "me7", source: "m4", target: "m5", weight: 7, label: "7" },
    ],
  },
};

export const cycleSample: SampleGraph = {
  key: "cycle",
  label: "Cycle Detection Demo",
  description: "4-node directed graph with a cycle — use Cycle Detection to find it",
  graph: {
    schemaVersion: 1,
    config: { directed: true, weighted: false, allowSelfLoops: false, allowParallelEdges: false },
    nodes: [
      { id: "c1", label: "A", position: { x: 300, y: 100 } },
      { id: "c2", label: "B", position: { x: 500, y: 200 } },
      { id: "c3", label: "C", position: { x: 400, y: 400 } },
      { id: "c4", label: "D", position: { x: 200, y: 300 } },
    ],
    edges: [
      { id: "ce1", source: "c1", target: "c2", label: null },
      { id: "ce2", source: "c2", target: "c3", label: null },
      { id: "ce3", source: "c3", target: "c4", label: null },
      { id: "ce4", source: "c4", target: "c2", label: null },
    ],
  },
};

export const ALL_SAMPLES: SampleGraph[] = [dijkstraSample, dagSample, mstSample, cycleSample];

export function getSampleByKey(sampleKey: string): SampleGraph | undefined {
  return ALL_SAMPLES.find((sample) => sample.key === sampleKey);
}

export function hydrateSampleGraph(sampleKey: string): CanonicalGraph | null {
  const sample = getSampleByKey(sampleKey);
  if (!sample) return null;

  return {
    ...sample.graph,
    id: `sample-${sample.key}`,
    projectId: `sample-${sample.key}`,
    createdAt: "2026-03-28T00:00:00.000Z",
    updatedAt: "2026-03-28T00:00:00.000Z",
  };
}
