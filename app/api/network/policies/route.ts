/**
 * Network Isolation API
 * POST /api/network/policies - Create isolation policy
 * GET /api/network/policies - List policies
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
    if (!data.sourceSegmentId || !data.destinationSegmentId || !data.action) {
      return NextResponse.json(
        { error: 'Missing required fields: sourceSegmentId, destinationSegmentId, action' },
        { status: 400 }
      );
    }

    // Create policy
    const policy = await networkIsolationSystem.createPolicy({
      sourceSegmentId: data.sourceSegmentId,
      destinationSegmentId: data.destinationSegmentId,
      action: data.action,
      conditions: data.conditions,
    });

    // Log the action
    await auditLogSystem.logSuccess('ISOLATION_POLICY_CREATED', 'ISOLATION_POLICY', policy.id, {
      userId: session.user.id,
      newState: policy,
    });

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    console.error('Error creating isolation policy:', error);
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

    const policies = await networkIsolationSystem.getAllPolicies();

    return NextResponse.json({
      policies,
      total: policies.length,
    });
  } catch (error) {
    console.error('Error fetching isolation policies:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
