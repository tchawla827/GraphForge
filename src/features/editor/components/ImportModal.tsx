"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AdjListTab } from "./import-tabs/AdjListTab";
import { AdjMatrixTab } from "./import-tabs/AdjMatrixTab";
import { JsonImportTab } from "./import-tabs/JsonImportTab";
import { useGraphStore } from "@/features/editor/store/graphStore";
import type { CanonicalGraph } from "@/types/graph";

type TabKey = "adj-list" | "adj-matrix" | "json";

const API_SEGMENT: Record<TabKey, string> = {
  "adj-list": "adjacency-list",
  "adj-matrix": "adjacency-matrix",
  json: "json",
};

interface ValidationState {
  graph: CanonicalGraph;
  rawText: string;
  filename?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function ImportModal({ open, onOpenChange, projectId }: Props) {
  const { setGraph } = useGraphStore();
  const [activeTab, setActiveTab] = useState<TabKey>("adj-list");
  const [validated, setValidated] = useState<ValidationState | null>(null);
  const [importing, setImporting] = useState(false);

  function handleValidated(
    graph: CanonicalGraph | null,
    rawText: string,
    filename?: string
  ) {
    setValidated(graph ? { graph, rawText, filename } : null);
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab as TabKey);
    setValidated(null);
  }

  async function handleImport() {
    if (!validated) return;
    setImporting(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/import/${API_SEGMENT[activeTab]}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: validated.rawText,
            filename: validated.filename,
          }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        const msg: string = json?.error?.message ?? "Import failed";
        const detail = json?.error?.details?.errors;
        if (Array.isArray(detail) && detail.length > 0) {
          toast.error(msg, { description: String(detail[0].message) });
        } else {
          toast.error(msg);
        }
        return;
      }

      const savedGraph: CanonicalGraph = json.data.graph;
      const { nodeCount, edgeCount }: { nodeCount: number; edgeCount: number } =
        json.data.summary;

      setGraph(savedGraph);
      toast.success("Graph imported", {
        description: `${nodeCount} node${nodeCount !== 1 ? "s" : ""}, ${edgeCount} edge${edgeCount !== 1 ? "s" : ""}`,
      });
      onOpenChange(false);
      setValidated(null);
    } catch {
      toast.error("Import failed", { description: "Network error - please try again" });
    } finally {
      setImporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Import Graph</DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Importing will replace the current graph. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="bg-zinc-900 border border-zinc-800 h-8 text-xs">
            <TabsTrigger value="adj-list" className="text-xs px-3 h-7">
              Adjacency List
            </TabsTrigger>
            <TabsTrigger value="adj-matrix" className="text-xs px-3 h-7">
              Adjacency Matrix
            </TabsTrigger>
            <TabsTrigger value="json" className="text-xs px-3 h-7">
              JSON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="adj-list" className="mt-4">
            <AdjListTab onValidated={handleValidated} />
          </TabsContent>
          <TabsContent value="adj-matrix" className="mt-4">
            <AdjMatrixTab onValidated={handleValidated} />
          </TabsContent>
          <TabsContent value="json" className="mt-4">
            <JsonImportTab onValidated={handleValidated} />
          </TabsContent>
        </Tabs>

        {validated && (
          <p className="text-xs text-zinc-400 pt-1">
            Ready to import:{" "}
            <span className="text-zinc-200">
              {validated.graph.nodes.length} node
              {validated.graph.nodes.length !== 1 ? "s" : ""},{" "}
              {validated.graph.edges.length} edge
              {validated.graph.edges.length !== 1 ? "s" : ""}
            </span>
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => onOpenChange(false)}
            disabled={importing}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40"
            disabled={!validated || importing}
            onClick={handleImport}
          >
            {importing ? "Importing..." : "Import and Replace Graph"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
