/**
 * Conversation Manager
 * Manages AI conversations and message history
 * **Property 1: 对话上下文一致性**
 */

import { prisma } from '@/lib/prisma';
import { Conversation, ConversationMessage } from './types';
import { extractProjectContext, updateProjectContext } from './data-extractor';

/**
 * Create a new conversation
 * @param projectId - Project ID
 * @param userId - User ID
 * @param title - Conversation title
 * @returns Created conversation
 */
export async function createConversation(
  projectId: string,
  userId: string,
  title: string
): Promise<Conversation> {
  try {
    // Extract project context
    const context = await extractProjectContext(projectId);
    const contextString = JSON.stringify(context);

    const conversation = await prisma.aIConversation.create({
      data: {
        projectId,
        userId,
        title,
        context: contextString,
        isActive: true,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Update cached project context
    await updateProjectContext(projectId, context);

    return {
      id: conversation.id,
      projectId: conversation.projectId,
      userId: conversation.userId,
      title: conversation.title,
      messages: conversation.messages.map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.createdAt,
        confidence: msg.confidence || undefined,
        sources: msg.sources ? JSON.parse(msg.sources) : undefined,
      })),
      context: context,
      isActive: conversation.isActive,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  } catch (error) {
    throw new Error(`Failed to create conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get conversation by ID
 * @param conversationId - Conversation ID
 * @returns Conversation or null
 */
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  try {
    const conversation = await prisma.aIConversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        project: true,
      },
    });

    if (!conversation) {
      return null;
    }

    const context = conversation.context ? JSON.parse(conversation.context) : undefined;

    return {
      id: conversation.id,
      projectId: conversation.projectId,
      userId: conversation.userId,
      title: conversation.title,
      messages: conversation.messages.map((msg) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: msg.createdAt,
        confidence: msg.confidence || undefined,
        sources: msg.sources ? JSON.parse(msg.sources) : undefined,
      })),
      context,
      isActive: conversation.isActive,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  } catch (error) {
    console.error('Failed to get conversation:', error);
    return null;
  }
}

/**
 * Get all conversations for a project
 * @param projectId - Project ID
 * @param limit - Maximum number of conversations to return
 * @returns Array of conversations
 */
export async function getProjectConversations(
  projectId: string,
  limit: number = 50
): Promise<Conversation[]> {
  try {
    const conversations = await prisma.aIConversation.findMany({
      where: { projectId, isActive: true },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 5, // Get last 5 messages for preview
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    return conversations.map((conv) => {
      const context = conv.context ? JSON.parse(conv.context) : undefined;
      return {
        id: conv.id,
        projectId: conv.projectId,
        userId: conv.userId,
        title: conv.title,
        messages: conv.messages.map((msg) => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: msg.createdAt,
          confidence: msg.confidence || undefined,
          sources: msg.sources ? JSON.parse(msg.sources) : undefined,
        })),
        context,
        isActive: conv.isActive,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      };
    });
  } catch (error) {
    console.error('Failed to get project conversations:', error);
    return [];
  }
}

/**
 * Add message to conversation
 * @param conversationId - Conversation ID
 * @param role - Message role (user or assistant)
 * @param content - Message content
 * @param confidence - Confidence score (for assistant messages)
 * @param sources - Information sources (for assistant messages)
 * @returns Created message
 */
export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  confidence?: number,
  sources?: string[]
): Promise<ConversationMessage> {
  try {
    const message = await prisma.aIMessage.create({
      data: {
        conversationId,
        role,
        content,
        confidence: confidence || null,
        sources: sources ? JSON.stringify(sources) : null,
      },
    });

    // Update conversation timestamp
    await prisma.aIConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return {
      id: message.id,
      role: message.role as 'user' | 'assistant',
      content: message.content,
      timestamp: message.createdAt,
      confidence: message.confidence || undefined,
      sources: message.sources ? JSON.parse(message.sources) : undefined,
    };
  } catch (error) {
    throw new Error(`Failed to add message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get conversation history
 * @param conversationId - Conversation ID
 * @param limit - Maximum number of messages to return
 * @returns Array of messages
 */
export async function getConversationHistory(
  conversationId: string,
  limit: number = 50
): Promise<ConversationMessage[]> {
  try {
    const messages = await prisma.aIMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return messages.map((msg) => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: msg.createdAt,
      confidence: msg.confidence || undefined,
      sources: msg.sources ? JSON.parse(msg.sources) : undefined,
    }));
  } catch (error) {
    console.error('Failed to get conversation history:', error);
    return [];
  }
}

/**
 * Update conversation context
 * @param conversationId - Conversation ID
 * @param projectId - Project ID
 */
export async function updateConversationContext(
  conversationId: string,
  projectId: string
): Promise<void> {
  try {
    const context = await extractProjectContext(projectId);
    const contextString = JSON.stringify(context);

    await prisma.aIConversation.update({
      where: { id: conversationId },
      data: {
        context: contextString,
        updatedAt: new Date(),
      },
    });

    // Update cached project context
    await updateProjectContext(projectId, context);
  } catch (error) {
    console.error('Failed to update conversation context:', error);
  }
}

/**
 * Clear conversation history
 * @param conversationId - Conversation ID
 */
export async function clearConversationHistory(conversationId: string): Promise<void> {
  try {
    await prisma.aIMessage.deleteMany({
      where: { conversationId },
    });

    await prisma.aIConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });
  } catch (error) {
    throw new Error(`Failed to clear conversation history: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Archive conversation
 * @param conversationId - Conversation ID
 */
export async function archiveConversation(conversationId: string): Promise<void> {
  try {
    await prisma.aIConversation.update({
      where: { id: conversationId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    throw new Error(`Failed to archive conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete conversation
 * @param conversationId - Conversation ID
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  try {
    // Delete all messages first
    await prisma.aIMessage.deleteMany({
      where: { conversationId },
    });

    // Delete conversation
    await prisma.aIConversation.delete({
      where: { id: conversationId },
    });
  } catch (error) {
    throw new Error(`Failed to delete conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Format conversation for LLM context
 * @param conversation - Conversation to format
 * @returns Formatted conversation string
 */
export function formatConversationForLLM(conversation: Conversation): Array<{ role: string; content: string }> {
  return conversation.messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}
