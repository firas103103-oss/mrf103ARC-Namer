import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

console.log("Initializing ARC Intelligence Framework v2.0...");

const env = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  OPENAI_KEY: process.env.OPENAI_API_KEY,
  N8N_URL: process.env.N8N_WEBHOOK_URL,
  ELEVEN_KEY: process.env.ELEVENLABS_API_KEY
};

for (const [key, value] of Object.entries(env)) {
  if (!value) console.warn(`Warning: Missing ${key}`);
}

const folders = ["arc_core", "arc_core/actions", "reports", "archives"];
folders.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created folder: ${dir}`);
  }
});

const manifestPath = "arc_core/brain_manifest.json";
if (!fs.existsSync(manifestPath)) {
  const manifest = {
    system_version: "ARC-v2.0",
    initialized_at: new Date().toISOString(),
    environment: {
      supabase_url: env.SUPABASE_URL,
      n8n_webhook: env.N8N_URL,
      replit_runtime: true
    },
    agents: [
      { id: "Mr.F", role: "Executive Brain" },
      { id: "L0-Comms", role: "Communications Director" },
      { id: "L0-Ops", role: "Operations Commander" },
      { id: "L0-Intel", role: "Intelligence Analyst" },
      { id: "Dr.Maya", role: "Research Analyst" },
      { id: "Jordan", role: "Creative Director" }
    ],
    modules: ["Actions", "Context", "Reasoning", "Execution"],
    status: "operational"
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log("Brain manifest created");
} else {
  console.log("Existing brain manifest found - skipping creation");
}

const actions = {
  "system.report_generate.js": `import fs from "fs";
export default {
  async execute() {
    const f = "./reports/Report_" + Date.now() + ".txt";
    fs.writeFileSync(f, "ARC Report " + new Date().toLocaleString());
    return { status: "generated", path: f };
  }
};`,
  "comm.notify_telegram.js": `export default {
  async execute({ message }) {
    await fetch(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message })
    });
    return { status: "sent" };
  }
};`
};

for (const [name, code] of Object.entries(actions)) {
  const filePath = path.join("arc_core/actions", name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, code);
    console.log(`Added action: ${name}`);
  }
}

const initReport = `reports/Init_${Date.now()}.txt`;
fs.writeFileSync(initReport, `ARC Framework Initialized\n${new Date().toLocaleString()}`);

console.log("ARC Intelligence Framework v2.0 Setup Complete");
