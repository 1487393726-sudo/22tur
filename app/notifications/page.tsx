"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  BellRing,
  MessageSquare,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Search,
  Filter,
  Trash2,
  Archive,
  Eye,
  Clock,
  User,
  Mail,
  Smartphone,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: any;
}

interface Message {
  id: string;
  sender: string;
  senderAvatar?: string;
  subject: string;
  content: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  isReplied: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "新活动通知",
    message: '您有一个新的活动邀请',
    type: "EVENT",
    priority: "MEDIUM",
    isRead: false,
    createdAt: "2024-01-15T10:30:00Z",
    actionUrl: "/schedule/events/123",
  },
  {
    id: "2",
    title: "",
    message: '?"',
    type: "TASK",
    priority: "HIGH",
    isRead: false,
    createdAt: "2024-01-15T09:15:00Z",
    actionUrl: "/tasks/456",
  },
  {
    id: "3",
    title: "",
    message: "",
    type: "INFO",
    priority: "LOW",
    isRead: true,
    createdAt: "2024-01-15T08:00:00Z",
  },
  {
    id: "4",
    title: "报告生成完成",
    message: "您的月度财务报告已生成完成",
    type: "REPORT",
    priority: "MEDIUM",
    isRead: false,
    createdAt: "2024-01-14T16:45:00Z",
    actionUrl: "/analytics/reports/789",
  },
];

