"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, Loader2, Copy, RefreshCw } from "lucide-react";

export default function ApiSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: "主 API 密钥", key: "sk_live_••••••••••••••••", created: "2024-01-01", lastUsed: "2024-01-15" },
    { id: 2, name: "测试 API 密钥", key: "sk_test_••••••••••••••••", created: "2024-01-05", lastUsed: "2024-01-14" },
  ]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("API settings saved");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateKey = () => {
    const newKey = {
      id: apiKeys.length + 1,
      name: `API 密钥 ${apiKeys.length + 1}`,
      key: `sk_live_${Math.random().toString(36).substring(2, 15)}`,
      created: new Date().toLocaleDateString("zh-CN"),
      lastUsed: "-",
    };
    setApiKeys([...apiKeys, newKey]);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Key className="h-5 w-5" />
            API 密钥管理
          </CardTitle>
          <CardDescription className="text-gray-300">
            管理 API 密钥和集成
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white font-medium">{key.name}</p>
                  <p className="text-sm text-gray-400">{key.key}</p>
                  <p className="text-xs text-gray-500 mt-1">创建: {key.created} | 最后使用: {key.lastUsed}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={handleGenerateKey} className="bg-indigo-600 hover:bg-indigo-700">
              <Key className="h-4 w-4 mr-2" />
              生成新密钥
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
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
    </div>
  );
}
