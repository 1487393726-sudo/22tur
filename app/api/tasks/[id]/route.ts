import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - 获取单个任务详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const taskId = (await params).id

    const task = await prisma.task.findUnique({
      where: {
        id: taskId
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('获取任务详情失败:', error)
    return NextResponse.json(
      { error: '获取任务详情失败' },
      { status: 500 }
    )
  }
}

// PATCH - 更新任务
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const taskId = (await params).id
    const body = await request.json()

    // 检查任务是否存在
    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId
      }
    })

    if (!existingTask) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 })
    }

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assigneeId,
      projectId
    } = body

    // 验证日期逻辑
    if (dueDate) {
      const dueDateObj = new Date(dueDate)
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      
      if (dueDateObj < now) {
        return NextResponse.json(
          { error: '截止日期不能早于今天' },
          { status: 400 }
        )
      }
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

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId
      },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
        ...(projectId !== undefined && { projectId: projectId || null })
      },
      include: {
        assignee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('更新任务失败:', error)
    return NextResponse.json(
      { error: '更新任务失败' },
      { status: 500 }
    )
  }
}

// DELETE - 删除任务
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const taskId = (await params).id

    // 检查任务是否存在
    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId
      }
    })

    if (!existingTask) {
      return NextResponse.json({ error: '任务不存在' }, { status: 404 })
    }

    await prisma.task.delete({
      where: {
        id: taskId
      }
    })

    return NextResponse.json({ message: '任务删除成功' })
  } catch (error) {
    console.error('删除任务失败:', error)
    return NextResponse.json(
      { error: '删除任务失败' },
      { status: 500 }
    )
  }
}