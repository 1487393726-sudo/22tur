import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { hexhubPrisma: PrismaClient }

const createHexhubPrismaClient = () => {
  // 如果没有配置 HEXHUB_DATABASE_URL，使用主数据库 URL
  const databaseUrl = process.env.HEXHUB_DATABASE_URL || process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.warn('Neither HEXHUB_DATABASE_URL nor DATABASE_URL is set, using placeholder Prisma client')
    return null as any
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })
}

export const hexhubPrisma =
  globalForPrisma.hexhubPrisma || createHexhubPrismaClient()

if (process.env.NODE_ENV !== 'production')
  globalForPrisma.hexhubPrisma = hexhubPrisma

export default hexhubPrisma
