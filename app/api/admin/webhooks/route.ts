import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createWebhook, getWebhooksByConnection } from '@/lib/api-management/webhook-service';

// GET /api/admin/webhooks
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

    const webhooks = await getWebhooksByConnection(connectionId);

    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 });
  }
}

// POST /api/admin/webhooks
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.connectionId || !body.name || !body.events) {
      return NextResponse.json(
        { error: 'connectionId, name, and events are required' },
        { status: 400 }
      );
    }

    const result = await createWebhook({
      connectionId: body.connectionId,
      name: body.name,
      events: body.events,
    });

    return NextResponse.json({
      webhook: result.webhook,
      secret: result.secret,
      message: 'Save this secret now. It will not be shown again.',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating webhook:', error);
    return NextResponse.json({ error: 'Failed to create webhook' }, { status: 500 });
  }
}
