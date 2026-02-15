/**
 * AI 助手主页面
 * 集成所有 AI 助手功能的入口页面
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  BarChart3, 
  AlertTriangle, 
  Users, 
  FileText, 
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ProjectSummary {
  id: string;
  name: string;
  completionRate: number;
  totalTasks: number;
  overdueTasks: number;
  teamSize: number;
  lastActivity: Date;
}

interface AIMetrics {
  totalConversations: number;
  totalRecommendations: number;
  appliedRecommendations: number;
  averageResponseTime: number;
  successRate: number;
}

interface RecentActivity {
  id: string;
  type: 'CONVERSATION' | 'RECOMMENDATION' | 'REPORT' | 'ALERT';
  title: string;
  description: string;
  timestamp: Date;
  status: 'SUCCESS' | 'PENDING' | 'ERROR';
}

export default function AIAssistantPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [metrics, setMetrics] = useState<AIMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 加载项目摘要
      const projectsResponse = await fetch('/api/projects?summary=true');
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.projects || []);
      }

      // 加载 AI 指标
      const metricsResponse = await fetch('/api/ai-assistant/metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

      // 加载最近活动
      const activityResponse = await fetch('/api/ai-assistant/activity');
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activities || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = (projectId?: string) => {
    const url = projectId 
      ? `/ai-assistant/chat?projectId=${projectId}`
      : '/ai-assistant/chat';
    router.push(url);
  };

  const handleViewAnalytics = (projectId?: string) => {
    const url = projectId 
      ? `/ai-assistant/dashboard?projectId=${projectId}`
      : '/ai-assistant/dashboard';
    router.push(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI 项目管理助手</h1>
          <p className="text-gray-600 mt-2">
            智能化的项目管理决策支持系统
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleStartConversation()}>
            <MessageSquare className="w-4 h-4 mr-2" />
            开始对话
          </Button>
          <Button variant="outline" onClick={() => router.push('/ai-assistant/config')}>
            <Settings className="w-4 h-4 mr-2" />
            配置
          </Button>
        </div>
      </div>

      {/* AI 指标概览 */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总对话数</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalConversations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI 建议数</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalRecommendations}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.appliedRecommendations} 已采纳
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">响应时间</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageResponseTime.toFixed(1)}s</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">成功率</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.successRate.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">采纳率</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.totalRecommendations > 0 
                  ? ((metrics.appliedRecommendations / metrics.totalRecommendations) * 100).toFixed(1)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 主要内容区域 */}
      <Tabs defaultValue="projects" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">项目概览</TabsTrigger>
          <TabsTrigger value="activity">最近活动</TabsTrigger>
          <TabsTrigger value="features">功能导航</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant={project.completionRate >= 80 ? 'default' : 
                                  project.completionRate >= 50 ? 'secondary' : 'destructive'}>
                      {project.completionRate.toFixed(0)}%
                    </Badge>
                  </div>
                  <CardDescription>
                    {project.totalTasks} 个任务 • {project.teamSize} 人团队
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.overdueTasks > 0 && (
                      <div className="flex items-center text-red-600 text-sm">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        {project.overdueTasks} 个逾期任务
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleStartConversation(project.id)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        AI 对话
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewAnalytics(project.id)}
                      >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        分析
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {projects.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无项目</h3>
                <p className="text-gray-600 text-center mb-4">
                  创建您的第一个项目，开始使用 AI 助手功能
                </p>
                <Button onClick={() => router.push('/projects/new')}>
                  创建项目
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>最近活动</CardTitle>
              <CardDescription>AI 助手的最新操作记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                    <div className="flex-shrink-0">
                      {activity.type === 'CONVERSATION' && <MessageSquare className="w-5 h-5 text-blue-600" />}
                      {activity.type === 'RECOMMENDATION' && <TrendingUp className="w-5 h-5 text-green-600" />}
                      {activity.type === 'REPORT' && <FileText className="w-5 h-5 text-purple-600" />}
                      {activity.type === 'ALERT' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                        <div className="flex items-center space-x-2">
                          {activity.status === 'SUCCESS' && <CheckCircle className="w-4 h-4 text-green-600" />}
                          {activity.status === 'ERROR' && <XCircle className="w-4 h-4 text-red-600" />}
                          {activity.status === 'PENDING' && <Clock className="w-4 h-4 text-yellow-600" />}
                          <span className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                  </div>
                ))}

                {recentActivity.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无活动记录</h3>
                    <p className="text-gray-600">开始使用 AI 助手功能后，活动记录将显示在这里</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => router.push('/ai-assistant/chat')}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                  智能对话
                </CardTitle>
                <CardDescription>
                  与 AI 助手进行自然语言对话，获取项目管理建议
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => router.push('/ai-assistant/dashboard')}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                  分析仪表板
                </CardTitle>
                <CardDescription>
                  查看项目分析、进度预测和风险评估
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => router.push('/ai-assistant/recommendations')}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                  建议管理
                </CardTitle>
                <CardDescription>
                  管理和跟踪 AI 生成的项目优化建议
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => router.push('/ai-assistant/reports')}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-orange-600" />
                  智能报告
                </CardTitle>
                <CardDescription>
                  自动生成项目总结报告和分析文档
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => router.push('/ai-assistant/alerts')}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                  智能警报
                </CardTitle>
                <CardDescription>
                  自动监控项目风险并发送及时警报
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => router.push('/ai-assistant/config')}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-gray-600" />
                  系统配置
                </CardTitle>
                <CardDescription>
                  配置 AI 模型参数和个性化设置
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}