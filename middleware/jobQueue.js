/**
 * Task 8 - "Implement background tasks or job processing using tools
 * like Redis or a task queue." This is a minimal in-memory async task
 * queue (no Redis needed to run the project). Jobs are processed one
 * at a time, off the request/response cycle, which is the core idea
 * behind a real queue like Bull/BullMQ (which you'd swap this for in
 * production, backed by Redis).
 */
const queue = [];
let processing = false;

function enqueue(job) {
  queue.push(job);
  processQueue();
}

async function processQueue() {
  if (processing) return;
  processing = true;
  while (queue.length) {
    const job = queue.shift();
    try {
      await job();
    } catch (err) {
      console.error("[jobQueue] job failed:", err.message);
    }
  }
  processing = false;
}

// Example job used by the app: simulate sending a "task created" notification
function notifyTaskCreated(task) {
  enqueue(async () => {
    await new Promise((r) => setTimeout(r, 300)); // simulate async work (e.g. email/SMS)
    console.log(`[jobQueue] Notification: task "${task.title}" was created for user ${task.userId}`);
  });
}

module.exports = { enqueue, notifyTaskCreated };
