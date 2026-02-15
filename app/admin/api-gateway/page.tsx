'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Activity,
  AlertTriangle,
  Clock,
  Code,
  Copy,
  Download,
  FileJson,
  Globe,
  Key,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Zap,
} from 'lucide-react';

interface RouteRule {
  id: string;
  name: string;
  pattern: string;
  methods: string[];
  isActive: boolean;
  priority: number;
  rateLimit?: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  auth?: {
    required: boolean;
    type: string;
    roles?: string[];
  };
}

interface ApiVersion {
  version: string;
  status: 'current' | 'deprecated' | 'sunset';
  deprecationDate?: string;
  sunsetDate?: string;
}

interface GatewayStats {
  totalRequests: number;
  successRate: number;
  avgLatency: number;
  rateLimitedRequests: number;
  authFailedRequests: number;
}

export default function ApiGatewayPage() {
  const [activeTab, setActiveTab] = useState('routes');
  const [routes, setRoutes] = useState<RouteRule[]>([]);
  const [versions, setVersions] = useState<ApiVersion[]>([]);
  const [stats, setStats] = useState<GatewayStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateRoute, setShowCreateRoute] = useState(false);
  const [showOpenAPI, setShowOpenAPI] = useState(false);
  const [openAPIDoc, setOpenAPIDoc] = useState('');
  const [newRoute, setNewRoute] = useState({
    name: '',
    pattern: '',
    methods: ['GET'],
    priority: 100,
    authRequired: false,
    authType: 'jwt',
    rateLimitEnabled: false,
    rateLimitMax: 100,
    rateLimitWindow: 60000,
  });

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 模拟数据加载
      setRoutes([
        {
          id: '1',
          name: 'API v1',
          pattern: '/api/v1/*',
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          isActive: true,
          priority: 100,
          auth: { required: true, type: 'jwt' },
          rateLimit: { enabled: true, maxRequests: 100, windowMs: 60000 },
        },
        {
          id: '2',
          name: 'Public API',
          pattern: '/api/public/*',
          methods: ['GET'],
          isActive: true,
          priority: 90,
          auth: { required: false, type: 'jwt' },
          rateLimit: { enabled: true, maxRequests: 30, windowMs: 60000 },
        },
        {
          id: '3',
          name: 'Admin API',
          pattern: '/api/admin/*',
          methods: ['GET', 'POST', 'PUT', 'DELETE'],
          isActive: true,
          priority: 110,
          auth: { required: true, type: 'jwt', roles: ['ADMIN', 'SUPER_ADMIN'] },
          rateLimit: { enabled: true, maxRequests: 200, windowMs: 60000 },
        },
      ]);

      setVersions([
        { version: 'v1', status: 'current' },
        { version: 'v2', status: 'deprecated', deprecationDate: '2026-06-01', sunsetDate: '2026-12-01' },
      ]);

      setStats({
        totalRequests: 125680,
        successRate: 99.2,
        avgLatency: 45,
        rateLimitedRequests: 234,
        authFailedRequests: 89,
      });
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 切换路由状态
  const toggleRoute = (id: string) => {
    setRoutes(routes.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
  };

  // 生成 OpenAPI 文档
  const generateOpenAPI = async () => {
    try {
      const response = await fetch('/api/admin/api-gateway/openapi');
      const doc = await response.json();
      setOpenAPIDoc(JSON.stringify(doc, null, 2));
      setShowOpenAPI(true);
    } catch (error) {
      // 使用模拟数据
      const mockDoc = {
        openapi: '3.0.3',
        info: {
          title: '创意之旅 API',
          version: '1.0.0',
        },
        paths: {},
      };
      setOpenAPIDoc(JSON.stringify(mockDoc, null, 2));
      setShowOpenAPI(true);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // 下载 OpenAPI 文档
  const downloadOpenAPI = () => {
    const blob = new Blob([openAPIDoc], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'openapi.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">API 网关</h1>
          <p className="text-muted-foreground">管理 API 路由、限流和版本</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateOpenAPI}>
            <FileJson className="h-4 w-4 mr-2" />
            OpenAPI 文档
          </Button>
          <Button onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">总请求数</p>
                <p className="text-2xl font-bold">{stats?.totalRequests.toLocaleString()}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">成功率</p>
                <p className="text-2xl font-bold">{stats?.successRate}%</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">平均延迟</p>
                <p className="text-2xl font-bold">{stats?.avgLatency}ms</p>
              </div>
              <Clock className="h-8 w-8 text-white" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">限流请求</p>
                <p className="text-2xl font-bold">{stats?.rateLimitedRequests}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">认证失败</p>
                <p className="text-2xl font-bold">{stats?.authFailedRequests}</p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="routes">路由规则</TabsTrigger>
          <TabsTrigger value="ratelimit">速率限制</TabsTrigger>
          <TabsTrigger value="versions">API 版本</TabsTrigger>
          <TabsTrigger value="keys">API 密钥</TabsTrigger>
        </TabsList>

        {/* 路由规则 */}
        <TabsContent value="routes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>路由规则</CardTitle>
              <Dialog open={showCreateRoute} onOpenChange={setShowCreateRoute}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    添加规则
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>添加路由规则</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>规则名称</Label>
                      <Input
                        value={newRoute.name}
                        onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                        placeholder="例如: User API"
                      />
                    </div>
                    <div>
                      <Label>路径模式</Label>
                      <Input
                        value={newRoute.pattern}
                        onChange={(e) => setNewRoute({ ...newRoute, pattern: e.target.value })}
                        placeholder="例如: /api/users/*"
                      />
                    </div>
                    <div>
                      <Label>优先级</Label>
                      <Input
                        type="number"
                        value={newRoute.priority}
                        onChange={(e) => setNewRoute({ ...newRoute, priority: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>需要认证</Label>
                      <Switch
                        checked={newRoute.authRequired}
                        onCheckedChange={(v) => setNewRoute({ ...newRoute, authRequired: v })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>启用限流</Label>
                      <Switch
                        checked={newRoute.rateLimitEnabled}
                        onCheckedChange={(v) => setNewRoute({ ...newRoute, rateLimitEnabled: v })}
                      />
                    </div>
                    <Button className="w-full">创建</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routes.map((route) => (
                  <div
                    key={route.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{route.name}</span>
                        <Badge variant={route.isActive ? 'default' : 'secondary'}>
                          {route.isActive ? '启用' : '禁用'}
                        </Badge>
                        <Badge variant="outline">优先级: {route.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-mono">{route.pattern}</p>
                      <div className="flex gap-2">
                        {route.methods.map((m) => (
                          <Badge key={m} variant="outline" className="text-xs">
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {route.auth?.required && (
                          <span className="flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            {route.auth.type}
                          </span>
                        )}
                      </div>
                      <Switch
                        checked={route.isActive}
                        onCheckedChange={() => toggleRoute(route.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 速率限制 */}
        <TabsContent value="ratelimit">
          <Card>
            <CardHeader>
              <CardTitle>速率限制配置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routes.filter(r => r.rateLimit?.enabled).map((route) => (
                  <div
                    key={route.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{route.name}</p>
                      <p className="text-sm text-muted-foreground">{route.pattern}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {route.rateLimit?.maxRequests} 请求 / {(route.rateLimit?.windowMs || 0) / 1000}秒
                      </p>
                      <p className="text-sm text-muted-foreground">
                        滑动窗口限流
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API 版本 */}
        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle>API 版本管理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {versions.map((version) => (
                  <div
                    key={version.version}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-lg font-bold">{version.version}</span>
                      <Badge
                        variant={
                          version.status === 'current'
                            ? 'default'
                            : version.status === 'deprecated'
                            ? 'warning'
                            : 'destructive'
                        }
                      >
                        {version.status === 'current' ? '当前版本' : 
                         version.status === 'deprecated' ? '已弃用' : '已停用'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {version.deprecationDate && (
                        <p>弃用日期: {version.deprecationDate}</p>
                      )}
                      {version.sunsetDate && (
                        <p>停用日期: {version.sunsetDate}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API 密钥 */}
        <TabsContent value="keys">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>API 密钥</CardTitle>
              <Button>
                <Key className="h-4 w-4 mr-2" />
                生成密钥
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Key className="h-12 w-12 mx-auto mb-4" />
                <p>暂无 API 密钥</p>
                <p className="text-sm">点击上方按钮生成新的 API 密钥</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* OpenAPI 文档对话框 */}
      <Dialog open={showOpenAPI} onOpenChange={setShowOpenAPI}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>OpenAPI 文档</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(openAPIDoc)}>
                  <Copy className="h-4 w-4 mr-2" />
                  复制
                </Button>
                <Button size="sm" variant="outline" onClick={downloadOpenAPI}>
                  <Download className="h-4 w-4 mr-2" />
                  下载
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[60vh]">
            <pre className="p-4 bg-muted rounded-lg text-sm font-mono">
              {openAPIDoc}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
