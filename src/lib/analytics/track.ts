import type { AnalyticsEvent } from "./events";

/**
 * Fire an analytics event. Works on both client and server.
 * On the client, delegates to @vercel/analytics if available.
 * On the server (API routes / server actions), fire-and-forget to avoid blocking.
 */
export async function track(event: AnalyticsEvent): Promise<void> {
  const { name, ...properties } = event as { name: string } & Record<string, unknown>;

  if (typeof window !== "undefined") {
    // Client-side: use Vercel Analytics via dynamic import (optional dep)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod = await import("@vercel/analytics" as string) as any;
      mod.track?.(name, properties);
    } catch {
      // Vercel Analytics not installed — silently skip
    }
    return;
  }

  // Server-side: no-op unless a sink is configured
  if (process.env.NODE_ENV === "development") {
    console.log(`[analytics] ${name}`, properties);
  }
}
