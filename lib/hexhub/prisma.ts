import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { hexhubPrisma: PrismaClient }

export const hexhubPrisma =
  globalForPrisma.hexhubPrisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.HEXHUB_DATABASE_URL,
      },
    },
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production')
  globalForPrisma.hexhubPrisma = hexhubPrisma

export default hexhubPrisma
