import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

/**
 * Enterprise PostgreSQL Connection Pool & Prisma Client
 * Configured for AWS RDS PostgreSQL / Docker Compose / Local PostgreSQL
 */
function createPrismaClient(): PrismaClient {
  const rawUrl = process.env.DATABASE_URL;
  const isPostgresUrl = rawUrl && (rawUrl.startsWith("postgresql://") || rawUrl.startsWith("postgres://"));
  const connectionString = isPostgresUrl
    ? rawUrl
    : "postgresql://postgres:postgres@localhost:5432/crevia?schema=public";

  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
