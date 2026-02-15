import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '6months'

    // 计算时间范围
    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3months':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6months':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setMonth(now.getMonth() - 6)
    }

    // 获取财务数据
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startDate
        }
      }
    })

    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })

    const contracts = await prisma.contract.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })

    // 计算总收入、支出和利润
    let totalRevenue = 0
    let totalExpenses = 0

    contracts.forEach(contract => {
      if (contract.status === 'ACTIVE') {
        totalRevenue += contract.amount
      }
    })

    invoices.forEach(invoice => {
      if (invoice.status === 'PAID') {
        totalRevenue += invoice.amount
      }
    })

    expenses.forEach(expense => {
      totalExpenses += expense.amount
    })

    const totalProfit = totalRevenue - totalExpenses

    // 获取项目统计
    const totalProjects = await prisma.project.count()
    const completedProjects = await prisma.project.count({
      where: {
        status: 'COMPLETED'
      }
    })
    const inProgressProjects = await prisma.project.count({
      where: {
        status: 'IN_PROGRESS'
      }
    })

    // 获取客户统计
    const totalClients = await prisma.client.count()
    const newClients = await prisma.client.count({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    })

    // 获取任务统计
    const totalTasks = await prisma.task.count()
    const completedTasks = await prisma.task.count({
      where: {
        status: 'COMPLETED'
      }
    })

    // 获取员工统计
    const totalEmployees = await prisma.user.count({
      where: {
        role: {
          in: ['EMPLOYEE', 'MANAGER']
        }
      }
    })

    // 获取文档统计
    const totalDocuments = await prisma.document.count()
    const publicDocuments = await prisma.document.count({
      where: {
        isPublic: true
      }
    })

    // 计算增长率（简化计算）
    const previousPeriod = new Date(startDate)
    previousPeriod.setMonth(previousPeriod.getMonth() - (period === '1year' ? 12 : 6))

    const previousRevenue = await prisma.contract.aggregate({
      where: {
        status: 'ACTIVE',
        createdAt: {
          gte: previousPeriod,
          lt: startDate
        }
      },
      _sum: {
        amount: true
      }
    })

    const revenueGrowth = previousRevenue._sum.amount 
      ? Math.round(((totalRevenue - previousRevenue._sum.amount) / previousRevenue._sum.amount) * 100)
      : 0

    return NextResponse.json({
      financial: {
        totalRevenue,
        totalExpenses,
        totalProfit,
        revenueGrowth
      },
      projects: {
        totalProjects,
        completedProjects,
        inProgressProjects,
        completionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
      },
      clients: {
        totalClients,
        newClients,
        growthRate: totalClients > 0 ? Math.round((newClients / totalClients) * 100) : 0
      },
      tasks: {
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      },
      employees: {
        totalEmployees
      },
      documents: {
        totalDocuments,
        publicDocuments,
        privateRate: totalDocuments > 0 ? Math.round(((totalDocuments - publicDocuments) / totalDocuments) * 100) : 0
      }
    })
  } catch (error) {
    console.error('获取汇总数据失败:', error)
    return NextResponse.json(
      { error: '获取汇总数据失败' },
      { status: 500 }
    )
  }
}