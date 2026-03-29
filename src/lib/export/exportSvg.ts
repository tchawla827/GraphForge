import { CanonicalGraph } from "@/types/graph";
import { PlaybackHighlights } from "@/features/editor/adapters/toReactFlow";

export function exportToSvg(
  graph: CanonicalGraph,
  highlights: PlaybackHighlights = {},
  options = { nodeWidth: 48, nodeHeight: 48 }
) {
  // Compute bounds
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  graph.nodes.forEach((node) => {
    if (node.position.x < minX) minX = node.position.x;
    if (node.position.y < minY) minY = node.position.y;
    if (node.position.x > maxX) maxX = node.position.x;
    if (node.position.y > maxY) maxY = node.position.y;
  });

  // Add padding
  const padding = 50;
  minX -= padding;
  minY -= padding;
  maxX += options.nodeWidth + padding;
  maxY += options.nodeHeight + padding;

  const width = maxX - minX;
  const height = maxY - minY;

  // Render edges
  const edgesSvg = graph.edges
    .map((edge) => {
      const sourceNode = graph.nodes.find((n) => n.id === edge.source);
      const targetNode = graph.nodes.find((n) => n.id === edge.target);

      if (!sourceNode || !targetNode) return "";

      const sx = sourceNode.position.x + options.nodeWidth / 2;
      const sy = sourceNode.position.y + options.nodeHeight / 2;
      const tx = targetNode.position.x + options.nodeWidth / 2;
      const ty = targetNode.position.y + options.nodeHeight / 2;

      const hl = highlights[edge.id];
      const strokeColor = hl === "path" ? "#818cf8" : hl === "visited" || hl === "finalized" ? "#10b981" : "#52525b";
      const strokeWidth = hl && hl !== "idle" ? 3 : 2;

      // Simple straight line for SVG export (can be improved with bezier)
      // If we want bezier, we could calculate control points, but straight lines are good for basic graphs.
      // Or we can add an arrow marker.
      return `
        <line 
          x1="${sx}" y1="${sy}" 
          x2="${tx}" y2="${ty}" 
          stroke="${strokeColor}" 
          stroke-width="${strokeWidth}"
          ${graph.config.directed ? 'marker-end="url(#arrow)"' : ""}
        />
        ${
          edge.weight !== undefined && edge.weight !== null
            ? `<text x="${(sx + tx) / 2}" y="${(sy + ty) / 2 - 5}" fill="#a1a1aa" font-size="12" font-family="sans-serif" text-anchor="middle">${edge.weight}</text>`
            : ""
        }
      `;
    })
    .join("");

  // Render nodes
  const nodesSvg = graph.nodes
    .map((node) => {
      const hl = highlights[node.id];
      const bgColor = hl === "discovered" || hl === "considered" ? "#4f46e5" : hl === "visited" || hl === "finalized" ? "#059669" : "#27272a";
      const strokeColor = hl && hl !== "idle" ? "#ffffff" : "#3f3f46";
      const textColor = "#f4f4f5";

      return `
        <g transform="translate(${node.position.x}, ${node.position.y})">
          <circle cx="${options.nodeWidth / 2}" cy="${options.nodeHeight / 2}" r="${options.nodeWidth / 2}" fill="${bgColor}" stroke="${strokeColor}" stroke-width="2" />
          <text x="${options.nodeWidth / 2}" y="${options.nodeHeight / 2 + 5}" fill="${textColor}" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle">${node.label || node.id}</text>
        </g>
      `;
    })
    .join("");

  const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${width}" height="${height}" viewBox="${minX} ${minY} ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="20" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#52525b" />
    </marker>
  </defs>
  <rect width="100%" height="100%" x="${minX}" y="${minY}" fill="#09090b" />
  <g class="edges">${edgesSvg}</g>
  <g class="nodes">${nodesSvg}</g>
</svg>`;

  return svgContent;
}

export function downloadSvg(svgContent: string, filename: string) {
  const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
