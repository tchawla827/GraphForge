"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { parseJsonImport } from "@/lib/parsers/jsonImport";
import type { ParseError } from "@/lib/parsers/types";
import type { CanonicalGraph } from "@/types/graph";
import { ChevronDown, ChevronRight, Upload } from "lucide-react";

const EXAMPLE = `{
  "schemaVersion": 1,
  "id": "graph_1",
  "projectId": "project_1",
  "config": {
    "directed": true,
    "weighted": true,
    "allowSelfLoops": false,
    "allowParallelEdges": false
  },
  "nodes": [
    { "id": "n1", "label": "A", "position": { "x": 0, "y": 0 } },
    { "id": "n2", "label": "B", "position": { "x": 150, "y": 0 } }
  ],
  "edges": [
    { "id": "e1", "source": "n1", "target": "n2", "weight": 4, "label": null }
  ],
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}`;

interface Props {
  onValidated: (graph: CanonicalGraph | null, rawText: string, filename?: string) => void;
}

export function JsonImportTab({ onValidated }: Props) {
  const [text, setText] = useState("");
  const [filename, setFilename] = useState<string | undefined>();
  const [errors, setErrors] = useState<ParseError[]>([]);
  const [preview, setPreview] = useState<{ nodes: number; edges: number } | null>(null);
  const [exampleOpen, setExampleOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function validate(raw?: string, fname?: string) {
    const source = raw ?? text;
    const result = parseJsonImport(source);
    if (result.ok) {
      setErrors([]);
      setPreview({ nodes: result.data.nodes.length, edges: result.data.edges.length });
      onValidated(result.data, source, fname ?? filename);
    } else {
      setErrors(result.errors);
      setPreview(null);
      onValidated(null, source);
    }
  }

  function handleChange(value: string) {
    setText(value);
    setErrors([]);
    setPreview(null);
    onValidated(null, value);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fname = file.name;
    setFilename(fname);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setText(content);
      setErrors([]);
      setPreview(null);
      onValidated(null, content);
    };
    reader.readAsText(file);
    e.target.value = "";
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

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-700 rounded px-2 py-1"
        >
          <Upload size={12} />
          Upload .json file
        </button>
        {filename && <span className="text-xs text-zinc-500 truncate">{filename}</span>}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <textarea
        className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded p-3 text-sm text-zinc-100 font-mono resize-none focus:outline-none focus:border-indigo-500 placeholder:text-zinc-600"
        placeholder='{ "schemaVersion": 1, "nodes": [...], "edges": [...], ... }'
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
      />

      {errors.length > 0 && (
        <ul className="flex flex-col gap-1">
          {errors.map((err, i) => (
            <li key={i} className="text-xs text-red-400 font-mono">
              {err.message}
              {err.context && (
                <span className="text-zinc-500 ml-2">({err.context})</span>
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
        onClick={() => validate()}
        disabled={!text.trim()}
      >
        Validate
      </Button>
    </div>
  );
}
