"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2 } from "lucide-react";

export default function EmailSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "your-email@gmail.com",
    smtpPassword: "••••••••",
    fromName: "创意代理公司",
    fromEmail: "noreply@creative-agency.com",
    replyTo: "support@creative-agency.com",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Email settings saved:", settings);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Mail className="h-5 w-5" />
          邮件配置
        </CardTitle>
        <CardDescription className="text-gray-300">
          配置 SMTP 邮件服务
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">SMTP 主机</Label>
            <Input value={settings.smtpHost} onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })} className="bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <Label className="text-white">SMTP 端口</Label>
            <Input type="number" value={settings.smtpPort} onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) })} className="bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <Label className="text-white">SMTP 用户名</Label>
            <Input value={settings.smtpUser} onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })} className="bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <Label className="text-white">SMTP 密码</Label>
            <Input type="password" value={settings.smtpPassword} onChange={(e) => setSettings({ ...settings, smtpPassword: e.target.value })} className="bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <Label className="text-white">发件人名称</Label>
            <Input value={settings.fromName} onChange={(e) => setSettings({ ...settings, fromName: e.target.value })} className="bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <Label className="text-white">发件人邮箱</Label>
            <Input type="email" value={settings.fromEmail} onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })} className="bg-white/10 border-white/20 text-white" />
          </div>
          <div className="md:col-span-2">
            <Label className="text-white">回复地址</Label>
            <Input type="email" value={settings.replyTo} onChange={(e) => setSettings({ ...settings, replyTo: e.target.value })} className="bg-white/10 border-white/20 text-white" />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button className="bg-pink-600 hover:bg-pink-700">测试连接</Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-pink-600 hover:bg-pink-700">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              "保存"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
