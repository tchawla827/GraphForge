import type { AnalyticsEvent } from "./events";

type AnalyticsProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

export async function track(event: AnalyticsEvent): Promise<void> {
  const { name, ...properties } = event as { name: string } & AnalyticsProperties;

  if (typeof window !== "undefined") {
    const { track: clientTrack } = await import("@vercel/analytics");
    clientTrack(name, properties);
    return;
  }

  const { track: serverTrack } = await import("@vercel/analytics/server");
  await serverTrack(name, properties);
}
