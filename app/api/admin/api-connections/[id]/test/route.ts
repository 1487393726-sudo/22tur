import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { testConnection } from '@/lib/api-management/connection-service';

// POST /api/admin/api-connections/[id]/test
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
    const result = await testConnection(id);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error testing connection:', error);
    return NextResponse.json({ error: 'Failed to test connection' }, { status: 500 });
  }
}
