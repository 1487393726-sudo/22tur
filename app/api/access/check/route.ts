/**
 * Access Control Check API
 * POST /api/access/check - Check access permission
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { accessControlDecisionEngine } from '@/lib/access-control';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.resourceType || !data.action) {
      return NextResponse.json(
        { error: 'Missing required fields: resourceType, action' },
        { status: 400 }
      );
    }

    // Evaluate access
    const decision = await accessControlDecisionEngine.evaluateAccess({
      userId: data.userId || session.user.id,
      resourceType: data.resourceType,
      action: data.action,
      resourceId: data.resourceId,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json(decision);
  } catch (error) {
    console.error('Error checking access:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
