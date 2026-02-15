/**
 * Permission Management API
 * GET /api/permissions/:id - Get permission
 * PUT /api/permissions/:id - Update permission
 * DELETE /api/permissions/:id - Delete permission
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { permissionEngine } from '@/lib/permission';
import { auditLogSystem } from '@/lib/audit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permission = await permissionEngine.getPermission(params.id);

    if (!permission) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
    }

    return NextResponse.json(permission);
  } catch (error) {
    console.error('Error fetching permission:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Get original permission
    const originalPermission = await permissionEngine.getPermission(params.id);

    if (!originalPermission) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
    }

    // Update permission
    const updatedPermission = await permissionEngine.updatePermission(params.id, data);

    // Log the action
    await auditLogSystem.logSuccess('PERMISSION_UPDATED', 'PERMISSION', params.id, {
      userId: session.user.id,
      originalState: originalPermission,
      newState: updatedPermission,
    });

    return NextResponse.json(updatedPermission);
  } catch (error) {
    console.error('Error updating permission:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get permission before deletion
    const permission = await permissionEngine.getPermission(params.id);

    if (!permission) {
      return NextResponse.json({ error: 'Permission not found' }, { status: 404 });
    }

    // Delete permission
    await permissionEngine.deletePermission(params.id);

    // Log the action
    await auditLogSystem.logSuccess('PERMISSION_DELETED', 'PERMISSION', params.id, {
      userId: session.user.id,
      originalState: permission,
    });

    return NextResponse.json({ message: 'Permission deleted successfully' });
  } catch (error) {
    console.error('Error deleting permission:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
