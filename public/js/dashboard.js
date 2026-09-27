// Tasks 4, 5 & 7 on the client side:
//  - Task 4: dynamic DOM updates + a lightweight client-side "router" (filter tabs)
//  - Task 5: talks exclusively to our own REST API (/api/tasks)
//  - Task 7: calls /api/external/quote, which proxies a third-party API

const taskForm = document.getElementById("taskForm");
const taskTitleInput = document.getElementById("taskTitle");
const taskPriorityInput = document.getElementById("taskPriority");
const taskFormError = document.getElementById("taskFormError");
const taskList = document.getElementById("taskList");
const filterTabs = document.getElementById("filterTabs");
const quoteBtn = document.getElementById("quoteBtn");
const quoteBox = document.getElementById("quoteBox");

let allTasks = [];
let currentFilter = "all"; // client-side "route": all | active | completed

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

// ---------- Task 4: Complex client-side validation ----------
function validateTaskTitle(title) {
  if (!title.trim()) return "Task title can't be empty.";
  if (title.trim().length > 140) return "Task title must be under 140 characters.";
  return null;
}

// ---------- Task 4: Dynamic DOM rendering ----------
function render() {
  const filtered = allTasks.filter((t) => {
    if (currentFilter === "active") return !t.completed;
    if (currentFilter === "completed") return t.completed;
    return true;
  });

  taskList.innerHTML = "";

  if (filtered.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.textContent = "No tasks here yet.";
    taskList.appendChild(li);
    return;
  }

  for (const task of filtered) {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " completed" : "");
    li.dataset.id = task.id;

    li.innerHTML = `
      <button class="task-check" title="Toggle complete">${task.completed ? "✓" : ""}</button>
      <span class="task-title"></span>
      <span class="priority-badge priority-${task.priority}">${task.priority}</span>
      <button class="task-delete" title="Delete">✕</button>
    `;
    li.querySelector(".task-title").textContent = task.title; // safe text insertion (no HTML injection)
    taskList.appendChild(li);
  }
}

async function loadTasks() {
  try {
    allTasks = await api("/api/tasks");
    render();
  } catch (err) {
    taskList.innerHTML = `<li class="empty-state">Couldn't load tasks: ${err.message}</li>`;
  }
}

// ---------- Create ----------
taskForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = taskTitleInput.value;
  const error = validateTaskTitle(title);
  if (error) {
    taskFormError.textContent = error;
    return;
  }
  taskFormError.textContent = "";

  try {
    const task = await api("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title, priority: taskPriorityInput.value }),
    });
    allTasks.unshift(task);
    taskTitleInput.value = "";
    render();
  } catch (err) {
    taskFormError.textContent = err.message;
  }
});

// ---------- Toggle complete / Delete (event delegation + dynamic DOM update) ----------
taskList.addEventListener("click", async (e) => {
  const item = e.target.closest(".task-item");
  if (!item) return;
  const id = item.dataset.id;

  if (e.target.classList.contains("task-check")) {
    const task = allTasks.find((t) => t.id === id);
    const updated = await api(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify({ completed: !task.completed }),
    });
    allTasks = allTasks.map((t) => (t.id === id ? updated : t));
    render();
  }

  if (e.target.classList.contains("task-delete")) {
    await api(`/api/tasks/${id}`, { method: "DELETE" });
    allTasks = allTasks.filter((t) => t.id !== id);
    render();
  }
});

// ---------- Task 4: client-side routing between filtered views ----------
filterTabs.addEventListener("click", (e) => {
  const btn = e.target.closest(".tab");
  if (!btn) return;
  currentFilter = btn.dataset.filter;
  [...filterTabs.children].forEach((t) => t.classList.toggle("active", t === btn));
  history.replaceState(null, "", `#${currentFilter}`);
  render();
});

// respect a filter hash on page load (e.g. dashboard#completed)
(function initFilterFromHash() {
  const hash = window.location.hash.replace("#", "");
  if (["all", "active", "completed"].includes(hash)) {
    currentFilter = hash;
    [...filterTabs.children].forEach((t) => t.classList.toggle("active", t.dataset.filter === hash));
  }
})();

// ---------- Task 7: external API integration ----------
quoteBtn.addEventListener("click", async () => {
  quoteBtn.disabled = true;
  quoteBtn.textContent = "Loading…";
  try {
    const data = await api("/api/external/quote");
    quoteBox.textContent = `"${data.content}" — ${data.author}`;
    quoteBox.hidden = false;
  } catch (err) {
    quoteBox.textContent = "Couldn't fetch a quote right now: " + err.message;
    quoteBox.hidden = false;
  } finally {
    quoteBtn.disabled = false;
    quoteBtn.textContent = "✨ Get inspired (external API)";
  }
});

loadTasks();
