import postgres from "postgres";

// prepare: false because Neon's pooled endpoint runs PgBouncer in transaction
// mode. TLS comes from `sslmode=require` in the Neon connection string.
export const sql = postgres(process.env.DATABASE_URL ?? "", { prepare: false });
