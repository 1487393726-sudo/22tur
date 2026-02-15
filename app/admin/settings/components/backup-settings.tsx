"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Loader2, Download, Upload } from "lucide-react";

export default function BackupSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    backupEnabled: true,
    autoBackup: true,
    backupFrequency: "daily",
    retentionDays: 30,
  });
  const [backupStatus, setBackupStatus] = useState({
    lastBackup: "2024-01-15 02:30:00",
    nextBackup: "2024-01-16 02:30:00",
    size: "245.8 MB",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Backup settings saved:", settings);
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualBackup = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setBackupStatus((prev) => ({
        ...prev,
        lastBackup: new Date().toLocaleString("zh-CN"),
      }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Database className="h-5 w-5" />
            备份设置
          </CardTitle>
          <CardDescription className="text-gray-300">
            配置数据库备份策略
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">启用备份</Label>
                <p className="text-sm text-gray-400">启用自动备份功能</p>
              </div>
              <Switch checked={settings.backupEnabled} onCheckedChange={(checked) => setSettings({ ...settings, backupEnabled: checked })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">自动备份</Label>
                <p className="text-sm text-gray-400">定时自动备份</p>
              </div>
              <Switch checked={settings.autoBackup} onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white">备份频率</Label>
              <Select value={settings.backupFrequency} onValueChange={(value) => setSettings({ ...settings, backupFrequency: value })}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">每小时</SelectItem>
                  <SelectItem value="daily">每天</SelectItem>
                  <SelectItem value="weekly">每周</SelectItem>
                  <SelectItem value="monthly">每月</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="retention-days" className="text-white">保留天数</Label>
              <input id="retention-days" type="number" min="1" max="365" value={settings.retentionDays} onChange={(e) => setSettings({ ...settings, retentionDays: parseInt(e.target.value) })} className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md" placeholder="30" aria-label="备份保留天数" />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={handleSave} disabled={isSaving} className="bg-cyan-600 hover:bg-cyan-700">
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

      <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">备份状态</CardTitle>
          <CardDescription className="text-gray-300">
            查看备份信息
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-gray-400">最后备份</p>
              <p className="text-white font-medium">{backupStatus.lastBackup}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-gray-400">下次备份</p>
              <p className="text-white font-medium">{backupStatus.nextBackup}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-gray-400">备份大小</p>
              <p className="text-white font-medium">{backupStatus.size}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={handleManualBackup} disabled={isSaving} className="bg-cyan-600 hover:bg-cyan-700">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  备份中...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  立即备份
                </>
              )}
            </Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Upload className="h-4 w-4 mr-2" />
              恢复备份
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
