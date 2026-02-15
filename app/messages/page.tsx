'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  MoreVertical,
  Phone,
  Video,
  Info,
  MessageSquare,
  Search,
} from 'lucide-react';
import { ConversationList, type Conversation } from '@/components/messages/conversation-list';
import { MessageThread, type Message } from '@/components/messages/message-thread';
import { MessageInput } from '@/components/messages/message-input';
import { MessageSearch, type SearchResult } from '@/components/messages/message-search';
import { useConversations } from '@/hooks/use-conversations';
import { useMessages } from '@/hooks/use-messages';
import { toast } from 'sonner';

// 

// 
const mockConversations: Conversation[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'John Doe',
    userAvatar: '/avatars/user1.jpg',
    lastMessage: 'Hello, how are you?',
    lastMessageTime: '2024-01-15T14:30:00Z',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Jane Smith',
    lastMessage: 'Thanks for the update',
    lastMessageTime: '2024-01-15T13:15:00Z',
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Bob Johnson',
    lastMessage: 'See you tomorrow',
    lastMessageTime: '2024-01-15T11:20:00Z',
    unreadCount: 1,
    isOnline: false,
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'Alice Brown',
    lastMessage: 'Great work!',
    lastMessageTime: '2024-01-14T16:45:00Z',
    unreadCount: 0,
    isOnline: false,
  },
];

// 
const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'user1',
    senderName: '张伟',
    content: '你好，我想咨询一下投资项目的详细信息',
    timestamp: '2024-01-15T14:25:00Z',
    isRead: true,
    isSent: false,
  },
  {
    id: '2',
    senderId: 'me',
    senderName: '我',
    content: '好的，我会尽快处理',
    timestamp: '2024-01-15T14:26:00Z',
    isRead: true,
    isSent: true,
  },
  {
    id: '3',
    senderId: 'user1',
    senderName: '张经理',
    content: '谢谢',
    timestamp: '2024-01-15T14:30:00Z',
    isRead: false,
    isSent: false,
  },
];

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  //  hook
  const {
    conversations,
    isLoading: conversationsLoading,
    updateConversation,
    markConversationAsRead,
  } = useConversations({
    enabled: true,
    refreshInterval: 10000, // 10
  });

  //  hook
  const {
    messages,
    isLoading: messagesLoading,
    sendMessage,
    markAllAsRead,
  } = useMessages({
    conversationId: selectedConversation?.id,
    enabled: !!selectedConversation,
    refreshInterval: 5000, // 5
  });

  // 
  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const handleSendMessage = async (content: string, attachments?: any[]) => {
    if (!selectedConversation) return;

    try {
      const displayContent = content || (attachments && attachments.length > 0 ? `[${attachments.length}个附件]` : '');

      // 使用 hook
      await sendMessage(displayContent, attachments);

      // 更新会话列表
      updateConversation(selectedConversation.id, {
        lastMessage: displayContent,
        lastMessageTime: new Date().toISOString(),
      });
    } catch (error) {
      console.error('发送消息失败', error);
      toast.error('发送失败');
    }
  };

  // 
  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowSearch(false); // 
    
    // 
    if (conversation.unreadCount > 0) {
      markConversationAsRead(conversation.id);
      markAllAsRead();
    }
  };

  // 
  const handleSelectSearchResult = (result: SearchResult) => {
    // 
    const conversation = conversations.find((c) => c.id === result.conversationId);
    
    if (conversation) {
      setSelectedConversation(conversation);
      setShowSearch(false);
      
      // TODO: 
      //  MessageThread 
    }
  };

  return (
    <div className="purple-gradient-page purple-gradient-content min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/*  */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="purple-gradient-title text-3xl font-bold text-white mb-2">Messages</h1>
            <p className="text-white/60">Chat with your team and clients</p>
          </div>
          <Button
            onClick={() => setShowSearch(!showSearch)}
            className={`${
              showSearch
                ? 'bg-purple-500 hover:bg-purple-600'
                : 'bg-white/10 hover:bg-white/20'
            } text-white border-white/20`}
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        {/*  -  */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/*  */}
          <Card className="purple-gradient-card lg:col-span-4 bg-white/10 backdrop-blur-sm border-white/20">
            {showSearch ? (
              <MessageSearch
                onSelectResult={handleSelectSearchResult}
                onClose={() => setShowSearch(false)}
              />
            ) : (
              <ConversationList
                conversations={conversations}
                selectedConversationId={selectedConversation?.id}
                onSelectConversation={handleSelectConversation}
              />
            )}
          </Card>

          {/* 消息区域 */}
          <Card className="purple-gradient-card lg:col-span-8 bg-white/10 backdrop-blur-sm border-white/20 flex flex-col">
            {selectedConversation ? (
              <>
                {/* 消息头部 */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={selectedConversation.userAvatar} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {getInitials(selectedConversation.userName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-white">{selectedConversation.userName}</h3>
                      <p className="text-xs text-white/60">
                        {selectedConversation.isOnline ? '在线' : '离线'}
                      </p>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <Phone className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <Video className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <Info className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* 消息线程 */}
                <MessageThread
                  messages={messages}
                  currentUserId="me"
                  recipientName={selectedConversation.userName}
                  recipientAvatar={selectedConversation.userAvatar}
                  isLoading={messagesLoading}
                />

                {/* 消息输入框 */}
                <MessageInput
                  onSendMessage={handleSendMessage}
                  onSelectEmoji={() => console.log("Emoji selected")}
                />
              </>
            ) : (
              // 未选择对话
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white/60 mb-2">未选择对话</h3>
                  <p className="text-white/40">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
