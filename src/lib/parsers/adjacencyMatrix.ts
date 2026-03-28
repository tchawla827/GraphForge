import type { CanonicalGraph, GraphNode, GraphEdge } from "@/types/graph";
import type { ParseError, ParseResult } from "./types";

const MAX_INPUT_BYTES = 1024 * 1024;
const MAX_NODES = 200;
const MAX_EDGES = 1000;

const INFINITY_TOKENS = new Set(["∞", "Inf", "inf", "infinity", "Infinity"]);

function isNumericToken(s: string): boolean {
  return /^-?[\d.]+$/.test(s);
}

function gridPosition(index: number, cols: number) {
  return { x: (index % cols) * 150, y: Math.floor(index / cols) * 150 };
}

function splitRow(line: string): string[] {
  return line.split(/[\s,\t]+/).filter(Boolean);
}

/**
 * Parse adjacency matrix text into a CanonicalGraph.
 *
 * The first row is treated as a header (node labels) if any cell is non-numeric
 * and not an infinity token. Otherwise labels are auto-generated as n1, n2, ...
 *
 * Each data row may optionally begin with its own label (matching the header);
 * that prefix is stripped automatically.
 *
 * Cell interpretation:
 *   0 or empty  → no edge
 *   ∞ / Inf     → no edge
 *   nonzero number → edge with that weight
 *   negative    → edge with negative weight
 *
 * The returned graph has id="" and projectId="" — callers must fill these in.
 */
export function parseAdjacencyMatrix(input: string): ParseResult<CanonicalGraph> {
  if (new TextEncoder().encode(input).length > MAX_INPUT_BYTES) {
    return { ok: false, errors: [{ message: "Input exceeds maximum size of 1 MB" }] };
  }

  const rawLines = input
    .split("\n")
    .map((l) => l.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  if (rawLines.length === 0) {
    return { ok: false, errors: [{ message: "Empty input" }] };
  }

  // Detect header row: first row contains at least one token that is not numeric
  // and not an infinity token.
  const firstRowTokens = splitRow(rawLines[0]);
  const hasHeader = firstRowTokens.some(
    (t) => !isNumericToken(t) && !INFINITY_TOKENS.has(t)
  );

  let labels: string[];
  let dataLines: string[];
  let dataLineOffset: number; // 1-based line number of first data line

  if (hasHeader) {
    labels = firstRowTokens;
    dataLines = rawLines.slice(1);
    dataLineOffset = 2;
  } else {
    dataLines = rawLines;
    dataLineOffset = 1;
    // Auto-label after we know how many rows there are
    labels = dataLines.map((_, i) => `n${i + 1}`);
  }

  const n = labels.length;
  const errors: ParseError[] = [];

  if (n > MAX_NODES) {
    return { ok: false, errors: [{ message: `Graph exceeds maximum of ${MAX_NODES} nodes` }] };
  }

  // Parse matrix data rows
  const matrix: (number | null)[][] = [];

  for (let r = 0; r < dataLines.length; r++) {
    const line = dataLines[r];
    const lineNum = dataLineOffset + r;
    let cells = splitRow(line);

    // Strip optional row-label prefix only when a header row was detected.
    if (
      hasHeader &&
      cells.length > 0 &&
      !isNumericToken(cells[0]) &&
      !INFINITY_TOKENS.has(cells[0])
    ) {
      const expectedLabel = labels[r];
      if (cells[0] !== expectedLabel) {
        return {
          ok: false,
          errors: [
            {
              line: lineNum,
              message: `Row label "${cells[0]}" does not match header label "${expectedLabel}"`,
              context: line,
            },
          ],
        };
      }
      cells = cells.slice(1);
    }

    const row: (number | null)[] = [];
    for (const cell of cells) {
      if (cell === "" || cell === "0" || INFINITY_TOKENS.has(cell)) {
        row.push(null);
      } else {
        const val = parseFloat(cell);
        if (isNaN(val)) {
          errors.push({
            line: lineNum,
            message: `Invalid cell value "${cell}"`,
            context: line,
          });
          row.push(null);
          continue;
        }
        row.push(val === 0 ? null : val);
      }
    }
    matrix.push(row);
  }

  if (errors.length > 0) return { ok: false, errors };

  // Validate square
  if (matrix.length !== n) {
    return {
      ok: false,
      errors: [
        {
          message: `Matrix is not square: expected ${n} row(s) but got ${matrix.length}`,
        },
      ],
    };
  }

  for (let r = 0; r < matrix.length; r++) {
    if (matrix[r].length !== n) {
      return {
        ok: false,
        errors: [
          {
            line: dataLineOffset + r,
            message: `Row ${r + 1} has ${matrix[r].length} column(s) but expected ${n}`,
          },
        ],
      };
    }
  }

  // Build nodes
  const cols = Math.max(1, Math.ceil(Math.sqrt(n)));
  const nodes: GraphNode[] = labels.map((label, i) => ({
    id: `node_${i}`,
    label,
    position: gridPosition(i, cols),
  }));

  // Build edges
  const edges: GraphEdge[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const w = matrix[r][c];
      if (w !== null) {
        edges.push({
          id: `edge_${r}_${c}`,
          source: `node_${r}`,
          target: `node_${c}`,
          weight: w,
          label: null,
        });
      }
    }
  }

  if (edges.length > MAX_EDGES) {
    return { ok: false, errors: [{ message: `Graph exceeds maximum of ${MAX_EDGES} edges` }] };
  }

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
      allowParallelEdges: false,
    },
    nodes,
    edges,
    createdAt: now,
    updatedAt: now,
  };

  return { ok: true, data: graph };
}
