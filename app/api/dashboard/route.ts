import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse, DashboardStats } from '@/lib/types'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '未授权' },
        { status: 401 }
      )
    }

    // 获取基础统计数据
    const [
      totalUsers,
      totalProjects,
      totalClients,
      activeTasks,
      totalRevenue,
      totalExpenses,
      recentProjects,
      upcomingTasks
    ] = await Promise.all([
      // 用户总数
      prisma.user.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      
      // 项目总数
      prisma.project.count(),
      
      // 客户总数
      prisma.client.count({
        where: {
          status: 'ACTIVE'
        }
      }),
      
      // 活跃任务数（待办、进行中、待审核）
      prisma.task.count({
        where: {
          status: {
            in: ['TODO', 'IN_PROGRESS', 'REVIEW']
          }
        }
      }),
      
      // 总收入（已支付的发票）
      prisma.invoice.aggregate({
        where: {
          status: 'PAID'
        },
        _sum: {
          amount: true
        }
      }),
      
      // 总支出
      prisma.expense.aggregate({
        _sum: {
          amount: true
        }
      }),
      
      // 最近项目
      prisma.project.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          client: true,
          department: true
        }
      }),
      
      // 即将到期的任务
      prisma.task.findMany({
        take: 5,
        where: {
          status: {
            in: ['TODO', 'IN_PROGRESS']
          },
          dueDate: {
            gte: new Date()
          }
        },
        orderBy: {
          dueDate: 'asc'
        },
        include: {
          assignee: true,
          project: true
        }
      })
    ])

    const stats: DashboardStats = {
      totalUsers,
      totalProjects,
      totalClients,
      activeTasks,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalExpenses: totalExpenses._sum.amount || 0,
      recentProjects,
      upcomingTasks
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: '获取仪表板数据失败' },
      { status: 500 }
    )
  }
}