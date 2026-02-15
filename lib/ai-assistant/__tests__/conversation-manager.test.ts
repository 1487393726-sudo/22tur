/**
 * Unit Tests for Conversation Manager
 * **Feature: ai-project-assistant, Property 1: 对话上下文一致性**
 * **Validates: Requirements 1.3**
 * 
 * Tests conversation management and context consistency
 */

import {
  createConversation,
  getConversation,
  getProjectConversations,
  addMessage,
  getConversationHistory,
  updateConversationContext,
  clearConversationHistory,
  archiveConversation,
  deleteConversation,
} from '../conversation-manager';
import { Conversation, ConversationMessage, ProjectContext } from '../types';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    aIConversation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    aIMessage: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

// Mock data extractor
jest.mock('../data-extractor', () => ({
  extractProjectContext: jest.fn(),
  updateProjectContext: jest.fn(),
}));

import { prisma } from '@/lib/prisma';
import { extractProjectContext, updateProjectContext } from '../data-extractor';

const mockProjectContext: ProjectContext = {
  projectId: 'project-1',
  projectName: 'Test Project',
  status: 'IN_PROGRESS',
  teamSize: 5,
  tasks: [],
  team: [],
};

describe('Conversation Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (extractProjectContext as jest.Mock).mockResolvedValue(mockProjectContext);
    (updateProjectContext as jest.Mock).mockResolvedValue(undefined);
  });

  describe('createConversation', () => {
    it('should create a new conversation with project context', async () => {
      const mockConversation = {
        id: 'conv-1',
        projectId: 'project-1',
        userId: 'user-1',
        title: 'Test Conversation',
        context: JSON.stringify(mockProjectContext),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };

      (prisma.aIConversation.create as jest.Mock).mockResolvedValue(mockConversation);

      const conversation = await createConversation('project-1', 'user-1', 'Test Conversation');

      expect(conversation.id).toBe('conv-1');
      expect(conversation.projectId).toBe('project-1');
      expect(conversation.userId).toBe('user-1');
      expect(conversation.title).toBe('Test Conversation');
      expect(conversation.context).toEqual(mockProjectContext);
      expect(conversation.isActive).toBe(true);
    });

    it('should extract and cache project context on creation', async () => {
      const mockConversation = {
        id: 'conv-1',
        projectId: 'project-1',
        userId: 'user-1',
        title: 'Test Conversation',
        context: JSON.stringify(mockProjectContext),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };

      (prisma.aIConversation.create as jest.Mock).mockResolvedValue(mockConversation);

      await createConversation('project-1', 'user-1', 'Test Conversation');

      expect(extractProjectContext).toHaveBeenCalledWith('project-1');
      expect(updateProjectContext).toHaveBeenCalledWith('project-1', mockProjectContext);
    });

    it('should throw error on creation failure', async () => {
      (prisma.aIConversation.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(createConversation('project-1', 'user-1', 'Test')).rejects.toThrow('Failed to create conversation');
    });

    it('should initialize with empty messages', async () => {
      const mockConversation = {
        id: 'conv-1',
        projectId: 'project-1',
        userId: 'user-1',
        title: 'Test Conversation',
        context: JSON.stringify(mockProjectContext),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };

      (prisma.aIConversation.create as jest.Mock).mockResolvedValue(mockConversation);

      const conversation = await createConversation('project-1', 'user-1', 'Test');

      expect(conversation.messages).toEqual([]);
    });
  });

  describe('getConversation', () => {
    it('should retrieve conversation by ID', async () => {
      const mockConversation = {
        id: 'conv-1',
        projectId: 'project-1',
        userId: 'user-1',
        title: 'Test Conversation',
        context: JSON.stringify(mockProjectContext),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
        project: { id: 'project-1', name: 'Test Project' },
      };

      (prisma.aIConversation.findUnique as jest.Mock).mockResolvedValue(mockConversation);

      const conversation = await getConversation('conv-1');

      expect(conversation?.id).toBe('conv-1');
      expect(conversation?.context).toEqual(mockProjectContext);
    });

    it('should return null when conversation not found', async () => {
      (prisma.aIConversation.findUnique as jest.Mock).mockResolvedValue(null);

      const conversation = await getConversation('nonexistent');

      expect(conversation).toBeNull();
    });

    it('should handle missing context gracefully', async () => {
      const mockConversation = {
        id: 'conv-1',
        projectId: 'project-1',
        userId: 'user-1',
        title: 'Test Conversation',
        context: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
        project: { id: 'project-1', name: 'Test Project' },
      };

      (prisma.aIConversation.findUnique as jest.Mock).mockResolvedValue(mockConversation);

      const conversation = await getConversation('conv-1');

      expect(conversation?.context).toBeUndefined();
    });

    it('should handle database errors gracefully', async () => {
      (prisma.aIConversation.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const conversation = await getConversation('conv-1');

      expect(conversation).toBeNull();
    });
  });

  describe('getProjectConversations', () => {
    it('should retrieve all active conversations for a project', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          projectId: 'project-1',
          userId: 'user-1',
          title: 'Conversation 1',
          context: JSON.stringify(mockProjectContext),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [],
        },
        {
          id: 'conv-2',
          projectId: 'project-1',
          userId: 'user-2',
          title: 'Conversation 2',
          context: JSON.stringify(mockProjectContext),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [],
        },
      ];

      (prisma.aIConversation.findMany as jest.Mock).mockResolvedValue(mockConversations);

      const conversations = await getProjectConversations('project-1');

      expect(conversations).toHaveLength(2);
      expect(conversations[0].id).toBe('conv-1');
      expect(conversations[1].id).toBe('conv-2');
    });

    it('should respect limit parameter', async () => {
      (prisma.aIConversation.findMany as jest.Mock).mockResolvedValue([]);

      await getProjectConversations('project-1', 10);

      expect(prisma.aIConversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });

    it('should only return active conversations', async () => {
      (prisma.aIConversation.findMany as jest.Mock).mockResolvedValue([]);

      await getProjectConversations('project-1');

      expect(prisma.aIConversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });

    it('should return empty array on error', async () => {
      (prisma.aIConversation.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const conversations = await getProjectConversations('project-1');

      expect(conversations).toEqual([]);
    });
  });

  describe('addMessage', () => {
    it('should add user message to conversation', async () => {
      const mockMessage = {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Hello AI',
        confidence: null,
        sources: null,
        createdAt: new Date(),
      };

      (prisma.aIMessage.create as jest.Mock).mockResolvedValue(mockMessage);
      (prisma.aIConversation.update as jest.Mock).mockResolvedValue({});

      const message = await addMessage('conv-1', 'user', 'Hello AI');

      expect(message.id).toBe('msg-1');
      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello AI');
    });

    it('should add assistant message with confidence and sources', async () => {
      const mockMessage = {
        id: 'msg-2',
        conversationId: 'conv-1',
        role: 'assistant',
        content: 'Hello user',
        confidence: 0.95,
        sources: JSON.stringify(['source1', 'source2']),
        createdAt: new Date(),
      };

      (prisma.aIMessage.create as jest.Mock).mockResolvedValue(mockMessage);
      (prisma.aIConversation.update as jest.Mock).mockResolvedValue({});

      const message = await addMessage('conv-1', 'assistant', 'Hello user', 0.95, ['source1', 'source2']);

      expect(message.role).toBe('assistant');
      expect(message.confidence).toBe(0.95);
      expect(message.sources).toEqual(['source1', 'source2']);
    });

    it('should update conversation timestamp when adding message', async () => {
      const mockMessage = {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'Hello',
        confidence: null,
        sources: null,
        createdAt: new Date(),
      };

      (prisma.aIMessage.create as jest.Mock).mockResolvedValue(mockMessage);
      (prisma.aIConversation.update as jest.Mock).mockResolvedValue({});

      await addMessage('conv-1', 'user', 'Hello');

      expect(prisma.aIConversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'conv-1' },
          data: expect.objectContaining({
            updatedAt: expect.any(Date),
          }),
        })
      );
    });

    it('should throw error on failure', async () => {
      (prisma.aIMessage.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(addMessage('conv-1', 'user', 'Hello')).rejects.toThrow('Failed to add message');
    });
  });

  describe('getConversationHistory', () => {
    it('should retrieve conversation message history', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          role: 'user',
          content: 'Hello',
          confidence: null,
          sources: null,
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'msg-2',
          conversationId: 'conv-1',
          role: 'assistant',
          content: 'Hi there',
          confidence: 0.9,
          sources: JSON.stringify(['source1']),
          createdAt: new Date('2024-01-02'),
        },
      ];

      (prisma.aIMessage.findMany as jest.Mock).mockResolvedValue(mockMessages);

      const history = await getConversationHistory('conv-1');

      expect(history).toHaveLength(2);
      expect(history[0].content).toBe('Hello');
      expect(history[1].content).toBe('Hi there');
    });

    it('should order messages by creation date ascending', async () => {
      (prisma.aIMessage.findMany as jest.Mock).mockResolvedValue([]);

      await getConversationHistory('conv-1');

      expect(prisma.aIMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'asc' },
        })
      );
    });

    it('should respect limit parameter', async () => {
      (prisma.aIMessage.findMany as jest.Mock).mockResolvedValue([]);

      await getConversationHistory('conv-1', 20);

      expect(prisma.aIMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
        })
      );
    });

    it('should return empty array on error', async () => {
      (prisma.aIMessage.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const history = await getConversationHistory('conv-1');

      expect(history).toEqual([]);
    });
  });

  describe('updateConversationContext', () => {
    it('should update conversation context with latest project data', async () => {
      (prisma.aIConversation.update as jest.Mock).mockResolvedValue({});

      await updateConversationContext('conv-1', 'project-1');

      expect(extractProjectContext).toHaveBeenCalledWith('project-1');
      expect(prisma.aIConversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'conv-1' },
          data: expect.objectContaining({
            context: JSON.stringify(mockProjectContext),
          }),
        })
      );
    });

    it('should update cached project context', async () => {
      (prisma.aIConversation.update as jest.Mock).mockResolvedValue({});

      await updateConversationContext('conv-1', 'project-1');

      expect(updateProjectContext).toHaveBeenCalledWith('project-1', mockProjectContext);
    });

    it('should update conversation timestamp', async () => {
      (prisma.aIConversation.update as jest.Mock).mockResolvedValue({});

      await updateConversationContext('conv-1', 'project-1');

      expect(prisma.aIConversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            updatedAt: expect.any(Date),
          }),
        })
      );
    });

    it('should handle errors gracefully', async () => {
      (extractProjectContext as jest.Mock).mockRejectedValue(new Error('Extraction error'));

      // Should not throw
      await updateConversationContext('conv-1', 'project-1');
    });
  });

  describe('clearConversationHistory', () => {
    it('should delete all messages in conversation', async () => {
      (prisma.aIMessage.deleteMany as jest.Mock).mockResolvedValue({});
      (prisma.aIConversation.update as jest.Mock).mockResolvedValue({});

      await clearConversationHistory('conv-1');

      expect(prisma.aIMessage.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { conversationId: 'conv-1' },
        })
      );
    });

    it('should update conversation timestamp', async () => {
      (prisma.aIMessage.deleteMany as jest.Mock).mockResolvedValue({});
      (prisma.aIConversation.update as jest.Mock).mockResolvedValue({});

      await clearConversationHistory('conv-1');

      expect(prisma.aIConversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            updatedAt: expect.any(Date),
          }),
        })
      );
    });

    it('should throw error on failure', async () => {
      (prisma.aIMessage.deleteMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(clearConversationHistory('conv-1')).rejects.toThrow('Failed to clear conversation history');
    });
  });

  describe('archiveConversation', () => {
    it('should mark conversation as inactive', async () => {
      (prisma.aIConversation.update as jest.Mock).mockResolvedValue({});

      await archiveConversation('conv-1');

      expect(prisma.aIConversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'conv-1' },
          data: expect.objectContaining({
            isActive: false,
          }),
        })
      );
    });

    it('should update conversation timestamp', async () => {
      (prisma.aIConversation.update as jest.Mock).mockResolvedValue({});

      await archiveConversation('conv-1');

      expect(prisma.aIConversation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            updatedAt: expect.any(Date),
          }),
        })
      );
    });
  });

  describe('deleteConversation', () => {
    it('should delete conversation and its messages', async () => {
      (prisma.aIMessage.deleteMany as jest.Mock).mockResolvedValue({});
      (prisma.aIConversation.delete as jest.Mock).mockResolvedValue({});

      await deleteConversation('conv-1');

      expect(prisma.aIMessage.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { conversationId: 'conv-1' },
        })
      );
      expect(prisma.aIConversation.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'conv-1' },
        })
      );
    });
  });
});

