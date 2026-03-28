"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Play, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGraphStore } from "@/features/editor/store/graphStore";
import { usePlaybackStore } from "@/features/editor/store/playbackStore";
import { algorithmLabels } from "@/lib/algorithms/registry";
import { validateAlgorithmInput } from "@/lib/algorithms/validate";
import type { AlgorithmKey, AlgorithmRunConfig } from "@/types/graph";

const AVAILABLE_ALGORITHMS: AlgorithmKey[] = [
  "bfs",
  "dfs",
  "dijkstra",
  "astar",
  "bellman_ford",
];

const NEEDS_TARGET: AlgorithmKey[] = ["astar", "dijkstra", "bellman_ford"];
const NEEDS_HEURISTIC: AlgorithmKey[] = ["astar"];

interface AlgorithmTabProps {
  projectId?: string;
}

export function AlgorithmTab({ projectId }: AlgorithmTabProps) {
  const graph = useGraphStore((s) => s.graph);
  const { runStatus, startRun } = usePlaybackStore();

  const [algorithm, setAlgorithm] = useState<AlgorithmKey>("bfs");
  const [sourceNodeId, setSourceNodeId] = useState<string>("");
  const [targetNodeId, setTargetNodeId] = useState<string>("");
  const [heuristic, setHeuristic] = useState<"euclidean" | "manhattan" | "zero">("euclidean");
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const nodes = useMemo(() => graph?.nodes ?? [], [graph]);

  // Auto-select first node as source if none selected
  useEffect(() => {
    if (!sourceNodeId && nodes.length > 0) {
      setSourceNodeId(nodes[0].id);
    }
  }, [nodes, sourceNodeId]);

  const showTarget = NEEDS_TARGET.includes(algorithm);
  const showHeuristic = NEEDS_HEURISTIC.includes(algorithm);

  const buildConfig = useCallback((): AlgorithmRunConfig => {
    return {
      algorithm,
      sourceNodeId: sourceNodeId || undefined,
      targetNodeId: showTarget && targetNodeId ? targetNodeId : undefined,
      heuristic: showHeuristic ? heuristic : undefined,
    };
  }, [algorithm, sourceNodeId, targetNodeId, showTarget, showHeuristic, heuristic]);

  const validation = useMemo(() => {
    if (!graph) return { ok: false as const, error: "No graph loaded" };
    return validateAlgorithmInput(graph, buildConfig());
  }, [graph, buildConfig]);

  const handleRun = useCallback(async () => {
    if (!graph || !projectId || !validation.ok) return;

    setIsRunning(true);
    setRunError(null);

    try {
      const config = buildConfig();
      const res = await fetch(`/api/projects/${projectId}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error?.message ?? `Server error (${res.status})`);
      }

      const data = await res.json();
      const { events, result } = data.run;
      startRun(events, result);
    } catch (err) {
      setRunError(err instanceof Error ? err.message : "Failed to run algorithm");
    } finally {
      setIsRunning(false);
    }
  }, [graph, projectId, validation, buildConfig, startRun]);

  return (
    <div className="px-3 py-3 space-y-3">
      {/* Algorithm selector */}
      <div className="space-y-1">
        <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
          Algorithm
        </label>
        <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as AlgorithmKey)}>
          <SelectTrigger className="w-full h-7 text-xs bg-zinc-900 border-zinc-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_ALGORITHMS.map((key) => (
              <SelectItem key={key} value={key}>
                {algorithmLabels[key]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Source node */}
      <div className="space-y-1">
        <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
          Source node
        </label>
        <Select value={sourceNodeId} onValueChange={(v) => v && setSourceNodeId(v)}>
          <SelectTrigger className="w-full h-7 text-xs bg-zinc-900 border-zinc-700">
            <SelectValue placeholder="Select source..." />
          </SelectTrigger>
          <SelectContent>
            {nodes.map((n) => (
              <SelectItem key={n.id} value={n.id}>
                {n.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Target node (conditional) */}
      {showTarget && (
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
            Target node {algorithm === "astar" ? "(required)" : "(optional)"}
          </label>
          <Select value={targetNodeId} onValueChange={(v) => v && setTargetNodeId(v)}>
            <SelectTrigger className="w-full h-7 text-xs bg-zinc-900 border-zinc-700">
              <SelectValue placeholder="Select target..." />
            </SelectTrigger>
            <SelectContent>
              {nodes
                .filter((n) => n.id !== sourceNodeId)
                .map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    {n.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Heuristic selector (conditional) */}
      {showHeuristic && (
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
            Heuristic
          </label>
          <Select value={heuristic} onValueChange={(v) => setHeuristic(v as typeof heuristic)}>
            <SelectTrigger className="w-full h-7 text-xs bg-zinc-900 border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="euclidean">Euclidean</SelectItem>
              <SelectItem value="manhattan">Manhattan</SelectItem>
              <SelectItem value="zero">Zero (Dijkstra-like)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Validation warning */}
      {!validation.ok && (
        <div className="flex items-start gap-1.5 rounded-md bg-amber-900/20 border border-amber-800/30 px-2 py-1.5">
          <AlertTriangle size={12} className="text-amber-400 mt-0.5 shrink-0" />
          <span className="text-[11px] text-amber-300">{validation.error}</span>
        </div>
      )}

      {/* Run error */}
      {runError && (
        <div className="flex items-start gap-1.5 rounded-md bg-red-900/20 border border-red-800/30 px-2 py-1.5">
          <AlertTriangle size={12} className="text-red-400 mt-0.5 shrink-0" />
          <span className="text-[11px] text-red-300">{runError}</span>
        </div>
      )}

      {/* Run button */}
      <Button
        className="w-full gap-1.5 text-xs"
        size="sm"
        onClick={handleRun}
        disabled={!validation.ok || isRunning || !projectId}
      >
        <Play size={12} />
        {isRunning ? "Running..." : "Run Algorithm"}
      </Button>

      {/* Invalidation banner */}
      {runStatus === "invalidated" && (
        <div className="flex items-center gap-1.5 rounded-md bg-amber-900/20 border border-amber-800/30 px-2 py-1.5">
          <RefreshCw size={12} className="text-amber-400 shrink-0" />
          <span className="text-[11px] text-amber-300">
            Graph changed — results outdated.
          </span>
          <Button
            variant="ghost"
            size="xs"
            className="ml-auto text-[10px] text-amber-300 hover:text-amber-200"
            onClick={handleRun}
            disabled={!validation.ok || isRunning}
          >
            Rerun
          </Button>
        </div>
      )}
    </div>
  );
}
