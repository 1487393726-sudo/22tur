import { NextRequest, NextResponse } from 'next/server';
import { getWebhookByUrl, processPayload } from '@/lib/api-management/webhook-service';

// POST /api/webhooks/[id] - Public endpoint for receiving webhooks
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const webhookUrl = `/api/webhooks/${id}`;

    // Find webhook by URL
    const webhook = await getWebhookByUrl(webhookUrl);

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    // Get signature from headers
    const signature = request.headers.get('x-webhook-signature') ||
                      request.headers.get('x-signature') ||
                      request.headers.get('x-hub-signature-256') || '';

    // Parse body
    const body = await request.json();

    // Get source IP
    const sourceIp = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    // Process the webhook payload
    const log = await processPayload(webhook.id, {
      eventType: body.type || body.event || 'unknown',
      timestamp: body.timestamp || Date.now(),
      data: body.data || body,
      signature,
    }, sourceIp);

    if (log.status === 'INVALID_SIGNATURE') {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    if (log.status === 'FAILED') {
      return NextResponse.json({ error: log.errorMessage }, { status: 400 });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
