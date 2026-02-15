import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createError, ErrorCode } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      type = 'error',
      message,
      stack,
      componentStack,
      timestamp,
      url,
      userAgent,
      userId,
      metadata,
      errorCode
    } = body

    // 验证必填字段
    if (!message) {
      throw createError(ErrorCode.VALIDATION_ERROR, '错误消息是必填字段')
    }

    // 记录错误到数据库
    await prisma.securityEvent.create({
      data: {
        type: 'ERROR',
        severity: 'HIGH',
        description: `[${type}] ${message}`,
        details: JSON.stringify({
          type,
          message,
          stack,
          componentStack,
          timestamp,
          url,
          userAgent,
          userId,
          metadata,
          errorCode
        }),
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') ||
                   'unknown',
        userAgent: userAgent || request.headers.get('user-agent') || 'unknown'
      }
    })

    // 开发环境下在控制台输出错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('=== 错误报告 ===')
      console.error('类型:', type)
      console.error('消息:', message)
      console.error('时间:', timestamp)
      console.error('URL:', url)
      console.error('错误码:', errorCode)
      if (stack) console.error('堆栈:', stack)
      console.error('================')
    }

    return new Response(JSON.stringify({
      success: true,
      message: '错误报告已记录'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('记录错误报告失败:', error)
    
    // 即使记录失败也返回成功，避免前端重复发送
    return new Response(JSON.stringify({
      success: true,
      message: '错误报告处理完成'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const severity = searchParams.get('severity')
    const type = searchParams.get('type')

    const skip = (page - 1) * limit

    const where = {
      type: type ? { equals: type } : undefined,
      severity: severity ? { equals: severity } : undefined
    }

    const [events, total] = await Promise.all([
      prisma.securityEvent.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.securityEvent.count({ where })
    ])

    return new Response(JSON.stringify({
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('获取错误报告失败:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: '获取错误报告失败'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}