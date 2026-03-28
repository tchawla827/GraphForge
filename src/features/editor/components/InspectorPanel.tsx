"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUiStore, type ActivePanel } from "@/features/editor/store/uiStore";
import { GraphTab } from "./tabs/GraphTab";
import { SelectionTab } from "./tabs/SelectionTab";
import { AlgorithmTab } from "./tabs/AlgorithmTab";
import { HelpTab } from "./tabs/HelpTab";

interface InspectorPanelProps {
  projectId?: string;
  readOnly?: boolean;
}

export function InspectorPanel({ projectId, readOnly = false }: InspectorPanelProps) {
  const { activePanel, setActivePanel } = useUiStore();

  return (
    <div className="w-64 border-l border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden shrink-0">
      <Tabs
        value={activePanel}
        onValueChange={(v) => setActivePanel(v as ActivePanel)}
        className="flex flex-col h-full"
      >
        <TabsList
          className={`grid rounded-none border-b border-zinc-800 bg-zinc-950 h-10 shrink-0 ${readOnly ? "grid-cols-2" : "grid-cols-4"}`}
        >
          {!readOnly && (
            <TabsTrigger
              value="graph"
              className="text-xs data-[state=active]:bg-zinc-800 rounded-none"
            >
              Graph
            </TabsTrigger>
          )}
          {!readOnly && (
            <TabsTrigger
              value="selection"
              className="text-xs data-[state=active]:bg-zinc-800 rounded-none"
            >
              Selection
            </TabsTrigger>
          )}
          <TabsTrigger
            value="algorithm"
            className="text-xs data-[state=active]:bg-zinc-800 rounded-none"
          >
            Algo
          </TabsTrigger>
          <TabsTrigger
            value="help"
            className="text-xs data-[state=active]:bg-zinc-800 rounded-none"
          >
            Help
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto">
          {!readOnly && (
            <TabsContent value="graph" className="mt-0">
              <GraphTab />
            </TabsContent>
          )}
          {!readOnly && (
            <TabsContent value="selection" className="mt-0">
              <SelectionTab />
            </TabsContent>
          )}
          <TabsContent value="algorithm" className="mt-0">
            <AlgorithmTab projectId={projectId} />
          </TabsContent>
          <TabsContent value="help" className="mt-0">
            <HelpTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
