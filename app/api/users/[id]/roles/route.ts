/**
 * User Access Management API
 * POST /api/users/:id/roles - Assign role to user
 * GET /api/users/:id/roles - Get user roles
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { permissionEngine } from '@/lib/permission';
import { auditLogSystem } from '@/lib/audit';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.roleId) {
      return NextResponse.json(
        { error: 'Missing required field: roleId' },
        { status: 400 }
      );
    }

    // Assign role to user
    await permissionEngine.assignRoleToUser(params.id, data.roleId);

    // Get updated user roles
    const roles = await permissionEngine.getUserRoles(params.id);

    // Log the action
    await auditLogSystem.logSuccess('ROLE_ASSIGNED_TO_USER', 'USER', params.id, {
      userId: session.user.id,
      details: {
        roleId: data.roleId,
      },
    });

    return NextResponse.json({ roles }, { status: 201 });
  } catch (error) {
    console.error('Error assigning role to user:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roles = await permissionEngine.getUserRoles(params.id);

    return NextResponse.json({
      roles,
      total: roles.length,
    });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
