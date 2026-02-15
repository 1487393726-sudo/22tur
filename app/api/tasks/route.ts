import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - 获取所有任务
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const tasks = await prisma.task.findMany({
      include: {
        assignee: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        project: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // 格式化响应，包含完整的用户名
    const formattedTasks = tasks.map(task => ({
      ...task,
      assignee: task.assignee ? {
        ...task.assignee,
        name: `${task.assignee.firstName} ${task.assignee.lastName}`.trim()
      } : null,
      creator: task.creator ? {
        ...task.creator,
        name: `${task.creator.firstName} ${task.creator.lastName}`.trim()
      } : null
    }))

    return NextResponse.json(formattedTasks)
  } catch (error) {
    console.error('获取任务列表失败:', error)
    return NextResponse.json(
      { error: '获取任务列表失败' },
      { status: 500 }
    )
  }
}

// POST - 创建新任务
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assigneeId,
      projectId
    } = body

    // 验证必填字段
    if (!title || !description || !status || !priority || !dueDate) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      )
    }

    // 验证日期逻辑
    const dueDateObj = new Date(dueDate)
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    if (dueDateObj < now) {
      return NextResponse.json(
        { error: '截止日期不能早于今天' },
        { status: 400 }
      )
    }

    // 如果选择了项目，确保项目存在
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      })

      if (!project) {
        return NextResponse.json(
          { error: '项目不存在' },
          { status: 400 }
        )
      }
    }

    // 获取当前用户作为创建者
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user?.email || '' }
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDateObj,
        assigneeId: assigneeId || null,
        projectId: projectId || null,
        creatorId: currentUser.id
      },
      include: {
        assignee: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        project: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('创建任务失败:', error)
    return NextResponse.json(
      { error: '创建任务失败' },
      { status: 500 }
    )
  }
}