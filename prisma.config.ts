// CLI-only config (migrate, studio, db pull). The app's runtime PrismaClient is
// constructed separately in lib/db.ts via a driver adapter pointed at the pooled
// DATABASE_URL — this file uses DIRECT_URL because `prisma migrate` needs a
// non-pooled session connection that Supabase's transaction-mode pooler doesn't support.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
