import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 这里应该从数据库获取设置，暂时返回模拟数据
    const settings = {
      company: {
        name: '创意代理公司',
        email: 'info@creative-agency.com',
        phone: '+86 123-456-7890',
        address: '北京市朝阳区创意大厦88号',
        website: 'https://creative-agency.com',
        description: '专注于创意设计和数字化解决方案'
      },
      system: {
        timezone: 'Asia/Shanghai',
        language: 'zh-CN',
        dateFormat: 'YYYY-MM-DD',
        currency: 'CNY',
        backupEnabled: true,
        autoBackup: true,
        backupFrequency: 'daily'
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: false,
        projectUpdates: true,
        taskAssignments: true,
        financialReports: true,
        clientUpdates: false
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 30,
        passwordMinLength: 8,
        passwordRequireSpecial: true,
        loginAlerts: true,
        ipWhitelist: ''
      }
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('获取设置失败:', error)
    return NextResponse.json(
      { error: '获取设置失败' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json()
    
    // 这里应该将设置保存到数据库
    // 由于我们使用的是SQLite，可以创建一个settings表来存储这些设置
    // 暂时返回成功状态
    
    console.log('保存设置:', settings)
    
    return NextResponse.json({ success: true, message: '设置已保存' })
  } catch (error) {
    console.error('保存设置失败:', error)
    return NextResponse.json(
      { error: '保存设置失败' },
      { status: 500 }
    )
  }
}