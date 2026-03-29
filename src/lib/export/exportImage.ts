import { toPng } from "html-to-image";
import jsPDF from "jspdf";

interface ExportOptions {
  backgroundColor?: string;
  scale?: number;
  quality?: number;
}

export async function captureGraphImage(
  element: HTMLElement | null,
  options: ExportOptions = {}
): Promise<string> {
  if (!element) {
    throw new Error("No element provided for export");
  }

  const { backgroundColor = "#09090b", scale = 2, quality = 1 } = options;

  // Find the viewport element inside React Flow
  const viewport = element.querySelector(".react-flow__viewport") as HTMLElement;
  if (!viewport) {
    throw new Error("Could not find React Flow viewport");
  }

  // Get the bounding box of the graph content to determine proper dimensions
  const nodes = element.querySelectorAll(".react-flow__node");
  if (nodes.length === 0) {
    throw new Error("Graph is empty");
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const transform = (node as HTMLElement).style.transform;
    const match = transform.match(/translate(?:3d)?\(([^px,]+)px,\s*([^px,]+)px/);
    if (match) {
      const x = parseFloat(match[1]);
      const y = parseFloat(match[2]);
      const width = (node as HTMLElement).offsetWidth;
      const height = (node as HTMLElement).offsetHeight;

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + width > maxX) maxX = x + width;
      if (y + height > maxY) maxY = y + height;
    }
  });

  const padding = 50;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;

  return await toPng(viewport, {
    backgroundColor,
    width,
    height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${-minX + padding}px, ${-minY + padding}px) scale(1)`,
    },
    filter: (node: HTMLElement) => {
      // Exclude UI overlays (like minimap, controls, handles if they have specific classes)
      if (node.classList?.contains("react-flow__minimap")) return false;
      if (node.classList?.contains("react-flow__controls")) return false;
      if (node.classList?.contains("react-flow__panel")) return false;
      // We are capturing the viewport anyway, so most UI is outside.
      return true;
    },
    pixelRatio: scale,
    quality,
  });
}

export async function exportToPng(element: HTMLElement | null, filename: string, options?: ExportOptions) {
  try {
    const dataUrl = await captureGraphImage(element, options);
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error("Failed to export PNG:", err);
    throw err;
  }
}

export async function exportToPdf(element: HTMLElement | null, filename: string, title?: string) {
  try {
    const dataUrl = await captureGraphImage(element, { scale: 2 });
    
    // Create an image element to get dimensions
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    // Create PDF
    // Portrait or landscape based on image dimensions
    const orientation = img.width > img.height ? "l" : "p";
    const pdf = new jsPDF({
      orientation,
      unit: "pt",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    let yOffset = 40;
    
    if (title) {
      pdf.setFontSize(24);
      pdf.text(title, pdfWidth / 2, yOffset, { align: "center" });
      yOffset += 40;
    }

    // Calculate dimensions to fit page
    const maxWidth = pdfWidth - 40; // 20pt margin on each side
    const maxHeight = pdfHeight - yOffset - 20;

    const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
    const renderWidth = img.width * ratio;
    const renderHeight = img.height * ratio;
    
    // Center horizontally
    const xOffset = (pdfWidth - renderWidth) / 2;

    pdf.addImage(dataUrl, "PNG", xOffset, yOffset, renderWidth, renderHeight);
    pdf.save(filename);
  } catch (err) {
    console.error("Failed to export PDF:", err);
    throw err;
  }
}
