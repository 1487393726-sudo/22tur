import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/lib/types'
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

    const departments = await prisma.department.findMany({
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            employees: true,
            projects: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: departments
    })
  } catch (error) {
    console.error('Failed to fetch departments:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: '获取部门列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '权限不足' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      managerId
    } = body

    // 检查部门名称是否已存在
    const existingDept = await prisma.department.findUnique({
      where: { name }
    })

    if (existingDept) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '部门名称已存在' },
        { status: 400 }
      )
    }

    const department = await prisma.department.create({
      data: {
        name,
        description,
        managerId: managerId || null
      },
      include: {
        manager: true
      }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: department,
      message: '部门创建成功'
    })
  } catch (error) {
    console.error('Failed to create department:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: '创建部门失败' },
      { status: 500 }
    )
  }
}