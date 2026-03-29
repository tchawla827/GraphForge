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
    <div className="w-72 border-l border-white/5 bg-zinc-950/50 backdrop-blur-md flex flex-col overflow-hidden shrink-0 z-10">
      <Tabs
        value={activePanel}
        onValueChange={(v) => setActivePanel(v as ActivePanel)}
        className="flex flex-col h-full"
      >
        <TabsList
          className={`grid rounded-none border-b border-white/5 bg-transparent h-12 shrink-0 p-1 gap-1 ${readOnly ? "grid-cols-2" : "grid-cols-4"}`}
        >
          {!readOnly && (
            <TabsTrigger
              value="graph"
              className="text-[10px] uppercase font-bold tracking-wider data-[state=active]:bg-white/5 data-[state=active]:text-primary rounded-md transition-all"
            >
              Graph
            </TabsTrigger>
          )}
          {!readOnly && (
            <TabsTrigger
              value="selection"
              className="text-[10px] uppercase font-bold tracking-wider data-[state=active]:bg-white/5 data-[state=active]:text-primary rounded-md transition-all"
            >
              Select
            </TabsTrigger>
          )}
          <TabsTrigger
            value="algorithm"
            className="text-[10px] uppercase font-bold tracking-wider data-[state=active]:bg-white/5 data-[state=active]:text-primary rounded-md transition-all"
          >
            Algo
          </TabsTrigger>
          <TabsTrigger
            value="help"
            className="text-[10px] uppercase font-bold tracking-wider data-[state=active]:bg-white/5 data-[state=active]:text-primary rounded-md transition-all"
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
