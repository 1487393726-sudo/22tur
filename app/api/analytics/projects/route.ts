import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 获取项目状态统计
    const projectStatusCounts = await prisma.project.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    })

    // 格式化项目状态数据
    const statusData = [
      { name: '已完成', value: 0, color: '#22c55e' },
      { name: '进行中', value: 0, color: '#3b82f6' },
      { name: '待开始', value: 0, color: '#f59e0b' },
      { name: '已暂停', value: 0, color: '#ef4444' },
    ]

    projectStatusCounts.forEach(item => {
      const statusItem = statusData.find(s => s.name === item.status)
      if (statusItem) {
        statusItem.value = item._count.id
      }
    })

    // 获取任务完成趋势数据
    const now = new Date()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(now.getMonth() - 6)

    const tasks = await prisma.task.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      select: {
        createdAt: true,
        status: true
      }
    })

    // 按月统计任务创建和完成情况
    const taskTrendData = []
    const monthMap = new Map()

    // 初始化最近6个月
    const current = new Date(sixMonthsAgo)
    for (let i = 0; i < 6; i++) {
      const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
      monthMap.set(monthKey, {
        month: `${current.getMonth() + 1}月`,
        completed: 0,
        created: 0
      })
      current.setMonth(current.getMonth() + 1)
    }

    // 统计任务数据
    tasks.forEach(task => {
      // 统计创建的任务
      if (task.createdAt >= sixMonthsAgo) {
        const createdDate = new Date(task.createdAt)
        const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`
        const monthData = monthMap.get(monthKey)
        if (monthData) {
          monthData.created += 1
        }
      }

      // 统计完成的任务
      if (task.status === 'COMPLETED' && task.createdAt >= sixMonthsAgo) {
        const createdDate = new Date(task.createdAt)
        const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`
        const monthData = monthMap.get(monthKey)
        if (monthData) {
          monthData.completed += 1
        }
      }
    })

    // 生成最终数据
    monthMap.forEach((data) => {
      taskTrendData.push(data)
    })

    return NextResponse.json({
      statusData,
      taskTrendData
    })
  } catch (error) {
    console.error('获取项目分析数据失败:', error)
    return NextResponse.json(
      { error: '获取项目分析数据失败' },
      { status: 500 }
    )
  }
}