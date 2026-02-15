import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { rotateKey } from '@/lib/api-management/key-service';

// POST /api/admin/api-keys/[id]/rotate
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const result = await rotateKey(id);

    return NextResponse.json({
      key: result.key,
      plainKey: result.plainKey,
      message: 'Key rotated successfully. Save the new key now. It will not be shown again.',
    });
  } catch (error) {
    console.error('Error rotating API key:', error);
    const message = error instanceof Error ? error.message : 'Failed to rotate API key';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
