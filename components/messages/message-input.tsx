'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile, Loader2, X } from 'lucide-react';
import { FileAttachment, type AttachmentFile } from './file-attachment';

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: AttachmentFile[]) => void | Promise<void>;
  onSelectEmoji?: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
}

export function MessageInput({
  onSendMessage,
  onSelectEmoji,
  placeholder = '输入消息...',
  disabled = false,
  maxLength = 2000,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    if ((!trimmedMessage && attachments.length === 0) || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSendMessage(trimmedMessage, attachments.length > 0 ? attachments : undefined);
      setMessage('');
      setAttachments([]);
      // 重置文本框高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFilesSelected = (files: AttachmentFile[]) => {
    setAttachments([...attachments, ...files]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(f => f.id !== id));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送，Shift+Enter 换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
      
      // 自动调整高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
      }
    }
  };

  const remainingChars = maxLength - message.length;
  const showCharCount = message.length > maxLength * 0.8;

  return (
    <div className="p-4 border-t border-white/10">
      {/* 附件预览 */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg text-sm"
            >
              <Paperclip className="w-4 h-4 text-white/60" />
              <span className="text-white/80 truncate max-w-[150px]">{file.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(file.id)}
                className="text-white/60 hover:text-white"
                aria-label={`移除附件 ${file.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* 附件按钮 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowFileDialog(true)}
          disabled={disabled || isSending}
          className="text-white/60 hover:text-white hover:bg-white/10 flex-shrink-0"
          title="添加附件"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* 表情按钮 */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onSelectEmoji}
          disabled={disabled || isSending}
          className="text-white/60 hover:text-white hover:bg-white/10 flex-shrink-0"
          title="选择表情"
        >
          <Smile className="w-5 h-5" />
        </Button>

        {/* 输入框 */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder={placeholder}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
            className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500 resize-none min-h-[44px] max-h-[120px] pr-16"
            rows={1}
          />
          {showCharCount && (
            <div className="absolute bottom-2 right-2 text-xs text-white/40">
              {remainingChars}
            </div>
          )}
        </div>

        {/* 发送按钮 */}
        <Button
          onClick={handleSend}
          disabled={(!message.trim() && attachments.length === 0) || disabled || isSending}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex-shrink-0"
          title="发送消息 (Enter)"
        >
          {isSending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* 提示文本 */}
      <div className="mt-2 text-xs text-white/40">
        按 Enter 发送，Shift + Enter 换行
        {attachments.length > 0 && ` · 已选择 ${attachments.length} 个附件`}
      </div>

      {/* 文件选择对话框 */}
      <FileAttachment
        open={showFileDialog}
        onOpenChange={setShowFileDialog}
        onFilesSelected={handleFilesSelected}
      />
    </div>
  );
}
