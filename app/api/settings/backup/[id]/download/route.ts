import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // 在实际应用中，这里会：
    // 1. 根据id找到对应的备份文件
    // 2. 读取文件内容
    // 3. 返回文件下载
    
    // 模拟下载数据
    const mockBackupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      backupId: id,
      data: {
        users: [],
        projects: [],
        clients: [],
        tasks: [],
        documents: [],
        transactions: [],
        invoices: []
      }
    }

    const fileName = `backup-${id}.json`
    
    return new NextResponse(JSON.stringify(mockBackupData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    })
  } catch (error) {
    console.error('下载备份失败:', error)
    return NextResponse.json(
      { error: '下载备份失败' },
      { status: 500 }
    )
  }
}
