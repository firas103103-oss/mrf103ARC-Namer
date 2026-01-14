import { sql, relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  varchar,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

// ============================================
// CLONING SYSTEM TABLES
// ============================================

// جدول ملفات المستخدمين (User Profiles)
export const userProfiles = pgTable("user_profiles", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: varchar("username").notNull().unique(),
  email: varchar("email").notNull().unique(),
  phoneNumber: varchar("phone_number"),
  password: varchar("password").notNull(), // Hashed with bcrypt
  
  // معلومات شخصية
  personalInfo: jsonb("personal_info").default({}), // { skills, jobTitle, bio, etc }
  
  // معلومات المشاريع
  projectsInfo: jsonb("projects_info").default({}), // { github, gitlab, portfolio, etc }
  
  // معلومات التواصل الاجتماعي
  socialInfo: jsonb("social_info").default({}), // { linkedin, twitter, etc }
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_profiles_username").on(table.username),
  index("idx_user_profiles_email").on(table.email),
]);

// جدول ملفات المستخدمين (Files)
export const userFiles = pgTable("user_files", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  fileType: varchar("file_type").notNull(), // 'voice', 'photo', 'document'
  fileName: varchar("file_name").notNull(),
  filePath: varchar("file_path").notNull(),
  fileSize: integer("file_size"), // in bytes
  mimeType: varchar("mime_type"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
}, (table) => [
  index("idx_user_files_user_id").on(table.userId),
]);

// جدول أجهزة IoT للمستخدمين
export const userIotDevices = pgTable("user_iot_devices", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  deviceType: varchar("device_type").notNull(), // 'xbio_sentinel', 'personal_xbio', etc
  deviceName: varchar("device_name"),
  deviceConfig: jsonb("device_config").default({}), // Configuration specific to device
  isActive: boolean("is_active").default(true),
  addedAt: timestamp("added_at").defaultNow(),
}, (table) => [
  index("idx_user_iot_devices_user_id").on(table.userId),
]);

// Relations للنظام
export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
  files: many(userFiles),
  iotDevices: many(userIotDevices),
}));

export const userFilesRelations = relations(userFiles, ({ one }) => ({
  user: one(userProfiles, {
    fields: [userFiles.userId],
    references: [userProfiles.id],
  }),
}));

export const userIotDevicesRelations = relations(userIotDevices, ({ one }) => ({
  user: one(userProfiles, {
    fields: [userIotDevices.userId],
    references: [userProfiles.id],
  }),
}));

// Type exports
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
export type UserFile = typeof userFiles.$inferSelect;
export type InsertUserFile = typeof userFiles.$inferInsert;
export type UserIotDevice = typeof userIotDevices.$inferSelect;
export type InsertUserIotDevice = typeof userIotDevices.$inferInsert;
