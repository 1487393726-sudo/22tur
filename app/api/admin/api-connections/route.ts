import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  getConnections,
  createConnection,
  filterConnections,
  searchConnections,
  validateConnectionInput,
} from '@/lib/api-management/connection-service';
import type { FilterCriteria, ApiConnectionInput } from '@/types/api-management';

// GET /api/admin/api-connections
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const provider = searchParams.get('provider');
    const search = searchParams.get('search');

    let connections;

    if (search) {
      connections = await searchConnections(search);
    } else if (type || status || provider) {
      const criteria: FilterCriteria = {};
      if (type) criteria.type = type as FilterCriteria['type'];
      if (status) criteria.status = status as FilterCriteria['status'];
      if (provider) criteria.provider = provider;
      connections = await filterConnections(criteria);
    } else {
      connections = await getConnections();
    }

    return NextResponse.json({ connections });
  } catch (error) {
    console.error('Error fetching connections:', error);
    return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
  }
}


// POST /api/admin/api-connections
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const input: ApiConnectionInput = {
      name: body.name,
      type: body.type,
      provider: body.provider,
      environment: body.environment,
      baseUrl: body.baseUrl,
      config: body.config,
      isDefault: body.isDefault,
    };

    // Validate input
    const errors = validateConnectionInput(input);
    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 400 });
    }

    const connection = await createConnection(input, session.user.email || 'unknown');

    return NextResponse.json({ connection }, { status: 201 });
  } catch (error) {
    console.error('Error creating connection:', error);
    return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 });
  }
}
