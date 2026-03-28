import type { AlgorithmKey } from "@/types/graph";

export type AnalyticsEvent =
  | { name: "project_created" }
  | { name: "graph_imported"; format: "adjacency_list" | "adjacency_matrix" | "json" }
  | { name: "algorithm_run"; algorithm: AlgorithmKey }
  | { name: "share_created"; type: "public" | "private_token" }
  | { name: "project_forked" };
