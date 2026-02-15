import { NextRequest, NextResponse } from 'next/server'
import { HexHubAuditService } from '@/lib/hexhub/audit-service'

/**
 * GET /api/hexhub/audit-logs - 获取审计日志
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get('skip') || '0')
    const take = parseInt(searchParams.get('take') || '10')
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const resource = searchParams.get('resource')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const logs = await HexHubAuditService.getAuditLogs({
      skip,
      take,
      userId: userId || undefined,
      action: action || undefined,
      resource: resource || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })

    return NextResponse.json({
      success: true,
      data: logs,
      count: logs.length,
    })
  } catch (error) {
    console.error('获取审计日志失败:', error)
    return NextResponse.json(
      { success: false, error: '获取审计日志失败' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/hexhub/audit-logs/user/:userId - 获取用户的审计日志
 */
export async function getAuditLogsByUser(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get('skip') || '0')
    const take = parseInt(searchParams.get('take') || '10')
    const action = searchParams.get('action')

    const logs = await HexHubAuditService.getUserAuditLogs(params.userId, {
      skip,
      take,
      action: action || undefined,
    })

    return NextResponse.json({
      success: true,
      data: logs,
      count: logs.length,
    })
  } catch (error) {
    console.error('获取用户审计日志失败:', error)
    return NextResponse.json(
      { success: false, error: '获取用户审计日志失败' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/hexhub/security-events - 获取安全事件
 */
export async function getSecurityEvents(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const skip = parseInt(searchParams.get('skip') || '0')
    const take = parseInt(searchParams.get('take') || '10')
    const type = searchParams.get('type')
    const severity = searchParams.get('severity')
    const status = searchParams.get('status')

    const events = await HexHubAuditService.getSecurityEvents({
      skip,
      take,
      type: type || undefined,
      severity: severity || undefined,
      status: status || undefined,
    })

    return NextResponse.json({
      success: true,
      data: events,
      count: events.length,
    })
  } catch (error) {
    console.error('获取安全事件失败:', error)
    return NextResponse.json(
      { success: false, error: '获取安全事件失败' },
      { status: 500 }
    )
  }
}
