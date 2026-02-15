import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 获取单个文档详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const document = await prisma.document.findUnique({
      where: { id: resolvedParams.id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        versions: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: '文档不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('获取文档详情失败:', error)
    return NextResponse.json(
      { error: '获取文档详情失败' },
      { status: 500 }
    )
  }
}

// 更新文档
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json()
    const { title, description, category, status, version } = body

    const document = await prisma.document.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!document) {
      return NextResponse.json(
        { error: '文档不存在' },
        { status: 404 }
      )
    }

    const updatedDocument = await prisma.document.update({
      where: { id: resolvedParams.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(status && { status }),
        ...(version && { version }),
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(updatedDocument)
  } catch (error) {
    console.error('更新文档失败:', error)
    return NextResponse.json(
      { error: '更新文档失败' },
      { status: 500 }
    )
  }
}

// 删除文档
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const document = await prisma.document.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!document) {
      return NextResponse.json(
        { error: '文档不存在' },
        { status: 404 }
      )
    }

    await prisma.document.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: '文档删除成功' })
  } catch (error) {
    console.error('删除文档失败:', error)
    return NextResponse.json(
      { error: '删除文档失败' },
      { status: 500 }
    )
  }
}