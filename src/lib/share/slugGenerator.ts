import { randomBytes } from "crypto";
import { prisma } from "@/lib/db/client";

const ADJECTIVES = [
  "bright", "calm", "clear", "cool", "crisp", "dark", "deep", "dense",
  "eager", "early", "fast", "fine", "firm", "flat", "free", "fresh",
  "full", "glad", "good", "grand", "gray", "great", "green", "hard",
  "high", "hot", "huge", "keen", "kind", "large", "late", "lean",
  "light", "long", "loud", "low", "mild", "neat", "new", "nice",
  "old", "pale", "plain", "proud", "pure", "quick", "quiet", "rare",
  "rich", "round", "safe", "sharp", "short", "slim", "slow", "small",
];

const NOUNS = [
  "arc", "beam", "bond", "branch", "bridge", "chain", "circuit", "cluster",
  "core", "cycle", "depth", "edge", "flow", "forest", "graph", "grid",
  "hub", "jump", "knot", "layer", "leaf", "link", "loop", "mesh",
  "mode", "node", "orbit", "path", "peak", "point", "pool", "ring",
  "root", "route", "scope", "seed", "span", "star", "stem", "step",
  "stream", "thread", "tier", "trace", "trail", "tree", "vector", "vertex",
  "wave", "web",
];

function randomSlug(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const suffix = randomBytes(2).toString("hex"); // 4 hex chars
  return `${adj}-${noun}-${suffix}`;
}

export async function generateUniqueSlug(maxAttempts = 5): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const slug = randomSlug();
    const existing = await prisma.shareLink.findUnique({ where: { slug } });
    if (!existing) return slug;
  }
  // Fallback: use longer random suffix to avoid collision
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj}-${noun}-${randomBytes(4).toString("hex")}`;
}
