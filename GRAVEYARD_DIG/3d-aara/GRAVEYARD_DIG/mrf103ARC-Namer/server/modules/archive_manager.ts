/**
 * ═══════════════════════════════════════════════════════════════
 * ARC ARCHIVE MANAGER
 * ═══════════════════════════════════════════════════════════════
 * نظام أرشفة متكامل مع Supabase
 * - بروتوكولات وصول وصلاحيات
 * - تبادل بيانات محكوم
 * - أرشفة ذكية مع تشفير
 * ═══════════════════════════════════════════════════════════════
 */

import fs from "fs";
import path from "path";
import archiver from "archiver";
import crypto from "crypto";
import { supabase, isSupabaseConfigured } from "../supabase";
import { log } from "../index";

// ═══════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface ArchiveEntry {
  id?: string;
  archive_name: string;
  archive_type: "logs" | "reports" | "agent_data" | "system_backup" | "full_snapshot";
  file_path: string;
  file_size_bytes: number;
  compression_ratio?: number;
  encrypted: boolean;
  encryption_key_id?: string;
  source_agent?: string;
  retention_days: number;
  access_level: "public" | "internal" | "confidential" | "restricted";
  metadata: Record<string, any>;
  created_at?: string;
  expires_at?: string;
}

export interface AccessControl {
  agent_id: string;
  resource_type: "archive" | "agent_data" | "system_logs";
  resource_id: string;
  permissions: ("read" | "write" | "delete" | "share")[];
  granted_by: string;
  granted_at: string;
  expires_at?: string;
}

// ═══════════════════════════════════════════════════════════════
// ARCHIVE CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const ARCHIVE_CONFIG = {
  baseDir: path.join(process.cwd(), "archives"),
  reportsDir: path.join(process.cwd(), "reports"),
  agentDataDir: path.join(process.cwd(), "agent_data"),
  maxArchiveSize: 100 * 1024 * 1024, // 100 MB
  compressionLevel: 9,
  encryptionAlgorithm: "aes-256-gcm",
  defaultRetentionDays: 90,
  accessLevels: {
    public: 0,
    internal: 1,
    confidential: 2,
    restricted: 3,
  },
};

// ═══════════════════════════════════════════════════════════════
// ENCRYPTION UTILITIES
// ═══════════════════════════════════════════════════════════════

function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

function encryptFile(filePath: string, key: string): string {
  const algorithm = ARCHIVE_CONFIG.encryptionAlgorithm;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, "hex"), iv) as crypto.CipherGCM;
  
  const input = fs.readFileSync(filePath);
  const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
  
  const encryptedPath = `${filePath}.encrypted`;
  const authTag = cipher.getAuthTag();
  
  fs.writeFileSync(encryptedPath, Buffer.concat([iv, authTag, encrypted]));
  
  return encryptedPath;
}

// ═══════════════════════════════════════════════════════════════
// DIRECTORY MANAGEMENT
// ═══════════════════════════════════════════════════════════════

