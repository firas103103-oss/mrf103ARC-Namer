import fs from "fs";
import path from "path";

/**
 * ARC Brain Loader
 * Responsible for loading the operational manifest of Mr.F Brain
 * and initializing core awareness modules.
 */

export function loadBrainManifest() {
  const manifestPath = path.join(process.cwd(), "arc_core", "brain_manifest.json");

  if (!fs.existsSync(manifestPath)) {
    console.error("❌ ARC manifest file not found:", manifestPath);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  return manifest;
}

// Initialize Brain Awareness
const brain = loadBrainManifest();
console.log("🧠 ARC Brain initialized →", brain.system_version);
console.log("📦 Modules:", brain.modules.join(", "));