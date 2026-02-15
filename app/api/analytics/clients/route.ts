import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 获取客户行业分布
    const industryCounts = await prisma.client.groupBy({
      by: ['industry'],
      _count: {
        id: true
      }
    })

    // 格式化行业数据
    const industryData = [
      { name: '科技企业', value: 0, color: '#8b5cf6' },
      { name: '制造业', value: 0, color: '#06b6d4' },
      { name: '金融服务', value: 0, color: '#10b981' },
      { name: '零售业', value: 0, color: '#f59e0b' },
      { name: '其他', value: 0, color: '#6b7280' },
    ]

    industryCounts.forEach(item => {
      const industryItem = industryData.find(d => d.name === item.industry)
      if (industryItem) {
        industryItem.value = item._count.id
      } else {
        // 如果行业不在预定义列表中，归类到其他
        const otherItem = industryData.find(d => d.name === '其他')
        if (otherItem) {
          otherItem.value += item._count.id
        }
      }
    })

    // 计算客户增长指标
    const now = new Date()
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(now.getMonth() - 1)

    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(now.getMonth() - 3)

    // 获取各时间段客户数量
    const totalClients = await prisma.client.count()
    const newClientsThisMonth = await prisma.client.count({
      where: {
        createdAt: {
          gte: oneMonthAgo
        }
      }
    })

    const newClientsLastThreeMonths = await prisma.client.count({
      where: {
        createdAt: {
          gte: threeMonthsAgo
        }
      }
    })

    // 计算客户留存率（这里用简化算法）
    const activeClients = await prisma.client.count({
      where: {
        projects: {
          some: {
            status: {
              in: ['IN_PROGRESS', 'PLANNING']
            }
          }
        }
      }
    })

    const retentionRate = totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0
    const activeRate = totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0

    // 计算平均客户价值（基于项目金额）
    const projectSum = await prisma.project.aggregate({
      _sum: {
        budget: true
      }
    })

    const avgClientValue = totalClients > 0 ? Math.round((projectSum._sum.budget || 0) / totalClients) : 0

    const clientMetrics = {
      totalClients,
      newClientsThisMonth,
      newClientsLastThreeMonths,
      retentionRate,
      activeRate,
      avgClientValue
    }

    return NextResponse.json({
      industryData,
      clientMetrics
    })
  } catch (error) {
    console.error('获取客户分析数据失败:', error)
    return NextResponse.json(
      { error: '获取客户分析数据失败' },
      { status: 500 }
    )
  }
}