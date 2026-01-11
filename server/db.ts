import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import "dotenv/config"; // Load .env vars

const connectionString =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/test_db";

// Create a connection pool (Standard Architecture)
export const pool = new pg.Pool({
  connectionString,
  // Make tests fail fast if the DB is unreachable instead of hanging
  connectionTimeoutMillis: process.env.NODE_ENV === "test" ? 200 : undefined,
  max: process.env.NODE_ENV === "test" ? 1 : undefined,
});

export const db = drizzle(pool, { schema });
