import { NextRequest, NextResponse } from 'next/server';
import VisitorTracker from '@/lib/analytics/visitor-tracker';

export async function POST(request: NextRequest) {
  try {
    const { page } = await request.json();
    
    // 获取访客信息
    const ipAddress = request.ip || 
                     request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';
    
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    
    // 记录访客
    const tracker = VisitorTracker.getInstance();
    await tracker.trackVisitor(ipAddress, userAgent, page || '/');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('访客追踪API错误:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track visitor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tracker = VisitorTracker.getInstance();
    
    // 清理离线用户
    await tracker.cleanupOfflineUsers();
    
    // 获取当前统计
    const stats = await tracker.getStats();
    
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取统计API错误:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get stats' },
      { status: 500 }
    );
  }
}