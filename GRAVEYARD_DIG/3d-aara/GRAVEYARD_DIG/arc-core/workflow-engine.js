const Database = require("better-sqlite3");
const actions = require("./agent-actions");
const db = new Database("db/arc.db");

setInterval(async () => {
  const wf = db.prepare("SELECT * FROM workflows WHERE state='running'").get();
  if (!wf) return;

  const def = JSON.parse(wf.definition);
  const step = def.steps[wf.pointer];
  if (!step) { db.prepare("UPDATE workflows SET state='done' WHERE id=?").run(wf.id); return; }

  if (step.if && !step.if(wf)) {
    db.prepare("UPDATE workflows SET pointer=pointer+1 WHERE id=?").run(wf.id);
    return;
  }

  try {
    await actions[step.action](step.payload || {});
    db.prepare("UPDATE workflows SET pointer=pointer+1 WHERE id=?").run(wf.id);
  } catch {
    db.prepare("UPDATE workflows SET state='failed' WHERE id=?").run(wf.id);
  }
}, 1000);
