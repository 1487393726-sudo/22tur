'use client';

/**
 * Message Display Component
 * Displays individual messages with formatting and metadata
 */

import React from 'react';
import { ConversationMessage } from '@/lib/ai-assistant/types';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface MessageDisplayProps {
  message: ConversationMessage;
  isCurrentUser?: boolean;
}

export function MessageDisplay({
  message,
  isCurrentUser = false,
}: MessageDisplayProps) {
  return (
    <div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-md px-4 py-3 rounded-lg ${
          isCurrentUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {/* Message Content */}
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>

        {/* Message Metadata */}
        <div className="mt-2 flex items-center justify-between gap-2 text-xs">
          <span className="opacity-70">
            {format(message.timestamp, 'HH:mm')}
          </span>

          {/* Confidence Badge */}
          {message.confidence && !isCurrentUser && (
            <Badge variant="secondary" className="text-xs">
              {(message.confidence * 100).toFixed(0)}% confident
            </Badge>
          )}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && !isCurrentUser && (
          <div className="mt-2 pt-2 border-t border-gray-300 border-opacity-30">
            <p className="text-xs font-semibold mb-1">Sources:</p>
            <div className="flex flex-wrap gap-1">
              {message.sources.map((source, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {source}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
