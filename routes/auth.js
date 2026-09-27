const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { redirectIfAuthed } = require("../middleware/auth");

const router = express.Router();

// ---- Task 1: HTML form + server-side rendering (GET routes render EJS) ----
router.get("/register", redirectIfAuthed, (req, res) => {
  res.render("register", { error: null, old: {} });
});

router.get("/login", redirectIfAuthed, (req, res) => {
  res.render("login", { error: null, old: {} });
});

// ---- Task 2: server-side validation of submitted form data ----
function validateRegistration({ name, email, password, confirmPassword }) {
  const errors = [];
  if (!name || name.trim().length < 2) errors.push("Name must be at least 2 characters.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("A valid email is required.");
  // Task 4: "more complex rules (e.g., password strength)"
  if (!password || password.length < 8) errors.push("Password must be at least 8 characters.");
  if (password && !/[A-Z]/.test(password)) errors.push("Password needs at least one uppercase letter.");
  if (password && !/[0-9]/.test(password)) errors.push("Password needs at least one number.");
  if (password !== confirmPassword) errors.push("Passwords do not match.");
  return errors;
}

router.post("/register", (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  const errors = validateRegistration({ name, email, password, confirmPassword });

  if (db.findOne("users", (u) => u.email === email)) {
    errors.push("An account with that email already exists.");
  }

  if (errors.length) {
    return res.status(400).render("register", { error: errors.join(" "), old: { name, email } });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const user = db.insert("users", { name: name.trim(), email: email.toLowerCase(), password: hashed });

  req.session.userId = user.id;
  req.session.userName = user.name;
  res.redirect("/dashboard");
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const errors = [];
  if (!email) errors.push("Email is required.");
  if (!password) errors.push("Password is required.");

  const user = !errors.length && db.findOne("users", (u) => u.email === (email || "").toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    errors.push("Invalid email or password.");
  }

  if (errors.length) {
    return res.status(400).render("login", { error: errors.join(" "), old: { email } });
  }

  req.session.userId = user.id;
  req.session.userName = user.name;
  res.redirect("/dashboard");
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;
