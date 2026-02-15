/**
 * Role Management API
 * GET /api/roles/:id - Get role
 * PUT /api/roles/:id - Update role
 * DELETE /api/roles/:id - Delete role
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

    const role = await permissionEngine.getRole(params.id);

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
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

    // Get original role
    const originalRole = await permissionEngine.getRole(params.id);

    if (!originalRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Update role
    const updatedRole = await permissionEngine.updateRole(params.id, data);

    // Log the action
    await auditLogSystem.logSuccess('ROLE_UPDATED', 'ROLE', params.id, {
      userId: session.user.id,
      originalState: originalRole,
      newState: updatedRole,
    });

    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error('Error updating role:', error);
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

    // Get role before deletion
    const role = await permissionEngine.getRole(params.id);

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Delete role
    await permissionEngine.deleteRole(params.id);

    // Log the action
    await auditLogSystem.logSuccess('ROLE_DELETED', 'ROLE', params.id, {
      userId: session.user.id,
      originalState: role,
    });

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
