import GIF from "gif.js";
import { captureGraphImage } from "./exportImage";
import { usePlaybackStore } from "@/features/editor/store/playbackStore";

interface GifExportOptions {
  fps?: number;
  quality?: number; // 1-30, lower is better
  resolutionScale?: number;
  onProgress?: (progress: number) => void;
}

export async function exportToGif(
  element: HTMLElement | null,
  filename: string,
  options: GifExportOptions = {}
) {
  if (!element) throw new Error("No element provided");

  const { fps = 2, quality = 10, resolutionScale = 1, onProgress } = options;
  const delay = 1000 / fps;

  const store = usePlaybackStore.getState();
  if (!store.events || store.events.length === 0) {
    throw new Error("No playback events to export");
  }

  // Remember current state to restore later
  const originalStep = store.currentStep;
  const originalStatus = store.runStatus;
  
  // Pause any ongoing playback
  if (originalStatus === "playing") {
    store.pause();
  }

  const gif = new GIF({
    workers: 2,
    quality: quality,
    workerScript: "/gif.worker.js",
    width: undefined, // Will be inferred from the first frame if not set
    height: undefined,
  });

  const totalSteps = store.events.length;

  try {
    for (let i = -1; i < totalSteps; i++) {
      store.setStep(i);
      
      // Wait for React to render the new state
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dataUrl = await captureGraphImage(element, { 
        scale: resolutionScale,
        quality: 1
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      gif.addFrame(img, { delay });
      
      if (onProgress) {
        // Progress for capturing frames is the first 50%
        onProgress((i + 1) / totalSteps * 0.5);
      }
    }

    // Now render the GIF
    const blob = await new Promise<Blob>((resolve, reject) => {
      gif.on("finished", (b) => resolve(b));
      gif.on("progress", (p) => {
        if (onProgress) {
          // Rendering progress is the remaining 50%
          onProgress(0.5 + p * 0.5);
        }
      });
      gif.on("abort", reject);
      gif.render();
    });

    // Download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

  } finally {
    // Restore original state
    store.setStep(originalStep);
    if (originalStatus === "playing") {
      store.play();
    }
  }
}
