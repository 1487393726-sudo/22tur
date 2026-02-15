"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Send,
  Paperclip,
  PlusCircle,
  Loader2,
  MessageCircle,
  HelpCircle,
  FileText,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  MoreVertical,
  Image as ImageIcon,
  Smile,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { dashboardStyles } from "@/lib/dashboard-styles";
import { useDashboardTranslations } from "@/lib/i18n/use-dashboard-translations";

// Types
interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  user?: { username: string; avatar?: string };
  messages?: Message[];
}

interface Message {
  id: string;
  message: string;
  senderType: "USER" | "SUPPORT";
  createdAt: string;
  user?: { username: string; avatar?: string };
  attachments?: string[];
}

// API functions
const fetchTickets = async () => {
  const res = await fetch("/api/support/tickets");
  if (!res.ok) throw new Error("Failed to fetch tickets");
  return res.json();
};

const fetchMessages = async (ticketId: string) => {
  if (!ticketId) return [];
  const res = await fetch(`/api/support/tickets/${ticketId}/messages`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
};

const sendMessage = async ({ ticketId, message }: { ticketId: string; message: string }) => {
  const res = await fetch(`/api/support/tickets/${ticketId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
};

const createTicket = async (data: { subject: string; message: string; category: string; priority: string }) => {
  const res = await fetch("/api/support/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create ticket");
  return res.json();
};

// Status config
const statusConfig: Record<string, { labelKey: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: any }> = {
  OPEN: { labelKey: "open", variant: "secondary", icon: Clock },
  PENDING: { labelKey: "pending", variant: "outline", icon: AlertCircle },
  RESOLVED: { labelKey: "resolved", variant: "default", icon: CheckCircle },
  CLOSED: { labelKey: "closed", variant: "outline", icon: X },
};

const priorityConfig: Record<string, { labelKey: string; color: string }> = {
  LOW: { labelKey: "low", color: "text-green-500" },
  MEDIUM: { labelKey: "medium", color: "text-yellow-500" },
  HIGH: { labelKey: "high", color: "text-orange-500" },
  URGENT: { labelKey: "urgent", color: "text-red-500" },
};

const categoryKeys = [
  { value: "ORDER", labelKey: "order" },
  { value: "PAYMENT", labelKey: "payment" },
  { value: "SERVICE", labelKey: "service" },
  { value: "TECHNICAL", labelKey: "technical" },
  { value: "OTHER", labelKey: "other" },
];

export default function SupportPage() {
  const { t, isRTL } = useDashboardTranslations();

  // Quick Help Cards
  const quickHelpItems = [
    { icon: FileText, titleKey: "faq", descKey: "faqDesc", href: "/faq" },
    { icon: Phone, titleKey: "phone", desc: "400-123-4567", href: "tel:4001234567" },
    { icon: Mail, titleKey: "email", desc: "support@example.com", href: "mailto:support@example.com" },
    { icon: HelpCircle, titleKey: "docs", descKey: "docsDesc", href: "/docs" },
  ];

  // Category options
  const categoryOptions = categoryKeys.map(cat => ({
    value: cat.value,
    label: t(`support.categories.${cat.labelKey}`, cat.labelKey)
  }));

  const queryClient = useQueryClient();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", message: "", category: "SERVICE", priority: "MEDIUM" });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: tickets = [], isLoading: isLoadingTickets } = useQuery({
    queryKey: ["supportTickets"],
    queryFn: fetchTickets,
  });

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ["messages", selectedTicketId],
    queryFn: () => fetchMessages(selectedTicketId!),
    enabled: !!selectedTicketId,
  });

  const sendMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", selectedTicketId] });
      setNewMessage("");
    },
  });

  const createMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
      setShowNewTicketDialog(false);
      setNewTicket({ subject: "", message: "", category: "SERVICE", priority: "MEDIUM" });
      setSelectedTicketId(data.id);
    },
  });

  useEffect(() => {
    if (tickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "" || !selectedTicketId) return;
    sendMutation.mutate({ ticketId: selectedTicketId, message: newMessage });
  };

  const handleCreateTicket = () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) return;
    createMutation.mutate(newTicket);
  };

  const filteredTickets = tickets.filter((ticket: Ticket) => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedTicket = tickets.find((t: Ticket) => t.id === selectedTicketId);

  return (
    <div className="purple-gradient-page">
      <div className="purple-gradient-content">
        <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
          <div className="purple-gradient-hero rounded-xl p-6 mb-6">
            <PageHeader
              title={t("support.title", "Customer Support")}
              description={t("support.description", "Chat with our support team in real-time")}
              icon="💬"
              actions={
                <Dialog open={showNewTicketDialog} onOpenChange={setShowNewTicketDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <PlusCircle className="h-4 w-4" />
                      {t("support.tickets.newTicket", "New Ticket")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>{t("support.newTicket.title", "Create Support Ticket")}</DialogTitle>
                      <DialogDescription>{t("support.newTicket.description", "Describe your issue and we will help you")}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="subject">{t("support.newTicket.subject", "Subject")}</Label>
                        <Input
                          id="subject"
                          placeholder={t("support.newTicket.subjectPlaceholder", "Brief description")}
                          value={newTicket.subject}
                          onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">{t("support.newTicket.category", "Category")}</Label>
                          <Select value={newTicket.category} onValueChange={(v) => setNewTicket({ ...newTicket, category: v })}>
                            <SelectTrigger id="category">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categoryOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority">{t("support.newTicket.priority", "Priority")}</Label>
                          <Select value={newTicket.priority} onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}>
                            <SelectTrigger id="priority">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LOW">{t("support.priority.low", "Low")}</SelectItem>
                              <SelectItem value="MEDIUM">{t("support.priority.medium", "Medium")}</SelectItem>
                              <SelectItem value="HIGH">{t("support.priority.high", "High")}</SelectItem>
                              <SelectItem value="URGENT">{t("support.priority.urgent", "Urgent")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">{t("support.newTicket.message", "Description")}</Label>
                        <Textarea
                          id="message"
                          placeholder={t("support.newTicket.messagePlaceholder", "Describe your issue in detail...")}
                          rows={4}
                          value={newTicket.message}
                          onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNewTicketDialog(false)}>
                        {t("support.newTicket.cancel", "Cancel")}
                      </Button>
                      <Button onClick={handleCreateTicket} disabled={createMutation.isPending}>
                        {createMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t("support.newTicket.submitting", "Submitting...")}
                          </>
                        ) : (
                          t("support.newTicket.submit", "Submit Ticket")
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              }
            />
          </div>

          {/* Quick Help Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickHelpItems.map((item, index) => (
              <Card
                key={index}
                className="purple-gradient-card/40 hover:bg-card/60 transition-colors cursor-pointer"
                onClick={() => (item.href.startsWith("/") ? (window.location.href = item.href) : window.open(item.href))}
              >
                <CardContent className={cn("p-4 flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <div className="p-2 purple-gradient-button/10 rounded-lg">
                    <item.icon className="h-5 w-5 purple-gradient-title" />
                  </div>
                  <div className={isRTL ? "text-right" : ""}>
                    <p className="font-medium text-sm">{t(`support.quickHelp.${item.titleKey}`, item.titleKey)}</p>
                    <p className="text-xs purple-gradient-text">
                      {item.descKey ? t(`support.quickHelp.${item.descKey}`, item.desc || "") : item.desc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Chat Section */}
          <div className="h-[calc(100vh-22rem)] flex flex-col md:flex-row gap-4">
            {/* Left Panel: Ticket List */}
            <Card className={`w-full md:w-80 lg:w-96 flex flex-col ${dashboardStyles.card.base}`}>
              <CardHeader className="pb-3 space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{t("support.tickets.title", "Conversations")}</CardTitle>
                  <Badge variant="secondary">{filteredTickets.length}</Badge>
                </div>
                <div className="relative">
                  <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                  <Input
                    placeholder={t("support.tickets.search", "Search tickets...")}
                    className={isRTL ? "pr-9 h-9" : "pl-9 h-9"}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                  <TabsList className="grid w-full grid-cols-4 h-8">
                    <TabsTrigger value="all" className="text-xs">
                      {t("support.tickets.all", "All")}
                    </TabsTrigger>
                    <TabsTrigger value="OPEN" className="text-xs">
                      {t("support.tickets.open", "Open")}
                    </TabsTrigger>
                    <TabsTrigger value="PENDING" className="text-xs">
                      {t("support.tickets.pending", "Pending")}
                    </TabsTrigger>
                    <TabsTrigger value="RESOLVED" className="text-xs">
                      {t("support.tickets.resolved", "Resolved")}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0">
                {isLoadingTickets ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin purple-gradient-title" />
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                    <MessageCircle className="h-10 w-10 purple-gradient-text mb-3" />
                    <p className="text-sm purple-gradient-text">{t("support.tickets.noTickets", "No tickets")}</p>
                    <Button variant="link" size="sm" onClick={() => setShowNewTicketDialog(true)}>
                      {t("support.tickets.createNew", "Create new")}
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredTickets.map((ticket: Ticket) => {
                      const status = statusConfig[ticket.status] || statusConfig.OPEN;
                      const priority = priorityConfig[ticket.priority] || priorityConfig.MEDIUM;
                      return (
                        <div
                          key={ticket.id}
                          onClick={() => setSelectedTicketId(ticket.id)}
                          className={cn(
                            "flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                            selectedTicketId === ticket.id && "bg-muted",
                            isRTL && "flex-row-reverse"
                          )}
                        >
                          <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage src={ticket.user?.avatar} />
                            <AvatarFallback className="purple-gradient-button/10 purple-gradient-title">
                              {ticket.user?.username?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                            <div className={cn("flex items-center gap-2 mb-1", isRTL && "flex-row-reverse")}>
                              <p className="font-medium text-sm truncate flex-1">{ticket.subject}</p>
                              <span className={cn("text-xs", priority.color)}>●</span>
                            </div>
                            <p className="text-xs purple-gradient-text truncate">
                              {ticket.messages?.[0]?.message || t("support.chat.noMessages", "No messages")}
                            </p>
                            <div className={cn("flex items-center gap-2 mt-2", isRTL && "flex-row-reverse")}>
                              <Badge variant={status.variant} className="text-xs h-5">
                                {t(`support.tickets.${status.labelKey}`, status.labelKey)}
                              </Badge>
                              <span className="text-xs purple-gradient-text">
                                {new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Panel: Chat Window */}
            <Card className={`flex-1 flex flex-col ${dashboardStyles.card.base}`}>
              {!selectedTicket ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="p-4 purple-gradient-button/10 rounded-full mb-4">
                    <MessageCircle className="h-8 w-8 purple-gradient-title" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{t("support.chat.selectConversation", "Select a conversation")}</h3>
                  <p className="text-sm purple-gradient-text mb-4">
                    {t("support.chat.selectDesc", "Select a ticket from the left to start chatting")}
                  </p>
                  <Button onClick={() => setShowNewTicketDialog(true)} className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    {t("support.tickets.newTicket", "New Ticket")}
                  </Button>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedTicket.user?.avatar} />
                          <AvatarFallback className="purple-gradient-button/10 purple-gradient-title">
                            {selectedTicket.user?.username?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{selectedTicket.subject}</p>
                          <div className="flex items-center gap-2 text-xs purple-gradient-text">
                            <span>Ticket #{selectedTicket.id.slice(0, 8)}</span>
                            <span>·</span>
                            <span>{categoryOptions.find(c => c.value === selectedTicket.category)?.label || selectedTicket.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusConfig[selectedTicket.status]?.variant || "outline"}>
                          {statusConfig[selectedTicket.status]?.labelKey || selectedTicket.status}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoadingMessages ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin purple-gradient-title" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-sm purple-gradient-text">
                          {t("support.chat.noMessages", "No messages yet. Send the first message to start")}
                        </p>
                      </div>
                    ) : (
                      messages.map((msg: Message) => (
                        <div key={msg.id} className={cn("flex items-end gap-2", msg.senderType === "USER" && "justify-end")}>
                          {msg.senderType !== "USER" && (
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                Support
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={cn(
                              "rounded-2xl px-4 py-2.5 max-w-[70%]",
                              msg.senderType === "USER"
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted rounded-bl-md"
                            )}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            <p
                              className={cn(
                                "text-xs mt-1",
                                msg.senderType === "USER" ? "text-primary-foreground/70" : "text-muted-foreground"
                              )}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          {msg.senderType === "USER" && (
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src={msg.user?.avatar} />
                              <AvatarFallback className="purple-gradient-button/10 purple-gradient-title text-xs">
                                U
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </CardContent>

                  {/* Input Area */}
                  <div className="p-4 border-t purple-gradient-page/50">
                    <div className={cn("flex items-end gap-2", isRTL && "flex-row-reverse")}>
                      <div className="flex-1 relative">
                        <Textarea
                          placeholder={t("support.chat.inputPlaceholder", "Type a message...")}
                          className={cn("min-h-[44px] max-h-32 resize-none", isRTL ? "pl-20" : "pr-20")}
                          rows={1}
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <div className={cn("absolute bottom-2 flex items-center gap-1", isRTL ? "left-2" : "right-2")}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={t("support.chat.addEmoji", "Add emoji")}>
                            <Smile className="h-4 w-4 purple-gradient-text" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={t("support.chat.uploadImage", "Upload image")}>
                            <ImageIcon className="h-4 w-4 purple-gradient-text" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={t("support.chat.uploadAttachment", "Upload file")}>
                            <Paperclip className="h-4 w-4 purple-gradient-text" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        onClick={handleSendMessage}
                        disabled={sendMutation.isPending || !newMessage.trim()}
                        size="icon"
                        className="h-11 w-11 rounded-full shrink-0"
                      >
                        {sendMutation.isPending ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Send className={cn("h-5 w-5", isRTL && "rotate-180")} />
                        )}
                      </Button>
                    </div>
                    <p className={cn("text-xs text-muted-foreground mt-2", isRTL && "text-right")}>
                      {t("support.chat.sendHint", "Press Enter to send, Shift+Enter for new line")}
                    </p>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
