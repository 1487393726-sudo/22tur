import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/lib/types'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '未授权' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: (await params).id },
      include: {
        department: true
      }
    })

    if (!user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 移除密码字段
    const { password, ...userWithoutPassword } = user

    return NextResponse.json<ApiResponse>({
      success: true,
      data: userWithoutPassword
    })
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: '获取用户信息失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '未授权' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      phone,
      role,
      departmentId,
      position,
      status,
      hireDate
    } = body

    const user = await prisma.user.update({
      where: { id: (await params).id },
      data: {
        firstName,
        lastName,
        phone,
        role,
        departmentId: departmentId || null,
        position,
        status,
        hireDate: hireDate ? new Date(hireDate) : null
      },
      include: {
        department: true
      }
    })

    // 移除密码字段
    const { password, ...userWithoutPassword } = user

    return NextResponse.json<ApiResponse>({
      success: true,
      data: userWithoutPassword,
      message: '用户更新成功'
    })
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: '更新用户失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '权限不足' },
        { status: 403 }
      )
    }

    // 不能删除自己
    if (session.user.id === (await params).id) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: '不能删除自己的账户' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: (await params).id }
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: '用户删除成功'
    })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: '删除用户失败' },
      { status: 500 }
    )
  }
}