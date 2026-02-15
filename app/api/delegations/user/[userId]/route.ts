/**
 * Permission Delegation API
 * GET /api/delegations/user/:userId - Get delegations for user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { delegationManager } from '@/lib/delegation';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const delegations = await delegationManager.getUserDelegations(params.userId);

    return NextResponse.json({
      delegations,
      total: delegations.length,
    });
  } catch (error) {
    console.error('Error fetching user delegations:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
