"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TestTube, Edit, Trash2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ApiKeyManager, WebhookManager, ApiStatisticsDashboard } from "@/components/admin/api-management";
import type { ApiConnection, ApiStatistics, ApiWebhook } from "@/types/api-management";

export default function ConnectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [connection, setConnection] = useState<ApiConnection | null>(null);
  const [statistics, setStatistics] = useState<ApiStatistics | null>(null);
  const [dailyStats, setDailyStats] = useState<Array<{ date: string; calls: number; success: number; avgResponseTime: number }>>([]);
  const [keys, setKeys] = useState<Array<{ id: string; name: string; keyPrefix: string; maskedKey: string; status: "ACTIVE" | "REVOKED"; expiresAt?: Date | null; lastUsedAt?: Date | null; createdAt: Date }>>([]);
  const [webhooks, setWebhooks] = useState<ApiWebhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [connRes, keysRes, webhooksRes, statsRes] = await Promise.all([
        fetch(`/api/admin/api-connections/${id}`),
        fetch(`/api/admin/api-keys?connectionId=${id}`),
        fetch(`/api/admin/webhooks?connectionId=${id}`),
        fetch(`/api/admin/api-statistics?connectionId=${id}&daily=true`),
      ]);
      const [connData, keysData, webhooksData, statsData] = await Promise.all([
        connRes.json(), keysRes.json(), webhooksRes.json(), statsRes.json(),
      ]);
      setConnection(connData.connection);
      setKeys(keysData.keys || []);
      setWebhooks(webhooksData.webhooks || []);
      setStatistics(statsData.statistics || null);
      setDailyStats(statsData.dailyStats || []);
    } catch { toast({ title: "加载失败", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [id, toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await fetch(`/api/admin/api-connections/${id}/test`, { method: "POST" });
      const data = await res.json();
      toast({
        title: data.result?.success ? "测试成功" : "测试失败",
        description: data.result?.message,
        variant: data.result?.success ? "default" : "destructive",
      });
      fetchData();
    } finally { setTesting(false); }
  };

  const handleDelete = async () => {
    if (!confirm("确定要删除此连接吗？")) return;
    await fetch(`/api/admin/api-connections/${id}`, { method: "DELETE" });
    toast({ title: "连接已删除" });
    router.push("/admin/api-management");
  };

  const handleCreateKey = async (name: string) => {
    const res = await fetch("/api/admin/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId: id, name }),
    });
    const data = await res.json();
    return { key: data.key, plainKey: data.plainKey };
  };

  const handleRotateKey = async (keyId: string) => {
    const res = await fetch(`/api/admin/api-keys/${keyId}/rotate`, { method: "POST" });
    const data = await res.json();
    return { key: data.key, plainKey: data.plainKey };
  };

  const handleDeleteKey = async (keyId: string) => {
    await fetch(`/api/admin/api-keys/${keyId}`, { method: "DELETE" });
  };

  const handleCreateWebhook = async (data: { name: string; events: string[] }) => {
    const res = await fetch("/api/admin/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, connectionId: id }),
    });
    const result = await res.json();
    return { webhook: result.webhook, secret: result.secret };
  };

  const handleDeleteWebhook = async (whId: string) => {
    await fetch(`/api/admin/webhooks/${whId}`, { method: "DELETE" });
    fetchData();
  };

  const handleRegenerateSecret = async (whId: string) => {
    const res = await fetch(`/api/admin/webhooks/${whId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regenerateSecret: true }),
    });
    const data = await res.json();
    return data.secret;
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">加载中...</div>;
  if (!connection) return <div className="text-center py-12 text-muted-foreground">连接不存在</div>;

  const statusColors = { ACTIVE: "bg-green-500", INACTIVE: "bg-gray-500", ERROR: "bg-red-500" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/api-management")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{connection.name}</h1>
          <p className="text-gray-400">{connection.provider} · {connection.type}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTest} disabled={testing}>
            {testing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <TestTube className="mr-2 h-4 w-4" />}
            测试连接
          </Button>
          <Button variant="outline" onClick={() => router.push(`/admin/api-management?edit=${id}`)}>
            <Edit className="mr-2 h-4 w-4" />编辑
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />删除
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">状态</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${statusColors[connection.status]}`} />
              {connection.status === "ACTIVE" ? "活跃" : connection.status === "INACTIVE" ? "未激活" : "错误"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">环境</CardTitle></CardHeader>
          <CardContent>
            <Badge variant={connection.environment === "PRODUCTION" ? "destructive" : "outline"}>
              {connection.environment === "PRODUCTION" ? "生产" : "沙箱"}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">最后测试</CardTitle></CardHeader>
          <CardContent className="text-sm">
            {connection.lastTestedAt ? new Date(connection.lastTestedAt).toLocaleString("zh-CN") : "从未测试"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">默认连接</CardTitle></CardHeader>
          <CardContent>{connection.isDefault ? <Badge>是</Badge> : <span className="text-muted-foreground">否</span>}</CardContent>
        </Card>
      </div>

      <Tabs defaultValue="keys">
        <TabsList>
          <TabsTrigger value="keys">API 密钥</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="statistics">统计</TabsTrigger>
        </TabsList>
        <TabsContent value="keys" className="mt-4">
          <ApiKeyManager connectionId={id} keys={keys} onCreateKey={handleCreateKey} onRotateKey={handleRotateKey} onDeleteKey={handleDeleteKey} onRefresh={fetchData} />
        </TabsContent>
        <TabsContent value="webhooks" className="mt-4">
          <WebhookManager connectionId={id} webhooks={webhooks} onCreateWebhook={handleCreateWebhook} onDeleteWebhook={handleDeleteWebhook} onRegenerateSecret={handleRegenerateSecret} onRefresh={fetchData} />
        </TabsContent>
        <TabsContent value="statistics" className="mt-4">
          <ApiStatisticsDashboard statistics={statistics} dailyStats={dailyStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
