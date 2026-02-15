"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ApiConnectionList,
  ApiConnectionForm,
  ApiKeyManager,
  WebhookManager,
  ApiStatisticsDashboard,
  TemplateBrowser,
} from "@/components/admin/api-management";
import type { ApiConnection, ApiTemplate, ApiStatistics, ApiWebhook } from "@/types/api-management";

export default function ApiManagementPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("connections");
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<ApiConnection | null>(null);
  const [statistics, setStatistics] = useState<ApiStatistics | null>(null);
  const [dailyStats, setDailyStats] = useState<Array<{ date: string; calls: number; success: number; avgResponseTime: number }>>([]);
  const [keys, setKeys] = useState<Array<{ id: string; name: string; keyPrefix: string; maskedKey: string; status: "ACTIVE" | "REVOKED"; expiresAt?: Date | null; lastUsedAt?: Date | null; createdAt: Date }>>([]);
  const [webhooks, setWebhooks] = useState<ApiWebhook[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState<ApiConnection | undefined>();
  const [loading, setLoading] = useState(false);

  const fetchConnections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/api-connections");
      const data = await res.json();
      setConnections(data.connections || []);
    } catch { toast({ title: "加载失败", variant: "destructive" }); }
    finally { setLoading(false); }
  }, [toast]);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/api-templates");
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch { console.error("Failed to fetch templates"); }
  }, []);

  useEffect(() => { fetchConnections(); fetchTemplates(); }, [fetchConnections, fetchTemplates]);


  const fetchConnectionDetails = async (id: string) => {
    try {
      const [keysRes, webhooksRes, statsRes] = await Promise.all([
        fetch(`/api/admin/api-keys?connectionId=${id}`),
        fetch(`/api/admin/webhooks?connectionId=${id}`),
        fetch(`/api/admin/api-statistics?connectionId=${id}&daily=true`),
      ]);
      const [keysData, webhooksData, statsData] = await Promise.all([keysRes.json(), webhooksRes.json(), statsRes.json()]);
      setKeys(keysData.keys || []);
      setWebhooks(webhooksData.webhooks || []);
      setStatistics(statsData.statistics || null);
      setDailyStats(statsData.dailyStats || []);
    } catch { console.error("Failed to fetch connection details"); }
  };

  const handleSelectConnection = (conn: ApiConnection) => {
    setSelectedConnection(conn);
    fetchConnectionDetails(conn.id);
  };

  const handleCreateConnection = async (data: Parameters<typeof ApiConnectionForm>[0]["onSubmit"] extends (d: infer T) => unknown ? T : never) => {
    const res = await fetch("/api/admin/api-connections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create");
    toast({ title: "连接已创建" });
    setShowForm(false);
    fetchConnections();
  };

  const handleEditConnection = (id: string) => {
    const conn = connections.find((c) => c.id === id);
    setEditingConnection(conn);
    setShowForm(true);
  };

  const handleDeleteConnection = async (id: string) => {
    if (!confirm("确定要删除此连接吗？")) return;
    await fetch(`/api/admin/api-connections/${id}`, { method: "DELETE" });
    toast({ title: "连接已删除" });
    fetchConnections();
    if (selectedConnection?.id === id) setSelectedConnection(null);
  };

  const handleTestConnection = async (id: string) => {
    const res = await fetch(`/api/admin/api-connections/${id}/test`, { method: "POST" });
    const data = await res.json();
    toast({
      title: data.result?.success ? "测试成功" : "测试失败",
      description: data.result?.message,
      variant: data.result?.success ? "default" : "destructive",
    });
    fetchConnections();
  };

  const handleCreateKey = async (name: string) => {
    if (!selectedConnection) throw new Error("No connection selected");
    const res = await fetch("/api/admin/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId: selectedConnection.id, name }),
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
    if (!selectedConnection) throw new Error("No connection selected");
    const res = await fetch("/api/admin/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, connectionId: selectedConnection.id }),
    });
    const result = await res.json();
    return { webhook: result.webhook, secret: result.secret };
  };

  const handleDeleteWebhook = async (id: string) => {
    await fetch(`/api/admin/webhooks/${id}`, { method: "DELETE" });
    if (selectedConnection) fetchConnectionDetails(selectedConnection.id);
  };

  const handleRegenerateSecret = async (id: string) => {
    const res = await fetch(`/api/admin/webhooks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regenerateSecret: true }),
    });
    const data = await res.json();
    return data.secret;
  };

  const handleExport = async () => {
    window.open("/api/admin/api-config/export?download=true", "_blank");
  };

  const handleSelectTemplate = (template: ApiTemplate) => {
    setEditingConnection(undefined);
    setShowForm(true);
    // Template will be pre-selected in the form
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">API 管理</h1>
          <p className="text-gray-300">管理第三方 API 连接、密钥和 Webhooks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <Download className="mr-2 h-4 w-4" />导出配置
          </Button>
          <Button onClick={() => { setEditingConnection(undefined); setShowForm(true); }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />新建连接
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="text-muted-foreground h-9 items-center justify-center rounded-lg p-[3px] bg-white/10 border-white/20 backdrop-blur-sm">
          <TabsTrigger value="connections" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 hover:text-white">连接</TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 hover:text-white">模板</TabsTrigger>
          <TabsTrigger value="statistics" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 hover:text-white">统计</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-6">
          <ApiConnectionList
            connections={connections}
            onEdit={handleEditConnection}
            onDelete={handleDeleteConnection}
            onTest={handleTestConnection}
            onRefresh={fetchConnections}
            loading={loading}
          />

          {selectedConnection && (
            <div className="grid gap-6 lg:grid-cols-2">
              <ApiKeyManager
                connectionId={selectedConnection.id}
                keys={keys}
                onCreateKey={handleCreateKey}
                onRotateKey={handleRotateKey}
                onDeleteKey={handleDeleteKey}
                onRefresh={() => fetchConnectionDetails(selectedConnection.id)}
              />
              <WebhookManager
                connectionId={selectedConnection.id}
                webhooks={webhooks}
                onCreateWebhook={handleCreateWebhook}
                onDeleteWebhook={handleDeleteWebhook}
                onRegenerateSecret={handleRegenerateSecret}
                onRefresh={() => fetchConnectionDetails(selectedConnection.id)}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates">
          <TemplateBrowser templates={templates} onSelectTemplate={handleSelectTemplate} />
        </TabsContent>

        <TabsContent value="statistics">
          <ApiStatisticsDashboard
            statistics={statistics}
            dailyStats={dailyStats}
            connectionId={selectedConnection?.id}
            onConnectionChange={(id) => {
              const conn = connections.find((c) => c.id === id);
              if (conn) handleSelectConnection(conn);
            }}
            connections={connections.map((c) => ({ id: c.id, name: c.name }))}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-primary-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">{editingConnection ? "编辑连接" : "新建连接"}</DialogTitle>
          </DialogHeader>
          <ApiConnectionForm
            connection={editingConnection}
            templates={templates}
            onSubmit={handleCreateConnection}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
