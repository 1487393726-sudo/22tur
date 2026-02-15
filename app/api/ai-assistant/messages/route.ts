/**
 * AI Assistant Messages API
 * Handles message storage and retrieval
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import {
  addMessage,
  getConversationHistory,
  updateConversationContext,
} from '@/lib/ai-assistant/conversation-manager';
import { getOpenAIProvider } from '@/lib/ai-assistant/openai-integration';
import { getEffectiveAIConfig } from '@/lib/ai-assistant/config-manager';
import { formatContextForLLM } from '@/lib/ai-assistant/data-extractor';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/ai-assistant/messages
 * Get message history for a conversation
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    const messages = await getConversationHistory(conversationId, limit);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('GET /api/ai-assistant/messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai-assistant/messages
 * Send a message and get AI response
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, message, projectId } = body;

    if (!conversationId || !message) {
      return NextResponse.json(
        { error: 'conversationId and message are required' },
        { status: 400 }
      );
    }

    // Get conversation
    const conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Add user message
    const userMessage = await addMessage(conversationId, 'user', message);

    // Update context if needed
    if (projectId) {
      await updateConversationContext(conversationId, projectId);
    }

    // Get AI config
    const aiConfig = await getEffectiveAIConfig(conversation.projectId);

    // Prepare context for LLM
    const contextString = conversation.context
      ? formatContextForLLM(JSON.parse(conversation.context))
      : '';

    // Get conversation history for context
    const history = conversation.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Build system prompt
    const systemPrompt =
      aiConfig.systemPrompt ||
      `You are an AI project management assistant. Help the user with project planning, task optimization, progress prediction, risk analysis, and resource allocation. 
      
      Project Context:
      ${contextString}
      
      Provide clear, actionable advice based on the project data.`;

    // Get LLM provider
    const llmProvider = getOpenAIProvider();

    // Send request to LLM
    const startTime = Date.now();
    const llmResponse = await llmProvider.sendRequest({
      prompt: message,
      systemPrompt,
      temperature: aiConfig.temperature,
      maxTokens: aiConfig.maxTokens,
      model: aiConfig.modelName,
    });
    const duration = Date.now() - startTime;

    // Add assistant message
    const assistantMessage = await addMessage(
      conversationId,
      'assistant',
      llmResponse.content,
      0.95, // Default confidence
      ['openai']
    );

    // Log API call
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user) {
      await prisma.aICallLog.create({
        data: {
          conversationId,
          projectId: conversation.projectId,
          userId: user.id,
          action: 'chat',
          inputTokens: llmResponse.tokens.input,
          outputTokens: llmResponse.tokens.output,
          totalTokens: llmResponse.tokens.total,
          duration,
          status: 'success',
        },
      });
    }

    return NextResponse.json(
      {
        userMessage,
        assistantMessage,
        tokens: llmResponse.tokens,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/ai-assistant/messages error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
