import fs from "fs";
import archiver from "archiver";
import path from "path";
import { log } from "../index";

export function archiveLogs() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const archivesDir = path.join(process.cwd(), "archives");
    const reportsDir = path.join(process.cwd(), "reports");

    if (!fs.existsSync(archivesDir)) fs.mkdirSync(archivesDir);

    const output = fs.createWriteStream(path.join(archivesDir, `arc_logs_${timestamp}.zip`));
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(output);
    archive.directory(reportsDir, false);
    archive.finalize();

    log("📦 Logs archived successfully", "archiver");
  } catch (err: any) {
    log(`❌ Log archiving failed: ${err.message}`, "archiver");
  }
}