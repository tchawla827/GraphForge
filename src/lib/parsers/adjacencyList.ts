import type { CanonicalGraph, GraphNode, GraphEdge } from "@/types/graph";
import type { ParseError, ParseResult } from "./types";

const MAX_INPUT_BYTES = 1024 * 1024;
const MAX_NODES = 200;
const MAX_EDGES = 1000;

interface RawEdge {
  source: string;
  target: string;
  weight: number | null;
}

function gridPosition(index: number, cols: number) {
  return { x: (index % cols) * 150, y: Math.floor(index / cols) * 150 };
}

/**
 * Parse adjacency list text into a CanonicalGraph.
 *
 * Accepted formats (one per line, lines beginning with # are comments):
 *   A: B(4), C(2)       — colon, weighted
 *   A: B, C             — colon, unweighted
 *   A -> B: 4           — arrow, weighted
 *   A -> B              — arrow, unweighted
 *   A B 4               — space-separated, weighted
 *   A B                 — space-separated, unweighted
 *
 * The returned graph has id="" and projectId="" — callers must fill these in
 * before persisting.
 */
export function parseAdjacencyList(input: string): ParseResult<CanonicalGraph> {
  if (new TextEncoder().encode(input).length > MAX_INPUT_BYTES) {
    return { ok: false, errors: [{ message: "Input exceeds maximum size of 1 MB" }] };
  }

  const lines = input.split("\n");
  const seenLabels = new Set<string>();
  // Preserve insertion order for stable node IDs
  const labelOrder: string[] = [];
  const rawEdges: RawEdge[] = [];
  const errors: ParseError[] = [];

  function addLabel(label: string) {
    if (!seenLabels.has(label)) {
      seenLabels.add(label);
      labelOrder.push(label);
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    const lineNum = i + 1;

    if (!line || line.startsWith("#")) continue;

    // ── Format 1: arrow  "A -> B: 4"  or  "A -> B" ──
    const arrowIdx = line.indexOf("->");
    if (arrowIdx !== -1) {
      const src = line.slice(0, arrowIdx).trim();
      const rest = line.slice(arrowIdx + 2).trim();
      // rest may be "B: 4" or "B"
      const colonIdx = rest.lastIndexOf(":");
      let tgt: string;
      let weight: number | null = null;
      if (colonIdx !== -1) {
        tgt = rest.slice(0, colonIdx).trim();
        const wStr = rest.slice(colonIdx + 1).trim();
        weight = parseFloat(wStr);
        if (isNaN(weight)) {
          errors.push({ line: lineNum, message: `Non-numeric weight "${wStr}"`, context: line });
          continue;
        }
      } else {
        tgt = rest;
      }
      if (!src || !tgt) {
        errors.push({ line: lineNum, message: "Malformed arrow line", context: line });
        continue;
      }
      addLabel(src);
      addLabel(tgt);
      rawEdges.push({ source: src, target: tgt, weight });
      continue;
    }

    // ── Format 2: colon  "A: B(4), C(2)"  or  "A: B, C" ──
    const colonIdx = line.indexOf(":");
    if (colonIdx !== -1) {
      const src = line.slice(0, colonIdx).trim();
      const rest = line.slice(colonIdx + 1).trim();
      if (!src) {
        errors.push({ line: lineNum, message: "Missing source node label", context: line });
        continue;
      }
      addLabel(src);
      if (!rest) continue; // source with no neighbours is valid

      const targets = rest.split(",").map((t) => t.trim()).filter(Boolean);
      for (const tgt of targets) {
        // Check for weighted form  "B(4)"  or  "B (4)"
        const wMatch = /^(.+?)\s*\((-?[\d.]+)\)\s*$/.exec(tgt);
        if (wMatch) {
          const label = wMatch[1].trim();
          const weight = parseFloat(wMatch[2]);
          if (isNaN(weight)) {
            errors.push({ line: lineNum, message: `Non-numeric weight in "${tgt}"`, context: line });
            continue;
          }
          addLabel(label);
          rawEdges.push({ source: src, target: label, weight });
        } else if (/\([^)]*\)\s*$/.test(tgt)) {
          // Looks like weight notation (has trailing parens) but weight is non-numeric
          errors.push({
            line: lineNum,
            message: `Non-numeric weight in "${tgt}"`,
            context: line,
          });
        } else {
          addLabel(tgt);
          rawEdges.push({ source: src, target: tgt, weight: null });
        }
      }
      continue;
    }

    // ── Format 3: space-separated  "A B 4"  or  "A B" ──
    const parts = line.split(/\s+/);
    if (parts.length >= 2) {
      if (parts.length > 3) {
        errors.push({
          line: lineNum,
          message: "Malformed space-separated line",
          context: line,
        });
        continue;
      }

      const src = parts[0];
      const tgt = parts[1];
      let weight: number | null = null;
      if (parts.length >= 3) {
        weight = parseFloat(parts[2]);
        if (isNaN(weight)) {
          errors.push({ line: lineNum, message: `Non-numeric weight "${parts[2]}"`, context: line });
          continue;
        }
      }
      addLabel(src);
      addLabel(tgt);
      rawEdges.push({ source: src, target: tgt, weight });
      continue;
    }

    errors.push({ line: lineNum, message: "Malformed line — could not parse", context: line });
  }

  if (errors.length > 0) return { ok: false, errors };

  if (labelOrder.length === 0) {
    return { ok: false, errors: [{ message: "Empty input: no nodes found" }] };
  }

  if (labelOrder.length > MAX_NODES) {
    return { ok: false, errors: [{ message: `Graph exceeds maximum of ${MAX_NODES} nodes` }] };
  }

  if (rawEdges.length > MAX_EDGES) {
    return { ok: false, errors: [{ message: `Graph exceeds maximum of ${MAX_EDGES} edges` }] };
  }

  const cols = Math.max(1, Math.ceil(Math.sqrt(labelOrder.length)));
  const labelToId = new Map<string, string>();
  const nodes: GraphNode[] = labelOrder.map((label, i) => {
    const id = `node_${i}`;
    labelToId.set(label, id);
    return { id, label, position: gridPosition(i, cols) };
  });

  const edges: GraphEdge[] = rawEdges.map((e, i) => ({
    id: `edge_${i}`,
    source: labelToId.get(e.source)!,
    target: labelToId.get(e.target)!,
    weight: e.weight,
    label: null,
  }));

  const weighted = edges.some((e) => e.weight !== null);
  const now = new Date().toISOString();

  const graph: CanonicalGraph = {
    schemaVersion: 1,
    id: "",
    projectId: "",
    config: {
      directed: true,
      weighted,
      allowSelfLoops: true,
      allowParallelEdges: true,
    },
    nodes,
    edges,
    createdAt: now,
    updatedAt: now,
  };

  return { ok: true, data: graph };
}
