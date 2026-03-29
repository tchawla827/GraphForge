"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetOnboarding } from "@/features/onboarding/storage";

const KEYBOARD_SHORTCUTS = [
  { key: "Delete / Backspace", action: "Delete selected node or edge" },
  { key: "Escape", action: "Deselect all" },
] as const;

const ALGORITHM_CONSTRAINTS = [
  { algorithm: "BFS", requires: "Directed or undirected", inputs: "Source node" },
  { algorithm: "DFS", requires: "Directed or undirected", inputs: "Source node" },
  { algorithm: "Dijkstra", requires: "Non-negative weights", inputs: "Source node; optional target" },
  { algorithm: "A*", requires: "Non-negative weights", inputs: "Source + target node" },
  { algorithm: "Bellman-Ford", requires: "Directed or undirected", inputs: "Source node" },
  { algorithm: "Topological Sort", requires: "Directed graph only", inputs: "None (fails on cycles)" },
  { algorithm: "Cycle Detection", requires: "Any graph", inputs: "None" },
  { algorithm: "Prim", requires: "Undirected + weighted", inputs: "None (starts from first node)" },
  { algorithm: "Kruskal", requires: "Undirected + weighted", inputs: "None" },
] as const;

const IMPORT_EXAMPLES = [
  {
    title: "Adjacency list",
    format: `A: B(4), C(2)\nB: D(7)\nC: D(1)\nD:`,
    notes: "Each line: NodeLabel: Neighbor(weight), ... — weights are optional",
  },
  {
    title: "Adjacency matrix",
    format: `  A B C\nA 0 4 2\nB 0 0 7\nC 0 0 0`,
    notes: "First row is optional node labels. Use 0 or blank for no edge.",
  },
  {
    title: "JSON",
    format: `{\n  "schemaVersion": 1,\n  "config": { "directed": true, "weighted": true, ... },\n  "nodes": [...],\n  "edges": [...]\n}`,
    notes: "Must match the canonical graph schema (schemaVersion: 1).",
  },
] as const;

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-800/50 transition-colors text-left"
      >
        <span>{title}</span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
        )}
      </button>
      {open && <div className="border-t border-zinc-800">{children}</div>}
    </div>
  );
}

export function HelpPanel() {
  const [userId, setUserId] = useState<string | null>(null);
  const [resetDone, setResetDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) return;
        const data = (await response.json()) as { user?: { id?: string } };
        if (!cancelled) {
          setUserId(data.user?.id ?? null);
        }
      } catch {
        // Non-blocking helper UI only.
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="px-4 py-5 space-y-3 text-sm">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-zinc-200">Onboarding guide</p>
            <p className="text-xs text-zinc-500">
              Re-open the quick-start overlay if you want the editor walkthrough again.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={!userId}
            onClick={() => {
              if (!userId) return;
              resetOnboarding(userId);
              setResetDone(true);
            }}
          >
            Reset guide
          </Button>
        </div>
        {resetDone ? (
          <p className="mt-2 text-xs text-emerald-400">
            Guide reset. Reload the editor to see it again.
          </p>
        ) : null}
      </div>

      <CollapsibleSection title="Keyboard shortcuts" defaultOpen>
        <div className="px-4 py-3 space-y-2">
          {KEYBOARD_SHORTCUTS.map(({ key, action }) => (
            <div key={key} className="flex items-start gap-3">
              <kbd className="shrink-0 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-xs whitespace-nowrap">
                {key}
              </kbd>
              <span className="text-zinc-400 leading-5">{action}</span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Algorithm constraints">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-2 text-zinc-500 font-medium">Algorithm</th>
                <th className="text-left px-4 py-2 text-zinc-500 font-medium">Graph type</th>
                <th className="text-left px-4 py-2 text-zinc-500 font-medium">Required inputs</th>
              </tr>
            </thead>
            <tbody>
              {ALGORITHM_CONSTRAINTS.map(({ algorithm, requires, inputs }) => (
                <tr key={algorithm} className="border-b border-zinc-800/50 last:border-0">
                  <td className="px-4 py-2 text-zinc-300 font-medium">{algorithm}</td>
                  <td className="px-4 py-2 text-zinc-400">{requires}</td>
                  <td className="px-4 py-2 text-zinc-400">{inputs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Import format examples">
        <div className="px-4 py-3 space-y-4">
          {IMPORT_EXAMPLES.map(({ title, format, notes }) => (
            <div key={title}>
              <p className="text-zinc-300 font-medium mb-1">{title}</p>
              <pre className="bg-zinc-900 border border-zinc-800 rounded p-3 text-xs text-zinc-300 font-mono overflow-x-auto whitespace-pre">
                {format}
              </pre>
              <p className="text-zinc-500 text-xs mt-1">{notes}</p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Limits">
        <div className="px-4 py-3 space-y-1.5 text-zinc-400">
          <p>Max nodes: <span className="text-zinc-200 font-medium">200</span></p>
          <p>Max edges: <span className="text-zinc-200 font-medium">1,000</span></p>
          <p>Max import size: <span className="text-zinc-200 font-medium">1 MB</span></p>
        </div>
      </CollapsibleSection>
    </div>
  );
}
