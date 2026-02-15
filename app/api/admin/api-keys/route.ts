import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createKey, getKeysByConnection } from '@/lib/api-management/key-service';

// GET /api/admin/api-keys
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');

    if (!connectionId) {
      return NextResponse.json({ error: 'connectionId is required' }, { status: 400 });
    }

    const keys = await getKeysByConnection(connectionId);

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }
}

// POST /api/admin/api-keys
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.connectionId || !body.name) {
      return NextResponse.json(
        { error: 'connectionId and name are required' },
        { status: 400 }
      );
    }

    const result = await createKey({
      connectionId: body.connectionId,
      name: body.name,
      key: body.key,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });

    // Return the plain key only once
    return NextResponse.json({
      key: result.key,
      plainKey: result.plainKey,
      message: 'Save this key now. It will not be shown again.',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }
}
