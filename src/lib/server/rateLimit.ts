type RateLimitConfig = {
  max: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

function getConfig(prefix: "share" | "import"): RateLimitConfig {
  if (prefix === "share") {
    return {
      max: Number(process.env.GRAPH_FORGE_SHARE_CREATE_RATE_LIMIT_MAX ?? 5),
      windowMs: Number(process.env.GRAPH_FORGE_SHARE_CREATE_RATE_LIMIT_WINDOW_MS ?? 60_000),
    };
  }

  return {
    max: Number(process.env.GRAPH_FORGE_IMPORT_RATE_LIMIT_MAX ?? 10),
    windowMs: Number(process.env.GRAPH_FORGE_IMPORT_RATE_LIMIT_WINDOW_MS ?? 60_000),
  };
}

export function checkRateLimit(
  prefix: "share" | "import",
  identifier: string
): {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
} {
  const config = getConfig(prefix);
  const now = Date.now();
  const key = `${prefix}:${identifier}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(0, config.max - 1),
      retryAfterMs: 0,
    };
  }

  if (current.count >= config.max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, current.resetAt - now),
    };
  }

  current.count += 1;
  buckets.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(0, config.max - current.count),
    retryAfterMs: 0,
  };
}
