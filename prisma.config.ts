import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // In production: set DATABASE_URL in Vercel environment variables
    // In local dev: set DATABASE_URL in .env.local
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  },
});
