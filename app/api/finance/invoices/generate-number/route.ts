import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - 生成新的发票号
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')

    // 查找当月最大的发票序号
    const latestInvoice = await prisma.invoice.findFirst({
      where: {
        number: {
          startsWith: `INV-${year}${month}`
        }
      },
      orderBy: {
        number: 'desc'
      }
    })

    let sequence = 1
    if (latestInvoice) {
      // 从发票号中提取序号部分
      const parts = latestInvoice.number.split('-')
      if (parts.length === 3) {
        const lastSequence = parseInt(parts[2])
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1
        }
      }
    }

    const invoiceNumber = `INV-${year}${month}-${sequence.toString().padStart(3, '0')}`

    return NextResponse.json({ invoiceNumber })
  } catch (error) {
    console.error('生成发票号失败:', error)
    
    // 如果数据库查询失败，生成一个基于时间戳的发票号
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    
    const invoiceNumber = `INV-${year}${month}-${random}`
    
    return NextResponse.json({ invoiceNumber })
  }
}