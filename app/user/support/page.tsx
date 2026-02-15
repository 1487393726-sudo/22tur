"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  Phone,
  Mail,
  Send,
  Search,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Headphones,
  FileQuestion,
  Users,
} from "lucide-react";
import "@/styles/user-pages.css";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

interface CustomerService {
  id: string;
  type: string;
  value: string;
  description: string;
  status: string;
}

export default function SupportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("chat");
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [customerServices, setCustomerServices] = useState<CustomerService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ text: string; sender: "user" | "support"; time: string }>>([]);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketCategory, setTicketCategory] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user) fetchSupportData();
  }, [session]);

  const fetchSupportData = async () => {
    try {
      const [faqsResponse, servicesResponse] = await Promise.all([
        fetch("/api/support/faqs"),
        fetch("/api/support/customer-service"),
      ]);
      if (faqsResponse.ok) setFaqs(await faqsResponse.json());
      if (servicesResponse.ok) setCustomerServices(await servicesResponse.json());
    } catch (error) {
      console.error("获取客服数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { text: message, sender: "user", time: new Date().toLocaleTimeString() }]);
      setMessage("");
      setTimeout(() => {
        setMessages((prev) => [...prev, { text: "感谢您的咨询！客服人员正在为您处理，请稍等片刻。", sender: "support", time: new Date().toLocaleTimeString() }]);
      }, 1500);
    }
  };

  const handleCreateTicket = async () => {
    if (!ticketSubject || !ticketMessage || !ticketCategory) {
      alert("请填写完整的工单信息");
      return;
    }
    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: ticketSubject, message: ticketMessage, category: ticketCategory }),
      });
      if (response.ok) {
        alert("工单创建成功！");
        setTicketSubject("");
        setTicketMessage("");
        setTicketCategory("");
      }
    } catch (error) {
      console.error("创建工单失败:", error);
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "PHONE": return <Phone className="h-5 w-5" />;
      case "EMAIL": return <Mail className="h-5 w-5" />;
      case "WECHAT": return <MessageSquare className="h-5 w-5" />;
      default: return <MessageCircle className="h-5 w-5" />;
    }
  };

  const getServiceLabel = (type: string) => {
    const labels: Record<string, string> = { PHONE: "电话", EMAIL: "邮箱", WECHAT: "微信", QQ: "QQ" };
    return labels[type] || type;
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  if (status === "loading") return <div className="user-page-container flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400" /></div>;
  if (!session?.user) return null;

  return (
    <div className="user-page-container">
      {/* Hero 区域 */}
      <div className="user-page-hero">
        <div className="user-page-hero-content">
          <div className="user-page-hero-header">
            <div className="user-page-hero-icon">
              <Headphones className="w-8 h-8" />
            </div>
            <div className="user-page-hero-title-section">
              <div className="user-page-hero-title-row">
                <h1 className="user-page-hero-title">客户支持</h1>
                <Sparkles className="user-page-sparkle" />
              </div>
              <p className="user-page-hero-description">我们随时为您提供帮助和支持</p>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="user-page-stats-grid">
            <div className="user-page-stat-card">
              <div className="user-page-stat-icon"><MessageCircle className="w-5 h-5" /></div>
              <div className="user-page-stat-content">
                <span className="user-page-stat-value">24/7</span>
                <span className="user-page-stat-label">在线支持</span>
              </div>
            </div>
            <div className="user-page-stat-card">
              <div className="user-page-stat-icon"><FileQuestion className="w-5 h-5" /></div>
              <div className="user-page-stat-content">
                <span className="user-page-stat-value">{faqs.length}</span>
                <span className="user-page-stat-label">常见问题</span>
              </div>
            </div>
            <div className="user-page-stat-card">
              <div className="user-page-stat-icon"><Users className="w-5 h-5" /></div>
              <div className="user-page-stat-content">
                <span className="user-page-stat-value">{customerServices.length}</span>
                <span className="user-page-stat-label">联系方式</span>
              </div>
            </div>
            <div className="user-page-stat-card">
              <div className="user-page-stat-icon"><HelpCircle className="w-5 h-5" /></div>
              <div className="user-page-stat-content">
                <span className="user-page-stat-value">&lt;5min</span>
                <span className="user-page-stat-label">平均响应</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="user-page-content">
        {/* Tabs */}
        <div className="user-tabs">
          <button onClick={() => setActiveTab("chat")} className={`user-tab ${activeTab === "chat" ? "active" : ""}`}>
            <MessageCircle className="user-tab-icon" /><span>在线聊天</span>
          </button>
          <button onClick={() => setActiveTab("faq")} className={`user-tab ${activeTab === "faq" ? "active" : ""}`}>
            <HelpCircle className="user-tab-icon" /><span>常见问题</span>
          </button>
          <button onClick={() => setActiveTab("contact")} className={`user-tab ${activeTab === "contact" ? "active" : ""}`}>
            <Phone className="user-tab-icon" /><span>联系方式</span>
          </button>
        </div>

        {/* 在线聊天 */}
        {activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="user-card">
                <div className="user-card-header">
                  <div className="user-card-header-icon"><MessageCircle className="w-5 h-5" /></div>
                  <div>
                    <h3 className="user-card-title">在线客服</h3>
                    <p className="user-card-description">客服在线时间: 周一至周日 9:00-22:00</p>
                  </div>
                </div>
                <div className="h-96 overflow-y-auto p-4 space-y-4 border-b border-white/10">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-white/30" />
                      <p className="text-white/60">您好！有什么可以帮助您的吗？</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.sender === "user" ? "bg-purple-500/30 text-white" : "bg-white/10 text-white/90"}`}>
                          <p className="text-sm">{msg.text}</p>
                          <p className="text-xs mt-1 opacity-60">{msg.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="输入您的问题..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none"
                  />
                  <button onClick={handleSendMessage} className="user-button user-button-primary user-button-md">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div>
              <div className="user-card">
                <div className="user-card-header">
                  <div className="user-card-header-icon"><HelpCircle className="w-5 h-5" /></div>
                  <div>
                    <h3 className="user-card-title">创建工单</h3>
                    <p className="user-card-description">如果问题复杂，建议创建工单</p>
                  </div>
                </div>
                <div className="user-card-content space-y-4">
                  <div><Label className="text-white/70">工单主题</Label><Input placeholder="请输入工单主题" value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)} className="bg-white/5 border-white/10 text-white" /></div>
                  <div><Label className="text-white/70">问题分类</Label>
                    <Select value={ticketCategory} onValueChange={setTicketCategory}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="选择问题分类" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">技术问题</SelectItem>
                        <SelectItem value="payment">支付问题</SelectItem>
                        <SelectItem value="service">服务咨询</SelectItem>
                        <SelectItem value="account">账户问题</SelectItem>
                        <SelectItem value="other">其他问题</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-white/70">问题描述</Label><Textarea placeholder="请详细描述您遇到的问题" value={ticketMessage} onChange={(e) => setTicketMessage(e.target.value)} rows={4} className="bg-white/5 border-white/10 text-white" /></div>
                  <button onClick={handleCreateTicket} className="user-button user-button-primary user-button-md w-full">创建工单</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 常见问题 */}
        {activeTab === "faq" && (
          <div className="user-card">
            <div className="user-card-header">
              <div className="user-card-header-icon"><HelpCircle className="w-5 h-5" /></div>
              <div>
                <h3 className="user-card-title">常见问题</h3>
                <p className="user-card-description">查看其他用户经常询问的问题和解答</p>
              </div>
            </div>
            <div className="user-card-content space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input placeholder="搜索问题..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500/50 focus:outline-none" />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48 bg-white/5 border-white/10 text-white"><SelectValue placeholder="选择分类" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有分类</SelectItem>
                    {categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                {filteredFaqs.map((faq) => (
                  <div key={faq.id} className="p-4 bg-white/3 border-l-4 border-l-purple-500 border border-white/10 rounded-xl">
                    <h4 className="font-medium text-white mb-2">{faq.question}</h4>
                    <p className="text-white/60 text-sm">{faq.answer}</p>
                    <Badge variant="outline" className="mt-2 border-white/20 text-white/50">{faq.category}</Badge>
                  </div>
                ))}
                {filteredFaqs.length === 0 && (
                  <div className="user-empty-state">
                    <div className="user-empty-state-icon"><HelpCircle className="w-12 h-12" /></div>
                    <h3 className="user-empty-state-title">未找到相关问题</h3>
                    <p className="user-empty-state-description">请尝试其他搜索词或联系客服</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 联系方式 */}
        {activeTab === "contact" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customerServices.map((service) => (
              <div key={service.id} className="user-card">
                <div className="user-card-content">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-purple-500/20 rounded-xl text-purple-300">
                      {getServiceIcon(service.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{getServiceLabel(service.type)}</h3>
                      <p className="text-sm text-white/60">{service.description}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div><Label className="text-white/50 text-xs">联系方式</Label><p className="font-medium text-purple-300">{service.value}</p></div>
                    <div><Label className="text-white/50 text-xs">状态</Label><Badge className={service.status === "ACTIVE" ? "bg-success/30 text-success" : "bg-muted/30 text-muted-foreground"}>{service.status === "ACTIVE" ? "在线" : "离线"}</Badge></div>
                    {service.type === "EMAIL" && <button className="user-button user-button-outline user-button-sm w-full"><Mail className="w-4 h-4" />发送邮件</button>}
                    {service.type === "PHONE" && <button className="user-button user-button-outline user-button-sm w-full"><Phone className="w-4 h-4" />拨打电话</button>}
                  </div>
                </div>
              </div>
            ))}
            {customerServices.length === 0 && (
              <div className="col-span-full user-card">
                <div className="user-empty-state">
                  <div className="user-empty-state-icon"><MessageCircle className="w-12 h-12" /></div>
                  <h3 className="user-empty-state-title">联系方式暂不可用</h3>
                  <p className="user-empty-state-description">请尝试在线聊天或创建工单</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
