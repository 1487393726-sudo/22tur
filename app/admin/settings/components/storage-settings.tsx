"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HardDrive, Loader2 } from "lucide-react";

export default function StorageSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    maxFileSize: 100,
    maxUploadSize: 1000,
    allowedFormats: "pdf,doc,docx,xls,xlsx,jpg,png,gif",
    storagePath: "/uploads",
    enableCompression: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Storage settings saved:", settings);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <HardDrive className="h-5 w-5" />
          存储设置
        </CardTitle>
        <CardDescription className="text-gray-300">
          配置文件存储和上传限制
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">单个文件最大大小 (MB)</Label>
            <Input type="number" value={settings.maxFileSize} onChange={(e) => setSettings({ ...settings, maxFileSize: parseInt(e.target.value) })} className="bg-white/10 border-white/20 text-white" />
          </div>
          <div>
            <Label className="text-white">总上传大小限制 (MB)</Label>
            <Input type="number" value={settings.maxUploadSize} onChange={(e) => setSettings({ ...settings, maxUploadSize: parseInt(e.target.value) })} className="bg-white/10 border-white/20 text-white" />
          </div>
          <div className="md:col-span-2">
            <Label className="text-white">允许的文件格式</Label>
            <Input value={settings.allowedFormats} onChange={(e) => setSettings({ ...settings, allowedFormats: e.target.value })} className="bg-white/10 border-white/20 text-white" placeholder="pdf,doc,docx,jpg,png" />
          </div>
          <div className="md:col-span-2">
            <Label className="text-white">存储路径</Label>
            <Input value={settings.storagePath} onChange={(e) => setSettings({ ...settings, storagePath: e.target.value })} className="bg-white/10 border-white/20 text-white" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="bg-orange-600 hover:bg-orange-700">
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
