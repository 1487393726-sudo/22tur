'use client';

/**
 * Conversation Sidebar Component
 * Displays conversation history and allows switching between conversations
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Trash2, Archive } from 'lucide-react';
import { Conversation } from '@/lib/ai-assistant/types';
import { format } from 'date-fns';

interface ConversationSidebarProps {
  projectId: string;
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation?: (conversationId: string) => void;
  onArchiveConversation?: (conversationId: string) => void;
}

export function ConversationSidebar({
  projectId,
  selectedConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onArchiveConversation,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, [projectId]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/ai-assistant/conversations?projectId=${projectId}`
      );
      if (!response.ok) throw new Error('Failed to load conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (conversationId: string) => {
    try {
      const response = await fetch('/api/ai-assistant/conversations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          action: 'delete',
        }),
      });

      if (!response.ok) throw new Error('Failed to delete conversation');

      setConversations((prev) =>
        prev.filter((c) => c.id !== conversationId)
      );

      if (onDeleteConversation) {
        onDeleteConversation(conversationId);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleArchive = async (conversationId: string) => {
    try {
      const response = await fetch('/api/ai-assistant/conversations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          action: 'archive',
        }),
      });

      if (!response.ok) throw new Error('Failed to archive conversation');

      setConversations((prev) =>
        prev.filter((c) => c.id !== conversationId)
      );

      if (onArchiveConversation) {
        onArchiveConversation(conversationId);
      }
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <Button
          onClick={onCreateConversation}
          className="w-full"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Conversation
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <Input
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Loading conversations...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No conversations found
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversationId === conversation.id
                    ? 'bg-blue-100 border border-blue-300'
                    : 'hover:bg-gray-100 border border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="flex-1 min-w-0"
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    <h3 className="font-medium text-sm truncate">
                      {conversation.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(conversation.updatedAt, 'MMM d, HH:mm')}
                    </p>
                    {conversation.messages.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {conversation.messages[conversation.messages.length - 1]?.content}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleArchive(conversation.id)}
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(conversation.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
