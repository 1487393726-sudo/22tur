"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import type { ApiConnection, ApiTemplate, ConnectionType } from "@/types/api-management";

interface ApiConnectionFormProps {
  connection?: ApiConnection;
  templates: ApiTemplate[];
  onSubmit: (data: {
    name: string;
    type: ConnectionType;
    provider: string;
    environment: "SANDBOX" | "PRODUCTION";
    baseUrl?: string;
    config: Record<string, unknown>;
    isDefault?: boolean;
  }) => Promise<void>;
  onCancel: () => void;
}

const typeOptions: { value: ConnectionType; label: string }[] = [
  { value: "PAYMENT", label: "支付网关" },
  { value: "EMAIL", label: "邮件服务" },
  { value: "SMS", label: "短信服务" },
  { value: "STORAGE", label: "云存储" },
  { value: "CUSTOM", label: "自定义" },
];


export function ApiConnectionForm({
  connection,
  templates,
  onSubmit,
  onCancel,
}: ApiConnectionFormProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(connection?.name || "");
  const [type, setType] = useState<ConnectionType>(connection?.type || "PAYMENT");
  const [provider, setProvider] = useState(connection?.provider || "");
  const [environment, setEnvironment] = useState<"SANDBOX" | "PRODUCTION">(
    connection?.environment || "SANDBOX"
  );
  const [baseUrl, setBaseUrl] = useState(connection?.baseUrl || "");
  const [isDefault, setIsDefault] = useState(connection?.isDefault || false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [configJson, setConfigJson] = useState("{}");

  const filteredTemplates = templates.filter((t) => t.type === type);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setProvider(template.provider);
      setName(template.name);
      setConfigJson(template.defaultConfig);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let config: Record<string, unknown> = {};
      try {
        config = JSON.parse(configJson);
      } catch {
        alert("配置 JSON 格式无效");
        setLoading(false);
        return;
      }

      await onSubmit({
        name,
        type,
        provider,
        environment,
        baseUrl: baseUrl || undefined,
        config,
        isDefault,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{connection ? "编辑连接" : "新建连接"}</CardTitle>
          <CardDescription>
            配置第三方 API 连接信息
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!connection && filteredTemplates.length > 0 && (
            <div className="space-y-2">
              <Label>使用模板（可选）</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="选择模板快速配置" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} - {template.provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">连接名称 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：Stripe 支付"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">类型 *</Label>
              <Select value={type} onValueChange={(v) => setType(v as ConnectionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider">提供商 *</Label>
              <Input
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="例如：stripe, sendgrid"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="environment">环境 *</Label>
              <Select
                value={environment}
                onValueChange={(v) => setEnvironment(v as "SANDBOX" | "PRODUCTION")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SANDBOX">沙箱 (测试)</SelectItem>
                  <SelectItem value="PRODUCTION">生产</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseUrl">API 基础 URL（可选）</Label>
            <Input
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="config">配置 (JSON) *</Label>
            <Textarea
              id="config"
              value={configJson}
              onChange={(e) => setConfigJson(e.target.value)}
              placeholder='{"apiKey": "your-api-key", "secretKey": "your-secret"}'
              rows={6}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              输入 API 凭据和配置，将被加密存储
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isDefault"
              checked={isDefault}
              onCheckedChange={setIsDefault}
            />
            <Label htmlFor="isDefault">设为默认连接</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {connection ? "保存更改" : "创建连接"}
        </Button>
      </div>
    </form>
  );
}
