"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FileText, Loader2, Trash2 } from "lucide-react";

export default function LogSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    logLevel: "info",
    enableFileLogging: true,
    enableDatabaseLogging: true,
    retentionDays: 30,
    maxLogSize: 100,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Log settings saved:", settings);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="h-5 w-5" />
          日志设置
        </CardTitle>
        <CardDescription className="text-gray-300">
          配置系统日志记录
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">日志级别</Label>
            <Select value={settings.logLevel} onValueChange={(value) => setSettings({ ...settings, logLevel: value })}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debug">Debug</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warn</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="retention-days-log" className="text-white">日志保留天数</Label>
            <input id="retention-days-log" type="number" min="1" max="365" value={settings.retentionDays} onChange={(e) => setSettings({ ...settings, retentionDays: parseInt(e.target.value) })} className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md" placeholder="30" aria-label="日志保留天数" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">文件日志</Label>
              <p className="text-sm text-gray-400">保存日志到文件</p>
            </div>
            <Switch checked={settings.enableFileLogging} onCheckedChange={(checked) => setSettings({ ...settings, enableFileLogging: checked })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">数据库日志</Label>
              <p className="text-sm text-gray-400">保存日志到数据库</p>
            </div>
            <Switch checked={settings.enableDatabaseLogging} onCheckedChange={(checked) => setSettings({ ...settings, enableDatabaseLogging: checked })} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button className="bg-red-600 hover:bg-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            清空日志
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-red-600 hover:bg-red-700">
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
