/**
 * Task 8 - "Explore server-side caching mechanisms for optimized
 * performance." A minimal in-memory TTL cache for GET endpoints.
 * Not a real distributed cache (no Redis dependency), but demonstrates
 * the same contract: cache-key lookup, TTL expiry, manual invalidation.
 */
const store = new Map();

function cacheMiddleware(ttlMs = 5000) {
  return (req, res, next) => {
    const key = req.originalUrl + ":" + (req.session?.userId || "anon");
    const hit = store.get(key);

    if (hit && Date.now() - hit.time < ttlMs) {
      res.set("X-Cache", "HIT");
      return res.json(hit.body);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      store.set(key, { body, time: Date.now() });
      res.set("X-Cache", "MISS");
      return originalJson(body);
    };
    next();
  };
}

function invalidate(prefix) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

module.exports = { cacheMiddleware, invalidate };
