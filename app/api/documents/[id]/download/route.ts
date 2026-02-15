import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type RouteContext = { params: Promise<{ id: string }> };

// 下载文档
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  try {
    const { userId } = await request.json()

    // 检查文档是否存在
    const document = await prisma.document.findUnique({
      where: { id },
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

    if (!document) {
      return NextResponse.json(
        { error: '文档不存在' },
        { status: 404 }
      )
    }

    // 检查文档状态
    if (document.status !== 'active') {
      return NextResponse.json(
        { error: '文档尚未发布，无法下载' },
        { status: 403 }
      )
    }

    // 记录下载历史
    if (userId) {
      await prisma.documentDownload.create({
        data: {
          documentId: id,
          userId,
          downloadDate: new Date()
        }
      })
    }

    // 增加下载次数
    await prisma.document.update({
      where: { id },
      data: {
        downloadCount: {
          increment: 1
        }
      }
    })

    // 在实际应用中，这里应该返回文件的实际URL或文件流
    // 这里返回模拟的下载链接
    return NextResponse.json({
      message: '下载成功',
      document: {
        id: document.id,
        title: document.title,
        size: document.size,
        type: document.type,
        downloadUrl: `/api/files/${document.id}`, // 实际的文件下载地址
        author: `${document.author?.firstName || ''} ${document.author?.lastName || ''}`.trim()
      }
    })
  } catch (error) {
    console.error('下载文档失败:', error)
    return NextResponse.json(
      { error: '下载文档失败' },
      { status: 500 }
    )
  }
}

// 获取下载历史
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // 检查文档是否存在
    const document = await prisma.document.findUnique({
      where: { id }
    })

    if (!document) {
      return NextResponse.json(
        { error: '文档不存在' },
        { status: 404 }
      )
    }

    const [downloads, total] = await Promise.all([
      prisma.documentDownload.findMany({
        where: { documentId: id },
        orderBy: { downloadDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.documentDownload.count({
        where: { documentId: id }
      })
    ])

    return NextResponse.json({
      downloads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('获取下载历史失败:', error)
    return NextResponse.json(
      { error: '获取下载历史失败' },
      { status: 500 }
    )
  }
}