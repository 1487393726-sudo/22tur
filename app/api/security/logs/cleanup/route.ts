import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { subDays } from 'date-fns'

// POST /api/security/logs/cleanup - 清理旧的审计日志
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 只有超级管理员可以清理日志
    if (session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '权限不足，只有超级管理员可以清理日志' }, { status: 403 })
    }

    const body = await request.json()
    const { 
      retentionDays = 90, // 默认保留90天
      riskLevels = [], // 可选：只清理特定风险等级的日志
      dryRun = false // 是否为模拟运行（不实际删除）
    } = body

    if (retentionDays < 30) {
      return NextResponse.json({ error: '保留天数不能少于30天' }, { status: 400 })
    }

    const cutoffDate = subDays(new Date(), retentionDays)

    // 构建查询条件
    const where: any = {
      createdAt: {
        lt: cutoffDate
      }
    }

    // 如果指定了风险等级，只清理这些等级的日志
    if (riskLevels.length > 0) {
      where.risk = {
        in: riskLevels
      }
    }

    // 排除高风险和严重风险的日志（除非明确指定）
    if (riskLevels.length === 0) {
      where.risk = {
        notIn: ['HIGH', 'CRITICAL']
      }
    }

    // 统计将要删除的日志数量
    const countToDelete = await prisma.auditLog.count({ where })

    if (dryRun) {
      // 模拟运行，只返回统计信息
      return NextResponse.json({
        dryRun: true,
        message: '模拟运行完成',
        stats: {
          logsToDelete: countToDelete,
          cutoffDate: cutoffDate.toISOString(),
          retentionDays,
          riskLevels: riskLevels.length > 0 ? riskLevels : ['LOW', 'MEDIUM']
        }
      })
    }

    // 实际删除日志
    const result = await prisma.auditLog.deleteMany({ where })

    // 创建清理操作的审计日志
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CLEANUP',
        resource: 'AuditLog',
        details: JSON.stringify({
          deletedCount: result.count,
          retentionDays,
          cutoffDate: cutoffDate.toISOString(),
          riskLevels: riskLevels.length > 0 ? riskLevels : ['LOW', 'MEDIUM']
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        status: 'SUCCESS',
        risk: 'HIGH'
      }
    })

    return NextResponse.json({
      success: true,
      message: `成功清理 ${result.count} 条日志`,
      stats: {
        deletedCount: result.count,
        cutoffDate: cutoffDate.toISOString(),
        retentionDays,
        riskLevels: riskLevels.length > 0 ? riskLevels : ['LOW', 'MEDIUM']
      }
    })
  } catch (error) {
    console.error('清理日志失败:', error)
    return NextResponse.json({ error: '清理日志失败' }, { status: 500 })
  }
}

// GET /api/security/logs/cleanup - 获取清理策略和统计
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 只有管理员可以查看清理策略
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '权限不足' }, { status: 403 })
    }

    // 统计不同时间段的日志数量
    const [
      total,
      last30Days,
      last90Days,
      last180Days,
      last365Days,
      older
    ] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: subDays(new Date(), 30)
          }
        }
      }),
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: subDays(new Date(), 90),
            lt: subDays(new Date(), 30)
          }
        }
      }),
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: subDays(new Date(), 180),
            lt: subDays(new Date(), 90)
          }
        }
      }),
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: subDays(new Date(), 365),
            lt: subDays(new Date(), 180)
          }
        }
      }),
      prisma.auditLog.count({
        where: {
          createdAt: {
            lt: subDays(new Date(), 365)
          }
        }
      })
    ])

    // 按风险等级统计
    const byRisk = await prisma.auditLog.groupBy({
      by: ['risk'],
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      total,
      byPeriod: {
        last30Days,
        last90Days,
        last180Days,
        last365Days,
        older
      },
      byRisk: byRisk.map(item => ({
        risk: item.risk,
        count: item._count.id
      })),
      recommendations: {
        suggestedRetentionDays: 90,
        estimatedDeletableCount: last90Days + last180Days + last365Days + older,
        note: '建议保留最近90天的日志，高风险和严重风险的日志将被永久保留'
      }
    })
  } catch (error) {
    console.error('获取清理策略失败:', error)
    return NextResponse.json({ error: '获取清理策略失败' }, { status: 500 })
  }
}
