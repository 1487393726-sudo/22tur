import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '6months'

    // 根据时间范围计算日期
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

    // 获取财务交易数据
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // 获取发票数据
    const invoices = await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // 按月分组数据
    const monthlyData = []
    const monthMap = new Map()

    // 初始化月份
    const current = new Date(startDate)
    while (current <= now) {
      const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
      monthMap.set(monthKey, {
        month: `${current.getMonth() + 1}月`,
        revenue: 0,
        expenses: 0,
        profit: 0
      })
      current.setMonth(current.getMonth() + 1)
    }

    // 统计交易数据
    transactions.forEach(transaction => {
      const date = new Date(transaction.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthData = monthMap.get(monthKey)
      
      if (monthData) {
        if (transaction.type === 'INCOME') {
          monthData.revenue += transaction.amount
        } else {
          monthData.expenses += transaction.amount
        }
      }
    })

    // 统计发票数据
    invoices.forEach(invoice => {
      const date = new Date(invoice.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthData = monthMap.get(monthKey)
      
      if (monthData && invoice.status === 'PAID') {
        monthData.revenue += invoice.amount
      }
    })

    // 计算利润并生成最终数据
    monthMap.forEach((data) => {
      data.profit = data.revenue - data.expenses
      monthlyData.push(data)
    })

    return NextResponse.json(monthlyData)
  } catch (error) {
    console.error('获取收入数据失败:', error)
    return NextResponse.json(
      { error: '获取收入数据失败' },
      { status: 500 }
    )
  }
}