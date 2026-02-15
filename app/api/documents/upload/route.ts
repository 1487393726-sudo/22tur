import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '未上传文件' }, { status: 400 })
    }

    // 文件大小限制（10MB）
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: '文件大小不能超过10MB' }, { status: 400 })
    }

    // 允许的文件类型
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/svg+xml',
      'video/mp4',
      'video/quicktime',
      'audio/mpeg',
      'audio/wav',
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: '不支持的文件类型' }, { status: 400 })
    }

    // 创建上传目录
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // 目录可能已存在，忽略错误
    }

    // 生成唯一文件名
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const fileExtension = path.extname(file.name)
    const uniqueFileName = `${timestamp}_${random}${fileExtension}`
    const filePath = path.join(uploadDir, uniqueFileName)

    // 保存文件到磁盘
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // 获取当前用户
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user?.email || '' }
    })

    if (!currentUser) {
      return NextResponse.json({ error: '用户不存在' }, { status: 400 })
    }

    // 格式化文件大小
    const formatSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // 创建文档记录
    const document = await prisma.document.create({
      data: {
        title: file.name.replace(fileExtension, ''),
        filePath: uniqueFileName,
        type: file.type.split('/')[1] || 'other',
        category: '其他',
        size: formatSize(file.size),
        authorId: currentUser.id,
        version: 'v1.0',
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('文件上传失败:', error)
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 }
    )
  }
}