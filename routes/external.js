const express = require("express");
const rateLimit = require("express-rate-limit");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Task 7: "Implement advanced API features such as rate limiting and
// error handling." Limit this route to 20 requests / minute / IP.
const externalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests to the external API. Please slow down." },
});

// Task 7: "Integrate an external API (e.g., third-party services) into
// your application." Uses the free, keyless Quotable API as an example
// of a third-party service. (Swap the URL for any API you have keys for.)
router.get("/quote", requireAuth, externalLimiter, async (req, res) => {
  try {
    const response = await fetch("https://api.quotable.io/random?tags=technology|wisdom", {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Upstream API returned ${response.status}`);
    }

    const data = await response.json();
    res.json({ content: data.content, author: data.author });
  } catch (err) {
    // Task 7: error handling for external API failures
    console.error("[external.quote] failed:", err.message);
    res.status(502).json({
      error: "Could not reach the external quote service right now.",
      fallback: { content: "Stay hungry, stay foolish.", author: "Steve Jobs" },
    });
  }
});

module.exports = router;
