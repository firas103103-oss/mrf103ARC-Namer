const Database=require("better-sqlite3");
const queue = require("./queue");
const dlq = require("./dlq");
const actions=require("./agent-actions");
const db=new Database("db/arc.db");

setInterval(async ()=>{
  const a=db.prepare("SELECT * FROM agents WHERE state='running'").get();
  if(!a)return;

  try{
    const task=JSON.parse(a.task||"{}");
    if(task.action && actions[task.action]){
      await actions[task.action](task.payload||{});
    }
    db.prepare("UPDATE agents SET state='completed' WHERE id=?").run(a.id);
  }catch(e){
    const r=a.retries+1;
    if(r>3)
      db.prepare("UPDATE agents SET state='failed' WHERE id=?").run(a.id);
    else
      db.prepare("UPDATE agents SET retries=? WHERE id=?").run(r,a.id);
  }
},1000);

queue.process(async job => {
  try {
    const { task } = job.data;
    if (!actions[task.action]) throw new Error("NO_ACTION");
    return await actions[task.action](task.payload||{});
  } catch (e) {
    await dlq.add({ job: job.data, error: e.message });
    throw e;
  }
});
