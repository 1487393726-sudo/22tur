/**
 * Permission Delegation API
 * POST /api/delegations - Create delegation
 * GET /api/delegations - List delegations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { delegationManager } from '@/lib/delegation';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.delegateeId || !data.roleId || !data.expiresIn) {
      return NextResponse.json(
        { error: 'Missing required fields: delegateeId, roleId, expiresIn' },
        { status: 400 }
      );
    }

    // Create delegation
    const delegation = await delegationManager.createDelegation({
      delegatorId: session.user.id,
      delegateeId: data.delegateeId,
      roleId: data.roleId,
      expiresIn: data.expiresIn,
    });

    return NextResponse.json(delegation, { status: 201 });
  } catch (error) {
    console.error('Error creating delegation:', error);
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

    const delegations = await delegationManager.getUserDelegations(session.user.id);

    return NextResponse.json({
      delegations,
      total: delegations.length,
    });
  } catch (error) {
    console.error('Error fetching delegations:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
