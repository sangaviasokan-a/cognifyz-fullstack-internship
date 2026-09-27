/**
 * Task 8 - "Introduce middleware for request processing (e.g. body
 * parsing, logging)". This is a hand-rolled request logger so the
 * project doesn't have to depend on morgan.
 */
function logger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    const stamp = new Date().toISOString();
    console.log(`[${stamp}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`);
  });
  next();
}

module.exports = logger;
