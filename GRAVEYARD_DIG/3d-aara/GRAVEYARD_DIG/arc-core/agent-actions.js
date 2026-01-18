const planner=require("./agent-planner");
exports.noop=async()=>true;
exports.plan=async(ctx)=>planner.run(ctx);
exports.remember=async(ctx)=>{
  const Database=require("better-sqlite3");
  const db=new Database("db/arc.db");
  db.prepare(
    "INSERT OR REPLACE INTO agent_memory VALUES (?,?,?,?)"
  ).run(ctx.agent,ctx.key,JSON.stringify(ctx.value),Date.now());
  return true;
};
