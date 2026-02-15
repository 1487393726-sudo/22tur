"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy, Plus, RefreshCw, Trash2, Webhook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ApiWebhook } from "@/types/api-management";

interface WebhookManagerProps {
  connectionId: string;
  webhooks: ApiWebhook[];
  onCreateWebhook: (data: { name: string; events: string[] }) => Promise<{ webhook: ApiWebhook; secret: string }>;
  onDeleteWebhook: (id: string) => Promise<void>;
  onRegenerateSecret: (id: string) => Promise<string>;
  onRefresh: () => void;
}

const eventOptions = [
  { value: "payment.success", label: "支付成功" },
  { value: "payment.failed", label: "支付失败" },
  { value: "refund.created", label: "退款创建" },
  { value: "subscription.created", label: "订阅创建" },
  { value: "subscription.cancelled", label: "订阅取消" },
  { value: "*", label: "所有事件" },
];

export function WebhookManager({ connectionId, webhooks, onCreateWebhook, onDeleteWebhook, onRegenerateSecret, onRefresh }: WebhookManagerProps) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || selectedEvents.length === 0) return;
    setLoading(true);
    try {
      const result = await onCreateWebhook({ name, events: selectedEvents });
      setNewSecret(result.secret);
      setName("");
      setSelectedEvents([]);
      toast({ title: "Webhook 已创建" });
    } catch { toast({ title: "创建失败", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const handleRegenerate = async (id: string) => {
    setLoading(true);
    try {
      const secret = await onRegenerateSecret(id);
      setNewSecret(secret);
      toast({ title: "密钥已重新生成" });
    } catch { toast({ title: "操作失败", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "已复制" });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Webhooks</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" />创建 Webhook</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建 Webhook</DialogTitle>
              <DialogDescription>配置 Webhook 接收事件通知</DialogDescription>
            </DialogHeader>
            {newSecret ? (
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">请保存此密钥用于验证签名：</p>
                  <div className="flex items-center gap-2">
                    <Input value={newSecret} readOnly className="font-mono text-sm" />
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(newSecret)}><Copy className="h-4 w-4" /></Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => { setNewSecret(null); setDialogOpen(false); onRefresh(); }}>完成</Button>
                </DialogFooter>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>名称</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：支付通知" />
                  </div>
                  <div className="space-y-2">
                    <Label>订阅事件</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {eventOptions.map((opt) => (
                        <div key={opt.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={opt.value}
                            checked={selectedEvents.includes(opt.value)}
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedEvents([...selectedEvents, opt.value]);
                              else setSelectedEvents(selectedEvents.filter((e) => e !== opt.value));
                            }}
                          />
                          <label htmlFor={opt.value} className="text-sm">{opt.label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
                  <Button onClick={handleCreate} disabled={loading || !name.trim() || selectedEvents.length === 0}>创建</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>事件</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">暂无 Webhook</TableCell></TableRow>
            ) : (
              webhooks.map((wh) => (
                <TableRow key={wh.id}>
                  <TableCell className="font-medium"><div className="flex items-center gap-2"><Webhook className="h-4 w-4" />{wh.name}</div></TableCell>
                  <TableCell className="font-mono text-xs max-w-[200px] truncate">{wh.url}</TableCell>
                  <TableCell><div className="flex flex-wrap gap-1">{wh.events.slice(0, 2).map((e) => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}{wh.events.length > 2 && <Badge variant="outline">+{wh.events.length - 2}</Badge>}</div></TableCell>
                  <TableCell><Badge variant={wh.status === "ACTIVE" ? "default" : "secondary"}>{wh.status === "ACTIVE" ? "活跃" : "停用"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(wh.url)} title="复制 URL"><Copy className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleRegenerate(wh.id)} title="重新生成密钥"><RefreshCw className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => onDeleteWebhook(wh.id)} title="删除"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
