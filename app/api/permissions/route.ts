/**
 * Permission Management API
 * POST /api/permissions - Create permission
 * GET /api/permissions - List permissions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { permissionEngine } from '@/lib/permission';
import { auditLogSystem } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.resourceType || !data.action) {
      return NextResponse.json(
        { error: 'Missing required fields: name, resourceType, action' },
        { status: 400 }
      );
    }

    // Create permission
    const permission = await permissionEngine.createPermission({
      name: data.name,
      description: data.description,
      resourceType: data.resourceType,
      action: data.action,
    });

    // Log the action
    await auditLogSystem.logSuccess('PERMISSION_CREATED', 'PERMISSION', permission.id, {
      userId: session.user.id,
      newState: permission,
    });

    return NextResponse.json(permission, { status: 201 });
  } catch (error) {
    console.error('Error creating permission:', error);
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

    const searchParams = request.nextUrl.searchParams;
    const resourceType = searchParams.get('resourceType');

    let permissions;

    if (resourceType) {
      permissions = await permissionEngine.getPermissionsByResourceType(resourceType);
    } else {
      permissions = await permissionEngine.getAllPermissions();
    }

    return NextResponse.json({
      permissions,
      total: permissions.length,
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
