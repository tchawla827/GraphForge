import type { AlgorithmKey } from "@/types/graph";
import type { AlgorithmFn } from "./types";
import { bfs } from "./bfs";
import { dfs } from "./dfs";
import { dijkstra } from "./dijkstra";
import { astar } from "./astar";
import { bellmanFord } from "./bellmanFord";

export const algorithmRegistry: Record<string, AlgorithmFn> = {
  bfs,
  dfs,
  dijkstra,
  astar,
  bellman_ford: bellmanFord,
};

export const algorithmLabels: Record<AlgorithmKey, string> = {
  bfs: "Breadth-First Search",
  dfs: "Depth-First Search",
  dijkstra: "Dijkstra's Algorithm",
  astar: "A* Search",
  bellman_ford: "Bellman-Ford",
  topological_sort: "Topological Sort",
  cycle_detection: "Cycle Detection",
  prim: "Prim's Algorithm",
  kruskal: "Kruskal's Algorithm",
};

export function getAlgorithm(key: AlgorithmKey): AlgorithmFn | undefined {
  return algorithmRegistry[key];
}
