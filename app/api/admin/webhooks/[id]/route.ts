import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  getWebhookById,
  updateWebhook,
  deleteWebhook,
  regenerateSecret,
  getWebhookLogs,
} from '@/lib/api-management/webhook-service';

// GET /api/admin/webhooks/[id]
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
    const { searchParams } = new URL(request.url);
    const includeLogs = searchParams.get('includeLogs') === 'true';

    const webhook = await getWebhookById(id);

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    const response: Record<string, unknown> = { webhook };

    if (includeLogs) {
      response.logs = await getWebhookLogs(id);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching webhook:', error);
    return NextResponse.json({ error: 'Failed to fetch webhook' }, { status: 500 });
  }
}

// PUT /api/admin/webhooks/[id]
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

    // Check if regenerating secret
    if (body.regenerateSecret) {
      const secret = await regenerateSecret(id);
      return NextResponse.json({
        secret,
        message: 'Secret regenerated. Save this secret now. It will not be shown again.',
      });
    }

    const webhook = await updateWebhook(id, body);

    return NextResponse.json({ webhook });
  } catch (error) {
    console.error('Error updating webhook:', error);
    return NextResponse.json({ error: 'Failed to update webhook' }, { status: 500 });
  }
}

// DELETE /api/admin/webhooks/[id]
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
    await deleteWebhook(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 });
  }
}
