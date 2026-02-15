import { NextRequest, NextResponse } from 'next/server';
import VisitorTracker from '@/lib/analytics/visitor-tracker';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    
    const tracker = VisitorTracker.getInstance();
    const history = await tracker.getHistoricalStats(days);
    
    return NextResponse.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('获取历史统计API错误:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get historical stats' },
      { status: 500 }
    );
  }
}