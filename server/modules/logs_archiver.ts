import fs from "fs";
import archiver from "archiver";
import path from "path";
import { log } from "../index";

export function archiveLogs() {
  try {
    const archivesDir = path.join(process.cwd(), "archives");
    const reportsDir = path.join(process.cwd(), "reports");

    if (!fs.existsSync(reportsDir)) {
      log("⚠️ Reports directory not found, skipping archive", "archiver");
      return;
    }

    if (!fs.existsSync(archivesDir)) {
      try {
        fs.mkdirSync(archivesDir, { recursive: true });
      } catch {
        log("⚠️ Could not create archives directory, skipping archive", "archiver");
        return;
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const output = fs.createWriteStream(path.join(archivesDir, `arc_logs_${timestamp}.zip`));
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(output);
    archive.directory(reportsDir, false);
    archive.finalize();

    log("📦 Logs archived successfully", "archiver");
  } catch (err: any) {
    log(`⚠️ Log archiving skipped: ${err.message}`, "archiver");
  }
}