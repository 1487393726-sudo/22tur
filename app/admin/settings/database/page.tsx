"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Database,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  Play,
  AlertTriangle,
  Info,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

// 数据库类型配置
const DATABASE_TYPES = [
  { value: "sqlite", label: "SQLite", icon: "📦", defaultPort: null },
  { value: "postgresql", label: "PostgreSQL", icon: "🐘", defaultPort: 5432 },
  { value: "mysql", label: "MySQL", icon: "🐬", defaultPort: 3306 },
  { value: "mongodb", label: "MongoDB", icon: "🍃", defaultPort: 27017 },
];

// 数据库配置接口
interface DatabaseConfig {
  id: string;
  name: string;
  type: string;
  host: string | null;
  port: number | null;
  database: string;
  username: string | null;
  sslEnabled: boolean;
  poolSize: number;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  connectionStatus?: "connected" | "disconnected" | "testing" | "error";
  lastError?: string;
}

// 表单数据接口
interface FormData {
  name: string;
  type: string;
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  sslEnabled: boolean;
  poolSize: number;
}

const initialFormData: FormData = {
  name: "",
  type: "postgresql",
  host: "localhost",
  port: "5432",
  database: "",
  username: "",
  password: "",
  sslEnabled: false,
  poolSize: 10,
};

