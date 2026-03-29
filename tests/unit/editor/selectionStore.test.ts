import { beforeEach, describe, expect, it } from "vitest";
import { useSelectionStore } from "../../../src/features/editor/store/selectionStore";

describe("selectionStore", () => {
  beforeEach(() => {
    useSelectionStore.setState({
      selectedNodeIds: [],
      selectedEdgeIds: [],
    });
  });

  it("supports mixed node and edge selections at the same time", () => {
    const { selectNodes, selectEdges } = useSelectionStore.getState();

    selectNodes(["node-1", "node-2"]);
    selectEdges(["edge-1"]);

    const { selectedNodeIds, selectedEdgeIds } = useSelectionStore.getState();

    expect(selectedNodeIds).toEqual(["node-1", "node-2"]);
    expect(selectedEdgeIds).toEqual(["edge-1"]);
  });

  it("replaces both node and edge selections together", () => {
    useSelectionStore.getState().setSelection({
      selectedNodeIds: ["node-1"],
      selectedEdgeIds: ["edge-1", "edge-2"],
    });

    const { selectedNodeIds, selectedEdgeIds } = useSelectionStore.getState();

    expect(selectedNodeIds).toEqual(["node-1"]);
    expect(selectedEdgeIds).toEqual(["edge-1", "edge-2"]);
  });

  it("toggles arbitrary node and edge selections independently", () => {
    const {
      toggleNodeSelection,
      toggleEdgeSelection,
    } = useSelectionStore.getState();

    toggleNodeSelection("node-1");
    toggleNodeSelection("node-2");
    toggleEdgeSelection("edge-1");
    toggleEdgeSelection("edge-2");
    toggleNodeSelection("node-1");

    const { selectedNodeIds, selectedEdgeIds } = useSelectionStore.getState();

    expect(selectedNodeIds).toEqual(["node-2"]);
    expect(selectedEdgeIds).toEqual(["edge-1", "edge-2"]);
  });
});
