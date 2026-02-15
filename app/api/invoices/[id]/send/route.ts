/**
 * 发票邮件发送 API
 * 
 * POST /api/invoices/[id]/send
 * 
 * 功能：
 * - 发送发票邮件给客户
 * - 更新发票发送状态
 * - 记录审计日志
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendInvoiceEmailDirect } from '@/lib/email-sender'
import { z } from 'zod'

// 请求验证 schema
const sendInvoiceSchema = z.object({
  recipientEmail: z.string().email('无效的邮箱地址').optional(),
  recipientName: z.string().optional(),
  message: z.string().optional(), // 可选的附加消息
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    
    // 1. 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 2. 获取当前用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 3. 解析请求体
    const body = await request.json().catch(() => ({}))
    const validatedData = sendInvoiceSchema.parse(body)

    // 4. 查询发票信息
    const invoice = await prisma.invoice.findUnique({
      where: { id: resolvedParams.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: '发票不存在' }, { status: 404 })
    }

    // 5. 权限验证（只有管理员可以发送）
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: '无权发送此发票' }, { status: 403 })
    }

    // 6. 确定收件人
    const recipientEmail = validatedData.recipientEmail || invoice.client?.email
    const recipientName = validatedData.recipientName || invoice.client?.name || '客户'

    if (!recipientEmail) {
      return NextResponse.json(
        { error: '未找到收件人邮箱地址' },
        { status: 400 }
      )
    }

    // 7. 发送发票邮件
    const emailSent = await sendInvoiceEmailDirect(
      recipientEmail,
      recipientName,
      invoice.number,
      invoice.id,
      invoice.amount,
      invoice.dueDate
    )

    if (!emailSent) {
      // 记录失败日志
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'SEND_INVOICE_EMAIL',
          resource: 'Invoice',
          resourceId: invoice.id,
          details: JSON.stringify({
            invoiceNumber: invoice.number,
            recipientEmail,
            recipientName,
            status: 'FAILED',
          }),
          status: 'FAILURE',
          risk: 'MEDIUM',
        },
      })

      return NextResponse.json(
        { error: '发送邮件失败，请稍后重试' },
        { status: 500 }
      )
    }

    // 8. 更新发票状态
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        description: JSON.stringify({
          ...(invoice.description ? JSON.parse(invoice.description) : {}),
          lastSentAt: new Date().toISOString(),
          lastSentTo: recipientEmail,
        }),
      },
    })

    // 9. 记录成功日志
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SEND_INVOICE_EMAIL',
        resource: 'Invoice',
        resourceId: invoice.id,
        details: JSON.stringify({
          invoiceNumber: invoice.number,
          recipientEmail,
          recipientName,
          amount: invoice.amount,
          dueDate: invoice.dueDate,
          status: 'SUCCESS',
        }),
        status: 'SUCCESS',
        risk: 'LOW',
      },
    })

    // 10. 返回成功响应
    return NextResponse.json({
      success: true,
      message: '发票邮件已发送',
      invoice: {
        id: updatedInvoice.id,
        invoiceNumber: updatedInvoice.number,
        sentTo: recipientEmail,
        sentAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('发送发票邮件失败:', error)

    // Zod 验证错误
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: '请求数据格式错误',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    // 其他错误
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '发送发票邮件失败',
      },
      { status: 500 }
    )
  }
}
