"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { parseAdjacencyMatrix } from "@/lib/parsers/adjacencyMatrix";
import type { ParseError } from "@/lib/parsers/types";
import type { CanonicalGraph } from "@/types/graph";
import { ChevronDown, ChevronRight } from "lucide-react";

const EXAMPLE = `# First row = node labels (optional)
A  B  C  D
0  4  2  0
0  0  0  7
0  0  0  1
0  0  0  0

# Without labels (auto-named n1, n2, ...):
# 0 4 2
# 0 0 7
# 0 0 0`;

interface Props {
  onValidated: (graph: CanonicalGraph | null, rawText: string) => void;
}

export function AdjMatrixTab({ onValidated }: Props) {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<ParseError[]>([]);
  const [preview, setPreview] = useState<{ nodes: number; edges: number } | null>(null);
  const [exampleOpen, setExampleOpen] = useState(false);

  function validate() {
    const result = parseAdjacencyMatrix(text);
    if (result.ok) {
      setErrors([]);
      setPreview({ nodes: result.data.nodes.length, edges: result.data.edges.length });
      onValidated(result.data, text);
    } else {
      setErrors(result.errors);
      setPreview(null);
      onValidated(null, text);
    }
  }

  function handleChange(value: string) {
    setText(value);
    setErrors([]);
    setPreview(null);
    onValidated(null, value);
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setExampleOpen((o) => !o)}
        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors w-fit"
      >
        {exampleOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        Format example
      </button>

      {exampleOpen && (
        <pre className="text-xs bg-zinc-900 border border-zinc-800 rounded p-3 text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
          {EXAMPLE}
        </pre>
      )}

      <textarea
        className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded p-3 text-sm text-zinc-100 font-mono resize-none focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
        placeholder={"A  B  C\n0  4  2\n0  0  7\n0  0  0"}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
      />

      {errors.length > 0 && (
        <ul className="flex flex-col gap-1">
          {errors.map((err, i) => (
            <li key={i} className="text-xs text-red-400 font-mono">
              {err.line !== undefined && (
                <span className="text-zinc-500 mr-2">Line {err.line}:</span>
              )}
              {err.message}
              {err.context && (
                <span className="text-zinc-600 ml-2 truncate">({err.context})</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {preview && (
        <p className="text-xs text-emerald-400">
          Valid — {preview.nodes} node{preview.nodes !== 1 ? "s" : ""},{" "}
          {preview.edges} edge{preview.edges !== 1 ? "s" : ""}
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start text-xs"
        onClick={validate}
        disabled={!text.trim()}
      >
        Validate
      </Button>
    </div>
  );
}
