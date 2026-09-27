const express = require("express");
const session = require("express-session");
const path = require("path");

const logger = require("./middleware/logger");
const { requireAuth } = require("./middleware/auth");
const db = require("./db");

const authRoutes = require("./routes/auth");
const tasksApi = require("./routes/tasks");
const externalApi = require("./routes/external");

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Task 1: server-side rendering with EJS ----
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ---- Task 8: middleware for request processing ----
app.use(logger); // custom request logger
app.use(express.urlencoded({ extended: true })); // parse HTML form submissions
app.use(express.json()); // parse JSON bodies for the REST API
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "cognifyz-internship-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 4 }, // 4 hours
  })
);

// Make the logged-in user available to every view
app.use((req, res, next) => {
  res.locals.currentUser = req.session.userName || null;
  next();
});

// ---- Page routes ----
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/dashboard", requireAuth, (req, res) => {
  res.render("dashboard");
});

app.use("/", authRoutes); // /register, /login, /logout

// ---- Task 5/6: RESTful API, protected ----
app.use("/api/tasks", tasksApi);

// ---- Task 7: external API integration ----
app.use("/api/external", externalApi);

// 404 handler
app.use((req, res) => {
  res.status(404).send("404 - Page not found");
});

// Centralized error handler (Task 8: robust middleware chain)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`Cognifyz Full Stack app running at http://localhost:${PORT}`);
});

module.exports = app;
