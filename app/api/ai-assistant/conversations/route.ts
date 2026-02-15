/**
 * AI Assistant Conversations API
 * Handles conversation CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  createConversation,
  getProjectConversations,
  getConversation,
  archiveConversation,
  deleteConversation,
} from '@/lib/ai-assistant/conversation-manager';

/**
 * GET /api/ai-assistant/conversations
 * Get conversations for a project
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Get specific conversation
      const conversation = await getConversation(conversationId);
      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      return NextResponse.json(conversation);
    }

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    // Get all conversations for project
    const conversations = await getProjectConversations(projectId);
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('GET /api/ai-assistant/conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai-assistant/conversations
 * Create a new conversation
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, title } = body;

    if (!projectId || !title) {
      return NextResponse.json(
        { error: 'projectId and title are required' },
        { status: 400 }
      );
    }

    // Get user ID from session
    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const conversation = await createConversation(projectId, user.id, title);
    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error('POST /api/ai-assistant/conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/ai-assistant/conversations
 * Update conversation (archive/delete)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, action } = body;

    if (!conversationId || !action) {
      return NextResponse.json(
        { error: 'conversationId and action are required' },
        { status: 400 }
      );
    }

    if (action === 'archive') {
      await archiveConversation(conversationId);
      return NextResponse.json({ success: true });
    } else if (action === 'delete') {
      await deleteConversation(conversationId);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('PUT /api/ai-assistant/conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    );
  }
}
