/**
 * Task 6 - "Secure your API endpoints by adding authorization checks."
 * Session-based auth guard used by both page routes and the JSON API.
 */
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();

  // API requests get a 401 JSON response; page requests get redirected.
  if (req.originalUrl.startsWith("/api/")) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  return res.redirect("/login");
}

function redirectIfAuthed(req, res, next) {
  if (req.session && req.session.userId) return res.redirect("/dashboard");
  next();
}

module.exports = { requireAuth, redirectIfAuthed };
