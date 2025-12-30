import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import 'dotenv/config'; // Load .env vars

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Please check your .env file.");
}

// Create a connection pool (Standard Architecture)
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });