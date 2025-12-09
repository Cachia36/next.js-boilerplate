const store = new Map<string, { count: number; firstRequestAt: number }>();

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

export function checkRateLimit(
  key: string,
  { max = 10, windowMs = 60_000 }: { max?: number; windowMs?: number } = {},
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing) {
    store.set(key, { count: 1, firstRequestAt: now });
    return { allowed: true };
  }

  const { count, firstRequestAt } = existing;

  if (now - firstRequestAt > windowMs) {
    store.set(key, { count: 1, firstRequestAt: now });
    return { allowed: true };
  }

  if (count >= max) {
    const retryAfterMs = windowMs - (now - firstRequestAt);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }

  store.set(key, { count: count + 1, firstRequestAt });
  return { allowed: true };
}