describe('Property 1: Conversation Context Consistency', () => {
  /**
   * Property 1: 对话上下文一致性
   * For any conversation, when a user sends a message, the AI's response should be based on
   * complete conversation history and current project context, ensuring relevance and accuracy.
   * **Validates: Requirements 1.3**
   */

  beforeEach(() => {
    jest.clearAllMocks();
    (extractProjectContext as jest.Mock).mockResolvedValue(mockProjectContext);
    (updateProjectContext as jest.Mock).mockResolvedValue(undefined);
  });

  it('should maintain context consistency across conversation lifecycle', async () => {
    // Create conversation
    const mockConversation = {
      id: 'conv-1',
      projectId: 'project-1',
      userId: 'user-1',
      title: 'Test',
      context: JSON.stringify(mockProjectContext),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
    };

    (prisma.aIConversation.create as jest.Mock).mockResolvedValue(mockConversation);

    const conversation = await createConversation('project-1', 'user-1', 'Test');

    // Verify context is set
    expect(conversation.context).toEqual(mockProjectContext);
    expect(extractProjectContext).toHaveBeenCalledWith('project-1');
  });

  it('should preserve message history for context', async () => {
    const mockMessages = [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        role: 'user',
        content: 'What is the project status?',
        confidence: null,
        sources: null,
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        role: 'assistant',
        content: 'The project is in progress',
        confidence: 0.95,
        sources: JSON.stringify(['project_data']),
        createdAt: new Date('2024-01-02'),
      },
    ];

    (prisma.aIMessage.findMany as jest.Mock).mockResolvedValue(mockMessages);

    const history = await getConversationHistory('conv-1');

    // Verify all messages are preserved in order
    expect(history).toHaveLength(2);
    expect(history[0].content).toBe('What is the project status?');
    expect(history[1].content).toBe('The project is in progress');
  });

  it('should update context when project data changes', async () => {
    const updatedContext: ProjectContext = {
      ...mockProjectContext,
      projectName: 'Updated Project',
      teamSize: 10,
    };

    (extractProjectContext as jest.Mock).mockResolvedValue(updatedContext);
    (prisma.aIConversation.update as jest.Mock).mockResolvedValue({});

    await updateConversationContext('conv-1', 'project-1');

    // Verify context was updated
    expect(prisma.aIConversation.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          context: JSON.stringify(updatedContext),
        }),
      })
    );
  });

  it('should ensure context consistency across multiple messages', async () => {
    const mockMessage1 = {
      id: 'msg-1',
      conversationId: 'conv-1',
      role: 'user',
      content: 'First message',
      confidence: null,
      sources: null,
      createdAt: new Date(),
    };

    const mockMessage2 = {
      id: 'msg-2',
      conversationId: 'conv-1',
      role: 'assistant',
      content: 'First response',
      confidence: 0.9,
      sources: null,
      createdAt: new Date(),
    };

    (prisma.aIMessage.create as jest.Mock)
      .mockResolvedValueOnce(mockMessage1)
      .mockResolvedValueOnce(mockMessage2);
    (prisma.aIConversation.update as jest.Mock).mockResolvedValue({});

    // Add multiple messages
    await addMessage('conv-1', 'user', 'First message');
    await addMessage('conv-1', 'assistant', 'First response', 0.9);

    // Verify conversation was updated for each message
    expect(prisma.aIConversation.update).toHaveBeenCalledTimes(2);
  });

  it('should maintain context isolation between conversations', async () => {
    const conv1Context = { ...mockProjectContext, projectId: 'project-1' };
    const conv2Context = { ...mockProjectContext, projectId: 'project-2' };

    (extractProjectContext as jest.Mock)
      .mockResolvedValueOnce(conv1Context)
      .mockResolvedValueOnce(conv2Context);

    (prisma.aIConversation.create as jest.Mock)
      .mockResolvedValueOnce({
        id: 'conv-1',
        projectId: 'project-1',
        userId: 'user-1',
        title: 'Conv 1',
        context: JSON.stringify(conv1Context),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      })
      .mockResolvedValueOnce({
        id: 'conv-2',
        projectId: 'project-2',
        userId: 'user-1',
        title: 'Conv 2',
        context: JSON.stringify(conv2Context),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      });

    const conv1 = await createConversation('project-1', 'user-1', 'Conv 1');
    const conv2 = await createConversation('project-2', 'user-1', 'Conv 2');

    // Verify contexts are different
    expect(conv1.context?.projectId).toBe('project-1');
    expect(conv2.context?.projectId).toBe('project-2');
  });
});