export default function DatabaseConfigPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<DatabaseConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<DatabaseConfig | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [deleteConfig, setDeleteConfig] = useState<DatabaseConfig | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // 加载配置列表
  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/database-configs");
      if (response.ok) {
        const data = await response.json();
        setConfigs(data.configs || []);
      }
    } catch (error) {
      console.error("加载数据库配置失败:", error);
      setMessage({ type: "error", text: "加载配置失败" });
    } finally {
      setLoading(false);
    }
  };


  // 打开新建对话框
  const handleCreate = () => {
    setEditingConfig(null);
    setFormData(initialFormData);
    setTestResult(null);
    setIsDialogOpen(true);
  };

  // 打开编辑对话框
  const handleEdit = (config: DatabaseConfig) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      type: config.type,
      host: config.host || "localhost",
      port: config.port?.toString() || "",
      database: config.database,
      username: config.username || "",
      password: "", // 密码不回显
      sslEnabled: config.sslEnabled,
      poolSize: config.poolSize,
    });
    setTestResult(null);
    setIsDialogOpen(true);
  };

  // 数据库类型变更时更新默认端口
  const handleTypeChange = (type: string) => {
    const dbType = DATABASE_TYPES.find((t) => t.value === type);
    setFormData((prev) => ({
      ...prev,
      type,
      port: dbType?.defaultPort?.toString() || "",
      host: type === "sqlite" ? "" : prev.host || "localhost",
    }));
  };

  // 测试连接
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/admin/database-configs/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setTestResult({
        success: data.success,
        message: data.message || (data.success ? "连接成功" : "连接失败"),
      });
    } catch (error) {
      setTestResult({ success: false, message: "测试连接失败" });
    } finally {
      setIsTesting(false);
    }
  };

  // 保存配置
  const handleSave = async () => {
    if (!formData.name || !formData.database) {
      setMessage({ type: "error", text: "请填写必填字段" });
      return;
    }

    setIsSaving(true);
    try {
      const url = editingConfig
        ? `/api/admin/database-configs/${editingConfig.id}`
        : "/api/admin/database-configs";
      const method = editingConfig ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: "success", text: editingConfig ? "配置已更新" : "配置已创建" });
        setIsDialogOpen(false);
        fetchConfigs();
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.error || "保存失败" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "保存失败" });
    } finally {
      setIsSaving(false);
    }
  };

  // 删除配置
  const handleDelete = async () => {
    if (!deleteConfig) return;

    try {
      const response = await fetch(`/api/admin/database-configs/${deleteConfig.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "配置已删除" });
        fetchConfigs();
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.error || "删除失败" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "删除失败" });
    } finally {
      setDeleteConfig(null);
    }
  };

  // 激活配置
  const handleActivate = async (config: DatabaseConfig) => {
    try {
      const response = await fetch(`/api/admin/database-configs/${config.id}/activate`, {
        method: "POST",
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({
          type: "success",
          text: data.requiresRestart
            ? "配置已激活，请重启应用以生效"
            : "配置已激活",
        });
        fetchConfigs();
      } else {
        setMessage({ type: "error", text: data.error || "激活失败" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "激活失败" });
    }
  };

  // 获取连接状态图标
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "disconnected":
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case "testing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  // 获取数据库类型图标
  const getTypeIcon = (type: string) => {
    const dbType = DATABASE_TYPES.find((t) => t.value === type);
    return dbType?.icon || "📦";
  };

  // 清除消息
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);


  return (
    <div className="p-8 space-y-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/settings">
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Database className="h-8 w-8" />
                数据库配置
              </h1>
              <p className="text-gray-300">管理系统数据库连接配置</p>
            </div>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            添加配置
          </Button>
        </div>

        {/* 消息提示 */}
        {message && (
          <Alert
            className={`${
              message.type === "success"
                ? "bg-green-500/20 border-green-500/50"
                : message.type === "error"
                ? "bg-red-500/20 border-red-500/50"
                : "bg-blue-500/20 border-blue-500/50"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : message.type === "error" ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <Info className="h-4 w-4 text-blue-500" />
            )}
            <AlertDescription className="text-white">{message.text}</AlertDescription>
          </Alert>
        )}

        {/* 当前活跃配置 */}
        {configs.find((c) => c.isActive) && (
          <Card className="bg-green-500/10 backdrop-blur-sm border border-green-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-400 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                当前活跃数据库
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const active = configs.find((c) => c.isActive);
                if (!active) return null;
                return (
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{getTypeIcon(active.type)}</span>
                    <div>
                      <p className="text-white font-medium">{active.name}</p>
                      <p className="text-gray-400 text-sm">
                        {active.type === "sqlite"
                          ? active.database
                          : `${active.host}:${active.port}/${active.database}`}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* 配置列表 */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">数据库配置列表</CardTitle>
            <CardDescription className="text-gray-300">
              管理所有数据库连接配置，可以随时切换活跃数据库
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 text-white animate-spin" />
                <span className="ml-2 text-gray-300">加载中...</span>
              </div>
            ) : configs.length === 0 ? (
              <div className="text-center py-8">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">暂无数据库配置</p>
                <Button onClick={handleCreate} className="mt-4">
                  添加第一个配置
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-gray-300">名称</TableHead>
                    <TableHead className="text-gray-300">类型</TableHead>
                    <TableHead className="text-gray-300">连接信息</TableHead>
                    <TableHead className="text-gray-300">状态</TableHead>
                    <TableHead className="text-gray-300">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.id} className="border-white/10">
                      <TableCell className="text-white">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getTypeIcon(config.type)}</span>
                          <div>
                            <p className="font-medium">{config.name}</p>
                            {config.isDefault && (
                              <Badge variant="outline" className="text-xs">
                                默认
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {DATABASE_TYPES.find((t) => t.value === config.type)?.label || config.type}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {config.type === "sqlite" ? (
                          <span className="font-mono text-sm">{config.database}</span>
                        ) : (
                          <span className="font-mono text-sm">
                            {config.host}:{config.port}/{config.database}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {config.isActive ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              活跃
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400">
                              未激活
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!config.isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActivate(config)}
                              className="text-green-400 hover:text-green-300"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(config)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {!config.isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfig(config)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>


        {/* 安装指南 */}
        <Card className="bg-white/10 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Info className="h-5 w-5" />
              数据库安装指南
            </CardTitle>
            <CardDescription className="text-gray-300">
              各数据库的安装和配置说明
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {DATABASE_TYPES.map((db) => (
                <Card key={db.value} className="bg-white/5 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                      <span className="text-2xl">{db.icon}</span>
                      {db.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-gray-400 text-sm">
                      {db.value === "sqlite" && "轻量级嵌入式数据库，无需安装"}
                      {db.value === "postgresql" && "功能强大的开源关系型数据库"}
                      {db.value === "mysql" && "流行的开源关系型数据库"}
                      {db.value === "mongodb" && "灵活的文档型 NoSQL 数据库"}
                    </p>
                    {db.defaultPort && (
                      <p className="text-gray-500 text-xs">默认端口: {db.defaultPort}</p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      asChild
                    >
                      <a
                        href={
                          db.value === "sqlite"
                            ? "https://www.sqlite.org/download.html"
                            : db.value === "postgresql"
                            ? "https://www.postgresql.org/download/"
                            : db.value === "mysql"
                            ? "https://dev.mysql.com/downloads/"
                            : "https://www.mongodb.com/try/download/community"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        下载安装
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 新建/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-primary-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingConfig ? "编辑数据库配置" : "添加数据库配置"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              配置数据库连接参数
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 配置名称 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                配置名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="例如：生产数据库"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            {/* 数据库类型 */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-white">
                数据库类型 <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATABASE_TYPES.map((db) => (
                    <SelectItem key={db.value} value={db.value}>
                      <span className="flex items-center gap-2">
                        <span>{db.icon}</span>
                        {db.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 非 SQLite 的连接参数 */}
            {formData.type !== "sqlite" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="host" className="text-white">
                      主机地址
                    </Label>
                    <Input
                      id="host"
                      value={formData.host}
                      onChange={(e) => setFormData((prev) => ({ ...prev, host: e.target.value }))}
                      placeholder="localhost"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port" className="text-white">
                      端口
                    </Label>
                    <Input
                      id="port"
                      value={formData.port}
                      onChange={(e) => setFormData((prev) => ({ ...prev, port: e.target.value }))}
                      placeholder="5432"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-white">
                      用户名
                    </Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                      placeholder="postgres"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">
                      密码
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      placeholder={editingConfig ? "留空保持不变" : "输入密码"}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 数据库名称 */}
            <div className="space-y-2">
              <Label htmlFor="database" className="text-white">
                {formData.type === "sqlite" ? "数据库文件路径" : "数据库名称"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="database"
                value={formData.database}
                onChange={(e) => setFormData((prev) => ({ ...prev, database: e.target.value }))}
                placeholder={formData.type === "sqlite" ? "./prisma/dev.db" : "mydb"}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            {/* 高级选项 */}
            {formData.type !== "sqlite" && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h4 className="text-sm font-medium text-gray-400">高级选项</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="ssl" className="text-white">
                    启用 SSL
                  </Label>
                  <Switch
                    id="ssl"
                    checked={formData.sslEnabled}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, sslEnabled: checked }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poolSize" className="text-white">
                    连接池大小
                  </Label>
                  <Input
                    id="poolSize"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.poolSize}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, poolSize: parseInt(e.target.value) || 10 }))
                    }
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
            )}

            {/* 测试结果 */}
            {testResult && (
              <Alert
                className={
                  testResult.success
                    ? "bg-green-500/20 border-green-500/50"
                    : "bg-red-500/20 border-red-500/50"
                }
              >
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <AlertDescription className="text-white">{testResult.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="gap-2"
            >
              {isTesting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              测试连接
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={!!deleteConfig} onOpenChange={() => setDeleteConfig(null)}>
        <AlertDialogContent className="bg-primary-900 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">确认删除</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              确定要删除配置 "{deleteConfig?.name}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
