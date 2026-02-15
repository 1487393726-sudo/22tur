import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { parseImportJson, importConfig } from '@/lib/api-management/config-service';

// POST /api/admin/api-config/import
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.config) {
      return NextResponse.json({ error: 'config is required' }, { status: 400 });
    }

    // Parse and validate the config
    const configJson = typeof body.config === 'string' ? body.config : JSON.stringify(body.config);
    const { config, errors: parseErrors } = parseImportJson(configJson);

    if (!config) {
      return NextResponse.json({
        error: 'Invalid configuration',
        errors: parseErrors,
      }, { status: 400 });
    }

    // Build credentials map from request
    const credentialsMap = new Map<string, Record<string, unknown>>();
    if (body.credentials && typeof body.credentials === 'object') {
      for (const [name, creds] of Object.entries(body.credentials)) {
        credentialsMap.set(name, creds as Record<string, unknown>);
      }
    }

    // Import the config
    const result = await importConfig(
      config,
      credentialsMap,
      session.user.email || 'unknown'
    );

    return NextResponse.json({
      imported: result.imported,
      skipped: result.skipped,
      errors: result.errors,
      message: `Imported ${result.imported} connections, skipped ${result.skipped}`,
    });
  } catch (error) {
    console.error('Error importing config:', error);
    return NextResponse.json({ error: 'Failed to import config' }, { status: 500 });
  }
}