function ensureDirectories() {
  const dirs = [
    ARCHIVE_CONFIG.baseDir,
    ARCHIVE_CONFIG.reportsDir,
    ARCHIVE_CONFIG.agentDataDir,
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log(`📁 Created directory: ${dir}`, "archive_manager");
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// ARCHIVE CREATION
// ═══════════════════════════════════════════════════════════════

export async function createArchive(
  sourceDir: string,
  archiveName: string,
  options: {
    type: ArchiveEntry["archive_type"];
    encrypt?: boolean;
    accessLevel?: ArchiveEntry["access_level"];
    sourceAgent?: string;
    retentionDays?: number;
    metadata?: Record<string, any>;
  }
): Promise<ArchiveEntry | null> {
  try {
    ensureDirectories();

    if (!fs.existsSync(sourceDir)) {
      log(`⚠️ Source directory not found: ${sourceDir}`, "archive_manager");
      return null;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const archiveFileName = `${archiveName}_${timestamp}.zip`;
    const archivePath = path.join(ARCHIVE_CONFIG.baseDir, archiveFileName);

    // Create ZIP archive
    const output = fs.createWriteStream(archivePath);
    const archive = archiver("zip", { zlib: { level: ARCHIVE_CONFIG.compressionLevel } });

    archive.pipe(output);
    archive.directory(sourceDir, false);
    await archive.finalize();

    // Wait for write to complete
    await new Promise((resolve) => output.on("close", resolve));

    const stats = fs.statSync(archivePath);
    let finalPath = archivePath;
    let encryptionKeyId: string | undefined;

    // Encrypt if requested
    if (options.encrypt) {
      const key = generateEncryptionKey();
      encryptionKeyId = crypto.createHash("sha256").update(key).digest("hex").substring(0, 16);
      finalPath = encryptFile(archivePath, key);
      
      // Store encryption key in Supabase
      if (isSupabaseConfigured()) {
        await supabase?.from("archive_encryption_keys").insert({
          key_id: encryptionKeyId,
          encrypted_key: key, // In production, encrypt this too!
          algorithm: ARCHIVE_CONFIG.encryptionAlgorithm,
          created_at: new Date().toISOString(),
        });
      }

      // Remove unencrypted file
      fs.unlinkSync(archivePath);
    }

    // Create archive entry
    const archiveEntry: ArchiveEntry = {
      archive_name: archiveName,
      archive_type: options.type,
      file_path: finalPath,
      file_size_bytes: stats.size,
      encrypted: options.encrypt || false,
      encryption_key_id: encryptionKeyId,
      source_agent: options.sourceAgent,
      retention_days: options.retentionDays || ARCHIVE_CONFIG.defaultRetentionDays,
      access_level: options.accessLevel || "internal",
      metadata: options.metadata || {},
      created_at: new Date().toISOString(),
      expires_at: new Date(
        Date.now() + (options.retentionDays || ARCHIVE_CONFIG.defaultRetentionDays) * 24 * 60 * 60 * 1000
      ).toISOString(),
    };

    // Store in Supabase
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase!.from("arc_archives").insert(archiveEntry).select();
      
      if (error) {
        log(`❌ Failed to store archive metadata: ${(error instanceof Error ? error.message : 'Unknown error')}`, "archive_manager");
      } else {
        archiveEntry.id = data?.[0]?.id;
        log(`✅ Archive created: ${archiveName} (${stats.size} bytes)`, "archive_manager");
      }
    }

    return archiveEntry;
  } catch (err: any) {
    log(`❌ Archive creation failed: ${err.message}`, "archive_manager");
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// ACCESS CONTROL
// ═══════════════════════════════════════════════════════════════

export async function grantAccess(
  agentId: string,
  resourceType: AccessControl["resource_type"],
  resourceId: string,
  permissions: AccessControl["permissions"],
  grantedBy: string,
  expiresInDays?: number
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const accessControl: AccessControl = {
      agent_id: agentId,
      resource_type: resourceType,
      resource_id: resourceId,
      permissions,
      granted_by: grantedBy,
      granted_at: new Date().toISOString(),
      expires_at: expiresInDays
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    };

    const { error } = await supabase!.from("arc_access_control").insert(accessControl);

    if (error) {
      log(`❌ Failed to grant access: ${(error instanceof Error ? error.message : 'Unknown error')}`, "archive_manager");
      return false;
    }

    log(`✅ Access granted to ${agentId} for ${resourceType}:${resourceId}`, "archive_manager");
    return true;
  } catch (err: any) {
    log(`❌ Access grant failed: ${err.message}`, "archive_manager");
    return false;
  }
}

export async function checkAccess(
  agentId: string,
  resourceType: AccessControl["resource_type"],
  resourceId: string,
  requiredPermission: AccessControl["permissions"][number]
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const { data, error } = await supabase!
      .from("arc_access_control")
      .select("*")
      .eq("agent_id", agentId)
      .eq("resource_type", resourceType)
      .eq("resource_id", resourceId)
      .single();

    if (error || !data) return false;

    // Check if expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return false;
    }

    return data.permissions.includes(requiredPermission);
  } catch (err: any) {
    log(`❌ Access check failed: ${err.message}`, "archive_manager");
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════
// ARCHIVE RETRIEVAL
// ═══════════════════════════════════════════════════════════════

export async function listArchives(
  filters?: {
    type?: ArchiveEntry["archive_type"];
    sourceAgent?: string;
    accessLevel?: ArchiveEntry["access_level"];
  }
): Promise<ArchiveEntry[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    let query = supabase!.from("arc_archives").select("*");

    if (filters?.type) query = query.eq("archive_type", filters.type);
    if (filters?.sourceAgent) query = query.eq("source_agent", filters.sourceAgent);
    if (filters?.accessLevel) query = query.eq("access_level", filters.accessLevel);

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      log(`❌ Failed to list archives: ${(error instanceof Error ? error.message : 'Unknown error')}`, "archive_manager");
      return [];
    }

    return data || [];
  } catch (err: any) {
    log(`❌ Archive listing failed: ${err.message}`, "archive_manager");
    return [];
  }
}

// ═══════════════════════════════════════════════════════════════
// CLEANUP & MAINTENANCE
// ═══════════════════════════════════════════════════════════════

export async function cleanupExpiredArchives(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase!
      .from("arc_archives")
      .select("*")
      .lt("expires_at", now);

    if (error || !data) return 0;

    let deletedCount = 0;

    for (const archive of data) {
      try {
        // Delete physical file
        if (fs.existsSync(archive.file_path)) {
          fs.unlinkSync(archive.file_path);
        }

        // Delete metadata
        await supabase!.from("arc_archives").delete().eq("id", archive.id);
        
        deletedCount++;
      } catch (err: any) {
        log(`⚠️ Failed to delete archive ${archive.id}: ${err.message}`, "archive_manager");
      }
    }

    log(`🗑️  Cleaned up ${deletedCount} expired archives`, "archive_manager");
    return deletedCount;
  } catch (err: any) {
    log(`❌ Cleanup failed: ${err.message}`, "archive_manager");
    return 0;
  }
}

// ═══════════════════════════════════════════════════════════════
// SCHEDULED ARCHIVING
// ═══════════════════════════════════════════════════════════════

export async function scheduledArchiving() {
  log("🔄 Starting scheduled archiving...", "archive_manager");

  // Archive system logs
  await createArchive(ARCHIVE_CONFIG.reportsDir, "system_logs", {
    type: "logs",
    encrypt: true,
    accessLevel: "internal",
    sourceAgent: "ARC-System",
    retentionDays: 90,
  });

  // Cleanup expired archives
  await cleanupExpiredArchives();

  log("✅ Scheduled archiving completed", "archive_manager");
}
