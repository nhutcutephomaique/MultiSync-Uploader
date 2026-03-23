import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Standard PrismaClient works for PostgreSQL in production.
// For local SQLite dev, we still use this — the adapter is only needed if running
// the SQLite engine directly without a DATABASE_URL pointing to a .db file via CLI.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
