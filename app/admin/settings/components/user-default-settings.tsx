"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Users, Loader2 } from "lucide-react";

export default function UserDefaultSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    defaultRole: "employee",
    defaultDepartment: "general",
    requireEmailVerification: true,
    autoActivateUser: false,
    defaultLanguage: "zh-CN",
    sendWelcomeEmail: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("User default settings saved:", settings);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Users className="h-5 w-5" />
          用户默认设置
        </CardTitle>
        <CardDescription className="text-gray-300">
          配置新用户默认参数
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">默认角色</Label>
            <Select value={settings.defaultRole} onValueChange={(value) => setSettings({ ...settings, defaultRole: value })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">管理员</SelectItem>
                <SelectItem value="manager">经理</SelectItem>
                <SelectItem value="employee">员工</SelectItem>
                <SelectItem value="viewer">查看者</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white">默认部门</Label>
            <Select value={settings.defaultDepartment} onValueChange={(value) => setSettings({ ...settings, defaultDepartment: value })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">通用</SelectItem>
                <SelectItem value="sales">销售</SelectItem>
                <SelectItem value="marketing">市场</SelectItem>
                <SelectItem value="hr">人力资源</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white">默认语言</Label>
            <Select value={settings.defaultLanguage} onValueChange={(value) => setSettings({ ...settings, defaultLanguage: value })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh-CN">中文</SelectItem>
                <SelectItem value="en-US">English</SelectItem>
                <SelectItem value="ja-JP">日本語</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">需要邮箱验证</Label>
              <p className="text-sm text-gray-400">新用户需要验证邮箱</p>
            </div>
            <Switch checked={settings.requireEmailVerification} onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">自动激活用户</Label>
              <p className="text-sm text-gray-400">新用户自动激活</p>
            </div>
            <Switch checked={settings.autoActivateUser} onCheckedChange={(checked) => setSettings({ ...settings, autoActivateUser: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">发送欢迎邮件</Label>
              <p className="text-sm text-gray-400">新用户注册时发送欢迎邮件</p>
            </div>
            <Switch checked={settings.sendWelcomeEmail} onCheckedChange={(checked) => setSettings({ ...settings, sendWelcomeEmail: checked })} />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
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
