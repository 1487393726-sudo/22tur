'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Send,
  Loader2,
  MessageCircle,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Types
interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  user?: { 
    username: string; 
    avatar?: string;
    email?: string;
  };
  messages?: Message[];
}

interface Message {
  id: string;
  message: string;
  senderType: 'USER' | 'SUPPORT';
  createdAt: string;
  user?: { username: string; avatar?: string };
}

// API functions
const fetchAllTickets = async (status?: string) => {
  const url = status && status !== 'all' 
    ? `/api/admin/support/tickets?status=${status}`
    : '/api/admin/support/tickets';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch tickets');
  return res.json();
};

const fetchTicketMessages = async (ticketId: string) => {
  const res = await fetch(`/api/admin/support/tickets/${ticketId}/messages`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
};

const sendAdminMessage = async ({ ticketId, message }: { ticketId: string; message: string }) => {
  const res = await fetch(`/api/admin/support/tickets/${ticketId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
};

const updateTicketStatus = async ({ ticketId, status }: { ticketId: string; status: string }) => {
  const res = await fetch(`/api/admin/support/tickets/${ticketId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
};

export default function AdminSupportPage() {
  const t = useTranslations('admin.support');
  const tc = useTranslations('common');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch all tickets
  const { data: tickets = [], isLoading: isLoadingTickets } = useQuery({
    queryKey: ['admin-tickets', statusFilter],
    queryFn: () => fetchAllTickets(statusFilter),
    refetchInterval: 10000, // 每10秒刷新
  });

  // Fetch messages for selected ticket
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['admin-messages', selectedTicket?.id],
    queryFn: () => fetchTicketMessages(selectedTicket!.id),
    enabled: !!selectedTicket,
    refetchInterval: 5000, // 每5秒刷新
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendAdminMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages', selectedTicket?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      setNewMessage('');
      toast.success(t('messageSent'));
    },
    onError: () => {
      toast.error(t('messageFailed'));
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: updateTicketStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      toast.success(t('statusUpdated'));
    },
    onError: () => {
      toast.error(t('statusUpdateFailed'));
    },
  });

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    sendMessageMutation.mutate({
      ticketId: selectedTicket.id,
      message: newMessage,
    });
  };

  const handleStatusChange = (status: string) => {
    if (!selectedTicket) return;
    updateStatusMutation.mutate({
      ticketId: selectedTicket.id,
      status,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string; color: string }> = {
      OPEN: { variant: 'default', icon: AlertCircle, label: t('statusOpen'), color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
      IN_PROGRESS: { variant: 'secondary', icon: Clock, label: t('statusInProgress'), color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
      CLOSED: { variant: 'outline', icon: CheckCircle, label: t('statusClosed'), color: 'bg-green-500/20 text-green-300 border-green-500/30' },
    };
    const config = variants[status] || variants.OPEN;
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} border gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      MEDIUM: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      HIGH: 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    const labels: Record<string, string> = {
      LOW: t('priorityLow'),
      MEDIUM: t('priorityMedium'),
      HIGH: t('priorityHigh'),
    };
    return (
      <Badge className={`${colors[priority] || colors.MEDIUM} border`}>
        {labels[priority] || priority}
      </Badge>
    );
  };

  const filteredTickets = tickets.filter((ticket: Ticket) =>
    ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.user?.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold theme-gradient-text mb-2">{t('title')}</h1>
        <p className="text-gray-300">{t('description')}</p>
      </div>

      {/* Filters */}
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-white/5 border-white/20 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatus')}</SelectItem>
                <SelectItem value="OPEN">{t('statusOpen')}</SelectItem>
                <SelectItem value="IN_PROGRESS">{t('statusInProgress')}</SelectItem>
                <SelectItem value="CLOSED">{t('statusClosed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-280px)]">
        {/* Tickets List */}
        <Card className="lg:col-span-4 overflow-hidden flex flex-col bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-white/10">
            <CardTitle className="text-lg flex items-center justify-between text-white">
              <span>{t('ticketList')}</span>
              <Badge variant="secondary" className="bg-white/20 text-white">{filteredTickets.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {isLoadingTickets ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <MessageCircle className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-300">{t('noTickets')}</p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {filteredTickets.map((ticket: Ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={cn(
                      'w-full p-4 text-left hover:bg-white/5 transition-colors',
                      selectedTicket?.id === ticket.id && 'bg-white/10 border-l-4 border-purple-400'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={ticket.user?.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          {getInitials(ticket.user?.username || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm truncate text-white">{ticket.user?.username}</p>
                          <span className="text-xs text-gray-400">{formatTime(ticket.updatedAt)}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-200 truncate mb-2">
                          {ticket.subject}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {getStatusBadge(ticket.status)}
                          {getPriorityBadge(ticket.priority)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-8 flex flex-col bg-white/10 border-white/20 backdrop-blur-sm">
          {!selectedTicket ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">{t('selectTicket')}</h3>
                <p className="text-gray-300">{t('selectTicketDesc')}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-3 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedTicket.user?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {getInitials(selectedTicket.user?.username || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-white">{selectedTicket.subject}</h3>
                      <p className="text-sm text-gray-300 flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {selectedTicket.user?.username}
                        {selectedTicket.user?.email && ` • ${selectedTicket.user.email}`}
                      </p>
                    </div>
                  </div>
                  <Select
                    value={selectedTicket.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-32 bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">{t('statusOpen')}</SelectItem>
                      <SelectItem value="IN_PROGRESS">{t('statusInProgress')}</SelectItem>
                      <SelectItem value="CLOSED">{t('statusClosed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/5">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-gray-300">{t('noMessages')}</p>
                  </div>
                ) : (
                  messages.map((msg: Message) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex items-end gap-2',
                        msg.senderType === 'SUPPORT' && 'justify-end'
                      )}
                    >
                      {msg.senderType === 'USER' && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={msg.user?.avatar} />
                          <AvatarFallback className="bg-white/20 text-white text-xs">
                            {getInitials(msg.user?.username || 'U')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          'max-w-[70%] rounded-lg px-4 py-2',
                          msg.senderType === 'USER'
                            ? 'bg-white/10 text-white'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <p
                          className={cn(
                            'text-xs mt-1',
                            msg.senderType === 'USER' ? 'text-gray-300' : 'text-white/80'
                          )}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                      {msg.senderType === 'SUPPORT' && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                            {tc('buttons.support') || '客服'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <Textarea
                    placeholder={t('replyPlaceholder')}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[44px] max-h-32 resize-none bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                    rows={2}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="self-end theme-gradient-bg text-white hover:shadow-lg transition-shadow"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {t('sendHint')}
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
