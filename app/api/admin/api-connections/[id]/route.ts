import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  getConnectionById,
  updateConnection,
  deleteConnection,
} from '@/lib/api-management/connection-service';

// GET /api/admin/api-connections/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const connection = await getConnectionById(id);

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    return NextResponse.json({ connection });
  } catch (error) {
    console.error('Error fetching connection:', error);
    return NextResponse.json({ error: 'Failed to fetch connection' }, { status: 500 });
  }
}

// PUT /api/admin/api-connections/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const connection = await updateConnection(id, body);

    return NextResponse.json({ connection });
  } catch (error) {
    console.error('Error updating connection:', error);
    return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 });
  }
}


// DELETE /api/admin/api-connections/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await deleteConnection(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting connection:', error);
    return NextResponse.json({ error: 'Failed to delete connection' }, { status: 500 });
  }
}
