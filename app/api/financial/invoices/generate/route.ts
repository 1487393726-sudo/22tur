import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 生成发票号码
export async function GET(request: NextRequest) {
  try {
    const today = new Date()
    const year = today.getFullYear()
    const monthNum = today.getMonth() + 1
    const month = String(monthNum).padStart(2, '0')
    
    // 获取本月最后一张发票的序号
    const lastInvoice = await prisma.financialRecord.findFirst({
      where: {
        type: 'INVOICE',
        createdAt: {
          gte: new Date(year, monthNum - 1, 1),
          lt: new Date(year, monthNum, 1)
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    let sequenceNumber = 1
    if (lastInvoice && lastInvoice.fileName) {
      const match = lastInvoice.fileName.match(/(\d+)$/)
      if (match) {
        sequenceNumber = parseInt(match[1]) + 1
      }
    }

    const invoiceNumber = `INV${year}${month}${String(sequenceNumber).padStart(3, '0')}`

    return NextResponse.json({
      invoiceNumber,
      sequenceNumber,
      year,
      month
    })
  } catch (error) {
    console.error('生成发票号码失败:', error)
    return NextResponse.json(
      { error: '生成发票号码失败' },
      { status: 500 }
    )
  }
}

// 生成完整的发票
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      clientName, 
      projectName, 
      amount, 
      taxRate = 0.06, 
      description,
      userId,
      dueDate 
    } = body

    if (!clientName || !amount || !userId) {
      return NextResponse.json(
        { error: '缺少必要字段' },
        { status: 400 }
      )
    }

    // 检查用户权限
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'FINANCE')) {
      return NextResponse.json(
        { error: '权限不足' },
        { status: 403 }
      )
    }

    // 生成发票号码
    const today = new Date()
    const year = today.getFullYear()
    const monthNum = today.getMonth() + 1
    const month = String(monthNum).padStart(2, '0')
    
    const lastInvoice = await prisma.financialRecord.findFirst({
      where: {
        type: 'INVOICE',
        createdAt: {
          gte: new Date(year, monthNum - 1, 1),
          lt: new Date(year, monthNum, 1)
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    let sequenceNumber = 1
    if (lastInvoice && lastInvoice.fileName) {
      const match = lastInvoice.fileName.match(/(\d+)$/)
      if (match) {
        sequenceNumber = parseInt(match[1]) + 1
      }
    }

    const invoiceNumber = `INV${year}${month}${String(sequenceNumber).padStart(3, '0')}`
    const fileName = `invoice_${projectName}_${year}${month}.pdf`
    const filePath = `/financial/invoices/${fileName}`

    const taxAmount = parseFloat(amount) * taxRate
    const netAmount = parseFloat(amount) - taxAmount

    const invoice = await prisma.financialRecord.create({
      data: {
        type: 'INVOICE',
        title: `${projectName}项目发票`,
        amount: parseFloat(amount),
        description: description || `${projectName}项目开发服务费用`,
        fileName,
        filePath,
        userId,
        status: 'COMPLETED',
        metadata: JSON.stringify({
          clientName,
          projectName,
          taxRate,
          taxAmount,
          netAmount,
          dueDate: dueDate || null,
          invoiceNumber
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
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
    })

    return NextResponse.json({
      ...invoice,
      generatedInfo: {
        invoiceNumber,
        fileName,
        filePath,
        taxAmount,
        netAmount,
        taxRate
      }
    }, { status: 201 })
  } catch (error) {
    console.error('生成发票失败:', error)
    return NextResponse.json(
      { error: '生成发票失败' },
      { status: 500 }
    )
  }
}