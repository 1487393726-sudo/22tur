/**
 * Network Isolation API
 * POST /api/network/segments - Create segment
 * GET /api/network/segments - List segments
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { networkIsolationSystem } from '@/lib/network';
import { auditLogSystem } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.cidr) {
      return NextResponse.json(
        { error: 'Missing required fields: name, cidr' },
        { status: 400 }
      );
    }

    // Create segment
    const segment = await networkIsolationSystem.createSegment({
      name: data.name,
      cidr: data.cidr,
      description: data.description,
    });

    // Log the action
    await auditLogSystem.logSuccess('NETWORK_SEGMENT_CREATED', 'NETWORK_SEGMENT', segment.id, {
      userId: session.user.id,
      newState: segment,
    });

    return NextResponse.json(segment, { status: 201 });
  } catch (error) {
    console.error('Error creating network segment:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const segments = await networkIsolationSystem.getAllSegments();

    return NextResponse.json({
      segments,
      total: segments.length,
    });
  } catch (error) {
    console.error('Error fetching network segments:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
