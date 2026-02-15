/**
 * User Access Management API
 * DELETE /api/users/:id/roles/:roleId - Remove role from user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { permissionEngine } from '@/lib/permission';
import { auditLogSystem } from '@/lib/audit';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; roleId: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove role from user
    await permissionEngine.removeRoleFromUser(params.id, params.roleId);

    // Log the action
    await auditLogSystem.logSuccess('ROLE_REMOVED_FROM_USER', 'USER', params.id, {
      userId: session.user.id,
      details: {
        roleId: params.roleId,
      },
    });

    return NextResponse.json({ message: 'Role removed successfully' });
  } catch (error) {
    console.error('Error removing role from user:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
