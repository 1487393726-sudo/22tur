/**
 * Permission Delegation API
 * DELETE /api/delegations/:id - Revoke delegation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { delegationManager } from '@/lib/delegation';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Revoke delegation
    await delegationManager.revokeDelegation(params.id);

    return NextResponse.json({ message: 'Delegation revoked successfully' });
  } catch (error) {
    console.error('Error revoking delegation:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
