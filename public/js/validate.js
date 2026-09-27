// Task 2: "Utilize inline/client JavaScript for client-side form validation."
// This runs BEFORE the form ever hits the server (server still re-validates
// everything in routes/auth.js — never trust the client).
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const password = document.getElementById("password");
  const confirm = document.getElementById("confirmPassword");
  const errorBox = document.getElementById("clientError");

  function passwordStrengthErrors(pw) {
    const errs = [];
    if (pw.length < 8) errs.push("at least 8 characters");
    if (!/[A-Z]/.test(pw)) errs.push("one uppercase letter");
    if (!/[0-9]/.test(pw)) errs.push("one number");
    return errs;
  }

  form.addEventListener("submit", (e) => {
    const errs = passwordStrengthErrors(password.value);
    if (password.value !== confirm.value) errs.push("matching confirmation password");

    if (errs.length) {
      e.preventDefault();
      errorBox.textContent = "Password needs: " + errs.join(", ") + ".";
    } else {
      errorBox.textContent = "";
    }
  });

  // live feedback as the user types
  password.addEventListener("input", () => {
    const errs = passwordStrengthErrors(password.value);
    errorBox.textContent = errs.length ? "Still needs: " + errs.join(", ") : "";
  });
});
