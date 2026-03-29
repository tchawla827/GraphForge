import type { AlgorithmKey } from "@/types/graph";

export type AnalyticsEvent =
  | { name: "project_created" }
  | { name: "signup_completed" }
  | { name: "graph_saved" }
  | { name: "graph_imported"; format: "adjacency_list" | "adjacency_matrix" | "json" }
  | { name: "algorithm_run"; algorithm: AlgorithmKey }
  | { name: "algorithm_run_blocked_invalid"; algorithm: AlgorithmKey; reason: string }
  | { name: "share_created"; type: "public" | "private_token" }
  | { name: "share_opened"; type: "public" | "private_token" }
  | { name: "onboarding_completed" }
  | { name: "project_forked" };
