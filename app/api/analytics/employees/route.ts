import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 获取所有员工
    const employees = await prisma.user.findMany({
      where: {
        role: {
          in: ['EMPLOYEE', 'MANAGER']
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true
      }
    })

    // 获取员工绩效数据
    const employeePerformance = []

    for (const employee of employees) {
      // 获取员工任务统计
      const taskStats = await prisma.task.groupBy({
        by: ['status'],
        where: {
          assigneeId: employee.id
        },
        _count: {
          id: true
        }
      })

      // 计算任务完成数和进行中任务数
      let completedTasks = 0
      let inProgressTasks = 0

      taskStats.forEach(stat => {
        if (stat.status === 'COMPLETED') {
          completedTasks = stat._count.id
        } else if (stat.status === 'IN_PROGRESS') {
          inProgressTasks = stat._count.id
        }
      })

      // 计算效率（基于完成率）
      const totalAssignedTasks = taskStats.reduce((sum, stat) => sum + stat._count.id, 0)
      const efficiency = totalAssignedTasks > 0 ? Math.round((completedTasks / totalAssignedTasks) * 100) : 0

      employeePerformance.push({
        name: `${employee.firstName} ${employee.lastName}`,
        completed: completedTasks,
        inProgress: inProgressTasks,
        efficiency: Math.min(efficiency, 100) // 确保不超过100%
      })
    }

    // 按完成任务数排序
    employeePerformance.sort((a, b) => b.completed - a.completed)

    return NextResponse.json(employeePerformance)
  } catch (error) {
    console.error('获取员工分析数据失败:', error)
    return NextResponse.json(
      { error: '获取员工分析数据失败' },
      { status: 500 }
    )
  }
}