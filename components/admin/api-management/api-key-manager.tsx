"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Copy, Key, RefreshCw, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyData {
  id: string;
  name: string;
  keyPrefix: string;
  maskedKey: string;
  status: "ACTIVE" | "REVOKED";
  expiresAt?: Date | null;
  lastUsedAt?: Date | null;
  createdAt: Date;
}

interface ApiKeyManagerProps {
  connectionId: string;
  keys: ApiKeyData[];
  onCreateKey: (name: string) => Promise<{ key: ApiKeyData; plainKey: string }>;
  onRotateKey: (keyId: string) => Promise<{ key: ApiKeyData; plainKey: string }>;
  onDeleteKey: (keyId: string) => Promise<void>;
  onRefresh: () => void;
}


export function ApiKeyManager({
  connectionId,
  keys,
  onCreateKey,
  onRotateKey,
  onDeleteKey,
  onRefresh,
}: ApiKeyManagerProps) {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newPlainKey, setNewPlainKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    setLoading(true);
    try {
      const result = await onCreateKey(newKeyName);
      setNewPlainKey(result.plainKey);
      setNewKeyName("");
      toast({ title: "API 密钥已创建", description: "请立即保存密钥，它不会再次显示" });
    } catch (error) {
      toast({ title: "创建失败", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRotateKey = async (keyId: string) => {
    setLoading(true);
    try {
      const result = await onRotateKey(keyId);
      setNewPlainKey(result.plainKey);
      toast({ title: "密钥已轮换", description: "旧密钥已失效，请保存新密钥" });
      onRefresh();
    } catch (error) {
      toast({ title: "轮换失败", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async () => {
    if (!deleteKeyId) return;
    setLoading(true);
    try {
      await onDeleteKey(deleteKeyId);
      toast({ title: "密钥已删除" });
      onRefresh();
    } catch (error) {
      toast({ title: "删除失败", variant: "destructive" });
    } finally {
      setLoading(false);
      setDeleteKeyId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "已复制到剪贴板" });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">API 密钥</h3>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              创建密钥
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">创建 API 密钥</DialogTitle>
              <DialogDescription className="text-gray-300">
                创建新的 API 密钥用于认证
              </DialogDescription>
            </DialogHeader>
            {newPlainKey ? (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-200 mb-2">
                    请立即保存此密钥，它不会再次显示！
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={showKey ? newPlainKey : "•".repeat(40)}
                      readOnly
                      className="font-mono text-sm bg-white/10 border-white/20 text-white"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowKey(!showKey)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(newPlainKey)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => { setNewPlainKey(null); setCreateDialogOpen(false); onRefresh(); }} className="bg-blue-600 hover:bg-blue-700">
                    完成
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="keyName" className="text-white">密钥名称</Label>
                  <Input
                    id="keyName"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="例如：生产环境密钥"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    取消
                  </Button>
                  <Button onClick={handleCreateKey} disabled={loading || !newKeyName.trim()} className="bg-blue-600 hover:bg-blue-700">
                    创建
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-white/20 bg-white/5 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white">名称</TableHead>
              <TableHead className="text-white">密钥前缀</TableHead>
              <TableHead className="text-white">状态</TableHead>
              <TableHead className="text-white">最后使用</TableHead>
              <TableHead className="text-white">创建时间</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                  暂无 API 密钥
                </TableCell>
              </TableRow>
            ) : (
              keys.map((key) => (
                <TableRow key={key.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-gray-400" />
                      {key.name}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-gray-300">{key.keyPrefix}...</TableCell>
                  <TableCell>
                    <Badge variant={key.status === "ACTIVE" ? "default" : "secondary"}>
                      {key.status === "ACTIVE" ? "活跃" : "已撤销"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString("zh-CN") : "从未使用"}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(key.createdAt).toLocaleString("zh-CN")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRotateKey(key.id)}
                        disabled={key.status === "REVOKED"}
                        title="轮换密钥"
                        className="text-gray-300 hover:text-white hover:bg-white/10"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteKeyId(key.id)}
                        title="删除密钥"
                        className="text-red-400 hover:text-red-300 hover:bg-white/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteKeyId} onOpenChange={() => setDeleteKeyId(null)}>
        <AlertDialogContent className="bg-slate-900 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">确认删除</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              此操作不可撤销。删除后，使用此密钥的所有请求将失败。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 border-white/20 text-white hover:bg-white/20">取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteKey} className="bg-red-600 hover:bg-red-700">删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
