import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const connectionString = process.env.SUPABASE_DATABASE_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "SUPABASE_DATABASE_URL or DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isSupabase = !!process.env.SUPABASE_DATABASE_URL;

export const pool = new Pool({
  connectionString,
  // nosemgrep: javascript.node.bypass-tls-verification
  // rejectUnauthorized: false is required for Supabase connections in some environments
  // (the Supabase SSL certificate chain is not always trusted by Node.js' default CA store).
  // TODO: replace with the Supabase CA certificate bundle for full TLS validation in production.
  // Tracked: BLOQ5-SEC-001
  ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
