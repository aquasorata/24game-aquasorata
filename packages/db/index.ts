import { PrismaClient, MatchStatus, MatchMode } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
declare global {
  var prisma: PrismaClient | undefined;
}

export type { User } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const cs = process.env.DATABASE_URL;
if (!cs) throw new Error("DATABASE_URL missing in @repo/db");

const pool = new Pool({ connectionString: cs });

const adapter = new PrismaPg(pool);

export { MatchStatus, MatchMode };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
