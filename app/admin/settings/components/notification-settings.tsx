"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Loader2 } from "lucide-react";

export default function NotificationSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    emailEnabled: true,
    smsEnabled: false,
    projectUpdates: true,
    taskAssignments: true,
    financialReports: true,
    clientUpdates: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Notification settings saved:", settings);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Bell className="h-5 w-5" />
          通知设置
        </CardTitle>
        <CardDescription className="text-gray-300">
          管理通知偏好
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">邮件通知</Label>
              <p className="text-sm text-gray-400">接收邮件通知</p>
            </div>
            <Switch checked={settings.emailEnabled} onCheckedChange={(checked) => setSettings({ ...settings, emailEnabled: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">短信通知</Label>
              <p className="text-sm text-gray-400">接收短信通知</p>
            </div>
            <Switch checked={settings.smsEnabled} onCheckedChange={(checked) => setSettings({ ...settings, smsEnabled: checked })} />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white">通知类型</h4>
          <div className="flex items-center justify-between">
            <Label className="text-white">项目更新</Label>
            <Switch checked={settings.projectUpdates} onCheckedChange={(checked) => setSettings({ ...settings, projectUpdates: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-white">任务分配</Label>
            <Switch checked={settings.taskAssignments} onCheckedChange={(checked) => setSettings({ ...settings, taskAssignments: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-white">财务报告</Label>
            <Switch checked={settings.financialReports} onCheckedChange={(checked) => setSettings({ ...settings, financialReports: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-white">客户更新</Label>
            <Switch checked={settings.clientUpdates} onCheckedChange={(checked) => setSettings({ ...settings, clientUpdates: checked })} />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
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
