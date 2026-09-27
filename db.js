/**
 * db.js
 * ------------------------------------------------------------------
 * Lightweight JSON-file "database" used for this internship submission.
 *
 * WHY: Tasks 1-2 ask only for "temporary server-side storage", and
 * Task 6 asks to "integrate a database (e.g. MongoDB, MySQL)". To keep
 * this project runnable anywhere with zero external services (no Mongo/
 * MySQL server required to grade it), persistence is implemented as
 * JSON files on disk behind a tiny repository API.
 *
 * The functions below (find, insert, update, remove) are intentionally
 * shaped like a real database driver, so swapping this file for a real
 * Mongoose/Sequelize model later only requires changing this module -
 * nothing in routes/ or middleware/ needs to change.
 * ------------------------------------------------------------------
 */
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

function fileFor(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function readCollection(collection) {
  const file = fileFor(collection);
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function writeCollection(collection, data) {
  fs.writeFileSync(fileFor(collection), JSON.stringify(data, null, 2));
}

let idCounter = Date.now();
function nextId() {
  idCounter += 1;
  return idCounter.toString(36);
}

const db = {
  findAll(collection) {
    return readCollection(collection);
  },
  findOne(collection, predicate) {
    return readCollection(collection).find(predicate) || null;
  },
  insert(collection, doc) {
    const items = readCollection(collection);
    const record = { id: nextId(), createdAt: new Date().toISOString(), ...doc };
    items.push(record);
    writeCollection(collection, items);
    return record;
  },
  update(collection, id, changes) {
    const items = readCollection(collection);
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...changes, updatedAt: new Date().toISOString() };
    writeCollection(collection, items);
    return items[idx];
  },
  remove(collection, id) {
    const items = readCollection(collection);
    const next = items.filter((i) => i.id !== id);
    writeCollection(collection, next);
    return next.length !== items.length;
  },
};

module.exports = db;
