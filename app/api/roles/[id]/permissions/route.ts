/**
 * Role Permissions API
 * POST /api/roles/:id/permissions - Assign permission to role
 * GET /api/roles/:id/permissions - Get role permissions
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
    if (!data.permissionId) {
      return NextResponse.json(
        { error: 'Missing required field: permissionId' },
        { status: 400 }
      );
    }

    // Assign permission to role
    await permissionEngine.assignPermissionToRole(params.id, data.permissionId);

    // Get updated role
    const role = await permissionEngine.getRole(params.id);

    // Log the action
    await auditLogSystem.logSuccess('PERMISSION_ASSIGNED_TO_ROLE', 'ROLE', params.id, {
      userId: session.user.id,
      details: {
        permissionId: data.permissionId,
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error('Error assigning permission to role:', error);
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

    const permissions = await permissionEngine.getRolePermissions(params.id);

    return NextResponse.json({
      permissions,
      total: permissions.length,
    });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
