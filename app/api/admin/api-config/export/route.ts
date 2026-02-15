import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { exportConfigAsJson } from '@/lib/api-management/config-service';

// GET /api/admin/api-config/export
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionIds = searchParams.get('connectionIds');
    const download = searchParams.get('download') === 'true';

    const ids = connectionIds ? connectionIds.split(',') : undefined;
    const json = await exportConfigAsJson(ids);

    if (download) {
      return new NextResponse(json, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="api-config-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }

    return NextResponse.json(JSON.parse(json));
  } catch (error) {
    console.error('Error exporting config:', error);
    return NextResponse.json({ error: 'Failed to export config' }, { status: 500 });
  }
}