const mockMessages: Message[] = [
  {
    id: "1",
    sender: "财务部",
    subject: "Q1财务报告",
    content: "Q1财务报告已完成...",
    type: "MESSAGE",
    priority: "NORMAL",
    isRead: false,
    createdAt: "2024-01-15T11:20:00Z",
    isReplied: false,
  },
  {
    id: "2",
    sender: "人力资源部",
    subject: "年度体检通知",
    content: "A栋4楼体检中心...",
    type: "ANNOUNCEMENT",
    priority: "NORMAL",
    isRead: true,
    createdAt: "2024-01-15T10:00:00Z",
    isReplied: true,
  },
  {
    id: "3",
    sender: "技术部",
    subject: "",
    content: "??..",
    type: "REMINDER",
    priority: "HIGH",
    isRead: false,
    createdAt: "2024-01-14T18:30:00Z",
    isReplied: false,
  },
];

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState("notifications");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    pushEnabled: true,
    taskEnabled: true,
    eventEnabled: true,
    reminderEnabled: true,
    reportEnabled: true,
    frequency: "IMMEDIATE",
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // 
  const fetchNotificationPreferences = async () => {
    try {
      const response = await fetch('/api/user/notification-preferences');
      const data = await response.json();

      if (response.ok && data.preferences) {
        setNotificationSettings(data.preferences);
      }
    } catch (error) {
      console.error(':', error);
    }
  };

  // 
  const saveNotificationPreferences = async (newSettings: typeof notificationSettings) => {
    try {
      setSettingsSaving(true);
      setSettingsSaved(false);

      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        setSettingsSaved(true);
        // 3
        setTimeout(() => setSettingsSaved(false), 3000);
      } else {
        console.error('');
      }
    } catch (error) {
      console.error(':', error);
    } finally {
      setSettingsSaving(false);
    }
  };

  const updateNotificationSetting = (key: keyof typeof notificationSettings, value: any) => {
    const newSettings = {
      ...notificationSettings,
      [key]: value,
    };
    setNotificationSettings(newSettings);
    saveNotificationPreferences(newSettings);
  };

  // 
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
      });

      if (filterType !== 'all') {
        params.append('type', filterType);
      }

      if (filterPriority !== 'all') {
        params.append('priority', filterPriority);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await fetch(`/api/notifications?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setNotifications(data.notifications || []);
      } else {
        console.error('获取通知失败:', data.error);
        setNotifications(mockNotifications);
      }
    } catch (error) {
      console.error('获取通知失败:', error);
      setNotifications(mockNotifications);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchNotificationPreferences();
    
    // 每30秒刷新一次
    const interval = setInterval(fetchNotifications, 30000);
    
    // 模拟加载消息
    const timer = setTimeout(() => {
      setMessages(mockMessages);
    }, 300);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [filterType, filterPriority, searchTerm]);

  const getNotificationIcon = (type: string) => {
    const icons = {
      EVENT: Calendar,
      TASK: CheckCircle,
      INFO: Info,
      WARNING: AlertTriangle,
      REPORT: MessageSquare,
      SUCCESS: CheckCircle,
    };
    return icons[type as keyof typeof icons] || Bell;
  };

  const getNotificationColor = (type: string, priority: string) => {
    const colors = {
      EVENT: "bg-blue-100 text-blue-800 border-blue-200",
      TASK: "bg-green-100 text-green-800 border-green-200",
      INFO: "bg-gray-100 text-gray-800 border-gray-200",
      WARNING: "bg-orange-100 text-orange-800 border-orange-200",
      REPORT: "bg-purple-100 text-purple-800 border-purple-200",
      SUCCESS: "bg-green-100 text-green-800 border-green-200",
    };

    if (priority === "HIGH" || priority === "URGENT") {
      return "bg-red-100 text-red-800 border-red-200";
    }

    return (
      colors[type as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-blue-100 text-blue-800",
      HIGH: "bg-orange-100 text-orange-800",
      URGENT: "bg-red-100 text-red-800",
      NORMAL: "bg-gray-100 text-gray-800",
    };
    return (
      colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}`;
    } else if (diffHours > 0) {
      return `${diffHours}`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}`;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
      } else {
        console.error('标记为已读失败');
      }
    } catch (error) {
      console.error(':', error);
    }
  };

  const markMessageAsRead = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)),
    );
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      } else {
        console.error('删除通知失败');
      }
    } catch (error) {
      console.error(':', error);
    }
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
      });

      if (response.ok) {
        // 标记所有为已读
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true })),
        );
      } else {
        console.error('标记失败');
      }
    } catch (error) {
      console.error(':', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const unreadMessageCount = messages.filter((m) => !m.isRead).length;

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" || notification.type === filterType;
    const matchesPriority =
      filterPriority === "all" || notification.priority === filterPriority;
    return matchesSearch && matchesType && matchesPriority;
  });

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-oid="g0fe-x5">
        <div className="text-center" data-oid="796mino">
          <BellRing
            className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse"
            data-oid="dsr:k8l"
          />
          <p className="text-gray-600" data-oid="1b4f.2_">
            加载中...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto" data-oid="tvocgv1">
      <div
        className="flex justify-between items-center mb-6"
        data-oid="bnm_vz8"
      >
        <div data-oid="wkl0.ka">
          <h1 className="purple-gradient-title text-3xl font-bold text-gray-900" data-oid="9q5w0qo">
            通知中心
          </h1>
          <p className="text-gray-600 mt-1" data-oid="uw-whlf">
            管理您的通知和消息
          </p>
        </div>
        <div className="flex items-center gap-3" data-oid="a10wo56">
          <Button 
            variant="outline" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            data-oid="mark-all-read"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            全部标记为已读
          </Button>
          <Button variant="outline" data-oid="r:y0g76">
            <Settings className="w-4 h-4 mr-2" data-oid="n00pmqx" />
            设置
          </Button>
          <Button variant="outline" data-oid="q_rz1pa">
            <Archive className="w-4 h-4 mr-2" data-oid="g_:4bmi" />
            归档
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" data-oid="i4j9hba">
        {/*  */}
        <div className="lg:col-span-3 space-y-6" data-oid=".vz2olh">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            data-oid="0k_lghm"
          >
            <TabsList className="grid w-full grid-cols-2" data-oid="p5ulo3i">
              <TabsTrigger
                value="notifications"
                className="relative"
                data-oid="t4xq181"
              >
                
                {unreadCount > 0 && (
                  <Badge
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs"
                    data-oid="8z4ge64"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="relative"
                data-oid="qopnh39"
              >
                
                {unreadMessageCount > 0 && (
                  <Badge
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs"
                    data-oid="rc-v87s"
                  >
                    {unreadMessageCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/*  */}
            <TabsContent
              value="notifications"
              className="space-y-4"
              data-oid="wmtjhg-"
            >
              {filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                return (
                  <Card
                    key={notification.id}
                    className={`purple-gradient-card transition-all hover:shadow-md ${!notification.isRead ? "border-l-4 border-l-blue-500" : ""}`}
                    data-oid=":dja998">
                    <CardContent className="purple-gradient-card p-4" data-oid="7sjscs6">
                      <div
                        className="flex items-start justify-between"
                        data-oid="50sv-1d"
                      >
                        <div
                          className="flex items-start space-x-3 flex-1"
                          data-oid="gexd:c5"
                        >
                          <div
                            className={`p-2 rounded-full ${getNotificationColor(notification.type, notification.priority)}`}
                            data-oid=":kxm_66"
                          >
                            <Icon className="w-5 h-5" data-oid="woly:x_" />
                          </div>
                          <div className="flex-1" data-oid="8xh0te6">
                            <div
                              className="flex items-center justify-between"
                              data-oid="zlmx2c:"
                            >
                              <h3
                                className={`font-medium ${!notification.isRead ? "text-gray-900" : "text-gray-600"}`}
                                data-oid=":trffc1"
                              >
                                {notification.title}
                              </h3>
                              <div
                                className="flex items-center space-x-2"
                                data-oid="y9ximpd"
                              >
                                <Badge
                                  variant="outline"
                                  className={getPriorityColor(
                                    notification.priority,
                                  )}
                                  data-oid="xrlm_m-"
                                >
                                  {notification.priority}
                                </Badge>
                                <span
                                  className="text-sm text-gray-500"
                                  data-oid="ovnfw:_"
                                >
                                  {formatTime(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                            <p
                              className={`${!notification.isRead ? "text-gray-700" : "text-gray-500"} mt-1`}
                              data-oid="e7-77p-"
                            >
                              {notification.message}
                            </p>
                            {notification.actionUrl && (
                              <Button
                                variant="link"
                                size="sm"
                                className="mt-2 p-0"
                                onClick={() => markAsRead(notification.id)}
                                data-oid="xjyn283"
                              >
                                查看详情
                              </Button>
                            )}
                          </div>
                        </div>
                        <div
                          className="flex items-center space-x-1"
                          data-oid="dgh:qvj"
                        >
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              data-oid="1.r7xgu"
                            >
                              <Eye className="w-4 h-4" data-oid="-a-xcbw" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            data-oid="_6djzuu"
                          >
                            <Trash2 className="w-4 h-4" data-oid="di8.hx." />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            {/*  */}
            <TabsContent
              value="messages"
              className="space-y-4"
              data-oid="x_s0n7t"
            >
              {filteredMessages.map((message) => (
                <Card
                  key={message.id}
                  className={`purple-gradient-card transition-all hover:shadow-md ${!message.isRead ? "border-l-4 border-l-green-500" : ""}`}
                  data-oid="6h-l91l">
                  <CardContent className="purple-gradient-card p-4" data-oid=":_ebe6b">
                    <div
                      className="flex items-start justify-between"
                      data-oid="_wnxsvm"
                    >
                      <div
                        className="flex items-start space-x-3 flex-1"
                        data-oid="58x6rwi"
                      >
                        <div
                          className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"
                          data-oid="1q6in8_"
                        >
                          <User
                            className="w-5 h-5 text-blue-600"
                            data-oid="v1qdpdn"
                          />
                        </div>
                        <div className="flex-1" data-oid="5duba1c">
                          <div
                            className="flex items-center justify-between"
                            data-oid="v.9adnp"
                          >
                            <div data-oid="6ojj868">
                              <h3
                                className={`font-medium ${!message.isRead ? "text-gray-900" : "text-gray-600"}`}
                                data-oid="kdukv7."
                              >
                                {message.sender}
                              </h3>
                              <p
                                className="text-sm text-gray-500"
                                data-oid="khh:pds"
                              >
                                {message.subject}
                              </p>
                            </div>
                            <div className="text-right" data-oid="kcg13o3">
                              <div
                                className="text-sm text-gray-500"
                                data-oid="eqvh4.i"
                              >
                                {formatTime(message.createdAt)}
                              </div>
                              <Badge
                                variant="outline"
                                className="mt-1 text-xs"
                                data-oid="l1-asis"
                              >
                                {message.type}
                              </Badge>
                            </div>
                          </div>
                          <p
                            className={`${!message.isRead ? "text-gray-700" : "text-gray-500"} mt-2 line-clamp-2`}
                            data-oid="upjq9h."
                          >
                            {message.content}
                          </p>
                          <div
                            className="flex items-center space-x-2 mt-3"
                            data-oid="l.xh61:"
                          >
                            {!message.isRead && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markMessageAsRead(message.id)}
                                data-oid="l9bjn0t"
                              >
                                标记为已读
                              </Button>
                            )}
                            <Button size="sm" data-oid=".7:90y." className="purple-gradient-button">
                              回复
                            </Button>
                            {message.isReplied && (
                              <Badge
                                variant="default"
                                className="text-xs"
                                data-oid="y_1aa_y"
                              >
                                已回复
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMessage(message.id)}
                        data-oid="4v4x8hv"
                      >
                        <Trash2 className="w-4 h-4" data-oid="_o2f:ji" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* 右侧筛选面板 */}
        <div className="space-y-6" data-oid="xajfcj2">
          {/* 筛选器 */}
          <Card data-oid="5s08cb7" className="purple-gradient-card">
            <CardHeader data-oid="d7kuwuk" className="purple-gradient-card">
              <CardTitle className="purple-gradient-title purple-gradient-card text-lg" data-oid="yy4gppn">
                筛选器
              </CardTitle>
            </CardHeader>
            <CardContent className="purple-gradient-card space-y-4" data-oid="r5jnwdp">
              <div className="relative" data-oid="e98r3qx">
                <Search
                  className="w-4 h-4 absolute left-3 top-3 text-gray-400"
                  data-oid="kfhtlhy"
                />
                <Input
                  placeholder="搜索通知..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-oid="38mvd0w"
                />
              </div>
              <div data-oid="p:jicrl">
                <Label data-oid="677y:o8">通知类型</Label>
                <Select
                  value={filterType}
                  onValueChange={setFilterType}
                  data-oid="sy__cz4"
                >
                  <SelectTrigger data-oid="-xf:9iu">
                    <SelectValue data-oid="tizz7.c" />
                  </SelectTrigger>
                  <SelectContent data-oid="lbjt-lp">
                    <SelectItem value="all" data-oid="he-m7f_">
                      全部
                    </SelectItem>
                    <SelectItem value="EVENT" data-oid="0mfag3k">
                      事件
                    </SelectItem>
                    <SelectItem value="TASK" data-oid="ya86cv5">
                      任务
                    </SelectItem>
                    <SelectItem value="INFO" data-oid="6ehdfpn">
                      信息
                    </SelectItem>
                    <SelectItem value="REPORT" data-oid="xen3e2b">
                      报告
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div data-oid="6piqcpw">
                <Label data-oid="7i2t.4h">优先级</Label>
                <Select
                  value={filterPriority}
                  onValueChange={setFilterPriority}
                  data-oid="0dcz6r1"
                >
                  <SelectTrigger data-oid="snxygf7">
                    <SelectValue data-oid="8:90tzk" />
                  </SelectTrigger>
                  <SelectContent data-oid="c2u:ktu">
                    <SelectItem value="all" data-oid="332_qo4">
                      全部
                    </SelectItem>
                    <SelectItem value="URGENT" data-oid="1.1.ha8">
                      紧急
                    </SelectItem>
                    <SelectItem value="HIGH" data-oid="nrhyc1e">
                      高
                    </SelectItem>
                    <SelectItem value="MEDIUM" data-oid="90tps07">
                      中
                    </SelectItem>
                    <SelectItem value="LOW" data-oid="re7z_83">
                      低
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 通知设置 */}
          <Card data-oid="liooss." className="purple-gradient-card">
            <CardHeader data-oid="jpnprjv" className="purple-gradient-card">
              <CardTitle className="purple-gradient-title purple-gradient-card text-lg flex items-center justify-between" data-oid="d7tir2-">
                <span>通知设置</span>
                {settingsSaved && (
                  <Badge className="bg-green-500 text-white text-xs">
                    已保存
                  </Badge>
                )}
                {settingsSaving && (
                  <Badge variant="outline" className="text-xs">
                    保存中...
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="purple-gradient-card space-y-4" data-oid=":e4rcmh">
              <div
                className="flex items-center justify-between"
                data-oid="9w0g6uc"
              >
                <div className="flex items-center space-x-2" data-oid="8ttxcr8">
                  <Mail className="w-4 h-4 text-gray-600" data-oid="pt25px3" />
                  <Label data-oid="1.ddf2x">邮件通知</Label>
                </div>
                <Switch
                  checked={notificationSettings.emailEnabled}
                  onCheckedChange={(checked) =>
                    updateNotificationSetting('emailEnabled', checked)
                  }
                  disabled={settingsSaving}
                  data-oid="qg2ch3t"
                />
              </div>
              <div
                className="flex items-center justify-between"
                data-oid="mscsrcf"
              >
                <div className="flex items-center space-x-2" data-oid="3sui78r">
                  <Smartphone
                    className="w-4 h-4 text-gray-600"
                    data-oid="_6o:byz"
                  />
                  <Label data-oid="ods4e8l">推送通知</Label>
                </div>
                <Switch
                  checked={notificationSettings.pushEnabled}
                  onCheckedChange={(checked) =>
                    updateNotificationSetting('pushEnabled', checked)
                  }
                  disabled={settingsSaving}
                  data-oid=".e9z58f"
                />
              </div>
              <div
                className="flex items-center justify-between"
                data-oid="z0mzbah"
              >
                <Label data-oid="j4o_jeg">任务通知</Label>
                <Switch
                  checked={notificationSettings.taskEnabled}
                  onCheckedChange={(checked) =>
                    updateNotificationSetting('taskEnabled', checked)
                  }
                  disabled={settingsSaving}
                  data-oid=":zli_fj"
                />
              </div>
              <div
                className="flex items-center justify-between"
                data-oid="q0:plu3"
              >
                <Label data-oid="ez.0y_y">事件通知</Label>
                <Switch
                  checked={notificationSettings.eventEnabled}
                  onCheckedChange={(checked) =>
                    updateNotificationSetting('eventEnabled', checked)
                  }
                  disabled={settingsSaving}
                  data-oid="cmxbhsv"
                />
              </div>
              <div
                className="flex items-center justify-between"
                data-oid="6dxk:rq"
              >
                <Label data-oid="6zpbxr7">提醒通知</Label>
                <Switch
                  checked={notificationSettings.reminderEnabled}
                  onCheckedChange={(checked) =>
                    updateNotificationSetting('reminderEnabled', checked)
                  }
                  disabled={settingsSaving}
                  data-oid="5pee0np"
                />
              </div>
              <div
                className="flex items-center justify-between"
                data-oid="1c46g4:"
              >
                <Label data-oid="5digza1">报告通知</Label>
                <Switch
                  checked={notificationSettings.reportEnabled}
                  onCheckedChange={(checked) =>
                    updateNotificationSetting('reportEnabled', checked)
                  }
                  disabled={settingsSaving}
                  data-oid="-lvtr1."
                />
              </div>
              <div data-oid="-.imoso">
                <Label data-oid="ytrk:lv">通知频率</Label>
                <Select
                  value={notificationSettings.frequency}
                  onValueChange={(value) =>
                    updateNotificationSetting('frequency', value)
                  }
                  disabled={settingsSaving}
                  data-oid="w7f_706"
                >
                  <SelectTrigger data-oid="el.2mnh">
                    <SelectValue data-oid=":.9d1ks" />
                  </SelectTrigger>
                  <SelectContent data-oid="qmct8cc">
                    <SelectItem value="IMMEDIATE" data-oid="8ap4j73">
                      立即
                    </SelectItem>
                    <SelectItem value="HOURLY" data-oid="6b-9wz3">
                      每小时
                    </SelectItem>
                    <SelectItem value="DAILY" data-oid="z4adg8x">
                      每天
                    </SelectItem>
                    <SelectItem value="WEEKLY" data-oid="rd1y_5_">
                      每周
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 统计信息 */}
          <Card data-oid="7sau:xp" className="purple-gradient-card">
            <CardHeader data-oid="fhye1lh" className="purple-gradient-card">
              <CardTitle className="purple-gradient-title purple-gradient-card text-lg" data-oid="9748.wa">
                统计信息
              </CardTitle>
            </CardHeader>
            <CardContent data-oid="-emp0_a" className="purple-gradient-card">
              <div className="space-y-3" data-oid="uhh8ml2">
                <div className="flex justify-between" data-oid="_0605hr">
                  <span className="text-sm text-gray-600" data-oid="0hrhw88">
                    未读通知
                  </span>
                  <Badge variant="destructive" data-oid="qi6_qa4">
                    {unreadCount}
                  </Badge>
                </div>
                <div className="flex justify-between" data-oid="-67no2x">
                  <span className="text-sm text-gray-600" data-oid="orpmeh5">
                    未读消息
                  </span>
                  <Badge variant="destructive" data-oid="4tt03zm">
                    {unreadMessageCount}
                  </Badge>
                </div>
                <div className="flex justify-between" data-oid="hfl16w9">
                  <span className="text-sm text-gray-600" data-oid="sxraejk">
                    总数
                  </span>
                  <span className="text-sm font-medium" data-oid="de8au3:">
                    {notifications.length + messages.length}
                  </span>
                </div>
                <div className="flex justify-between" data-oid="2kipg4s">
                  <span className="text-sm text-gray-600" data-oid="n2deab:">
                    今日新增
                  </span>
                  <span className="text-sm font-medium" data-oid="du8xjlx">
                    24
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
