/**
 * Network Isolation API
 * POST /api/network/evaluate - Evaluate segment access
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { networkIsolationSystem } from '@/lib/network';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.sourceSegment || !data.destinationSegment) {
      return NextResponse.json(
        { error: 'Missing required fields: sourceSegment, destinationSegment' },
        { status: 400 }
      );
    }

    // Evaluate access
    const decision = await networkIsolationSystem.evaluateSegmentAccess({
      sourceSegment: data.sourceSegment,
      destinationSegment: data.destinationSegment,
      userId: data.userId,
      deviceTrustScore: data.deviceTrustScore,
    });

    return NextResponse.json(decision);
  } catch (error) {
    console.error('Error evaluating segment access:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
