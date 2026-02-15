import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { subDays, startOfDay, endOfDay } from 'date-fns'

// GET /api/security/logs/stats - 获取审计日志统计信息
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 只有管理员可以查看统计
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7') // 默认最近7天

    const startDate = startOfDay(subDays(new Date(), days))
    const endDate = endOfDay(new Date())

    // 并行查询多个统计数据
    const [
      totalLogs,
      logsByAction,
      logsByStatus,
      logsByRisk,
      logsByUser,
      recentHighRisk,
      dailyStats
    ] = await Promise.all([
      // 总日志数
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),

      // 按操作类型分组
      prisma.auditLog.groupBy({
        by: ['action'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      }),

      // 按状态分组
      prisma.auditLog.groupBy({
        by: ['status'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        }
      }),

      // 按风险等级分组
      prisma.auditLog.groupBy({
        by: ['risk'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        }
      }),

      // 按用户分组（前10名）
      prisma.auditLog.groupBy({
        by: ['userId'],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      }),

      // 最近的高风险日志
      prisma.auditLog.findMany({
        where: {
          risk: {
            in: ['HIGH', 'CRITICAL']
          },
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      }),

      // 每日统计（最近N天）
      prisma.$queryRaw`
        SELECT 
          DATE(createdAt) as date,
          COUNT(*) as count,
          SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as successCount,
          SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failedCount,
          SUM(CASE WHEN status = 'WARNING' THEN 1 ELSE 0 END) as warningCount,
          SUM(CASE WHEN risk = 'HIGH' OR risk = 'CRITICAL' THEN 1 ELSE 0 END) as highRiskCount
        FROM AuditLog
        WHERE createdAt >= ${startDate} AND createdAt <= ${endDate}
        GROUP BY DATE(createdAt)
        ORDER BY date DESC
      `
    ])

    // 获取用户信息
    const userIds = logsByUser.map(item => item.userId).filter(Boolean) as string[]
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    })

    const userMap = new Map(users.map(u => [u.id, u]))

    // 格式化统计数据
    const stats = {
      summary: {
        total: totalLogs,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days
        }
      },
      byAction: logsByAction.map(item => ({
        action: item.action,
        count: item._count.id
      })),
      byStatus: logsByStatus.map(item => ({
        status: item.status,
        count: item._count.id
      })),
      byRisk: logsByRisk.map(item => ({
        risk: item.risk,
        count: item._count.id
      })),
      byUser: logsByUser.map(item => {
        const user = userMap.get(item.userId)
        return {
          userId: item.userId,
          userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          userEmail: user?.email,
          count: item._count.id
        }
      }),
      recentHighRisk: recentHighRisk.map(log => ({
        id: log.id,
        action: log.action,
        resource: log.resource,
        risk: log.risk,
        status: log.status,
        user: log.user ? {
          id: log.user.id,
          name: `${log.user.firstName} ${log.user.lastName}`,
          email: log.user.email
        } : null,
        createdAt: log.createdAt.toISOString()
      })),
      dailyStats: dailyStats
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('获取日志统计失败:', error)
    return NextResponse.json({ error: '获取日志统计失败' }, { status: 500 })
  }
}
