import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getTemplates, getTemplatesByCategory, getCategories } from '@/lib/api-management/template-service';
import type { ConnectionType } from '@/types/api-management';

// GET /api/admin/api-templates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ConnectionType | null;
    const category = searchParams.get('category');
    const categoriesOnly = searchParams.get('categoriesOnly') === 'true';

    if (categoriesOnly) {
      const categories = await getCategories();
      return NextResponse.json({ categories });
    }

    let templates;

    if (category) {
      templates = await getTemplatesByCategory(category);
    } else {
      templates = await getTemplates(type || undefined);
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}
