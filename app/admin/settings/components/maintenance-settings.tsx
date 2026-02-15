"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Loader2, Trash2, Zap } from "lucide-react";

export default function MaintenanceSettings() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClearCache = async () => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Cache cleared");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOptimizeDatabase = async () => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      console.log("Database optimized");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCleanupTempFiles = async () => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Temp files cleaned");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Wrench className="h-5 w-5" />
            系统维护
          </CardTitle>
          <CardDescription className="text-gray-300">
            执行系统维护任务
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">清空缓存</p>
                  <p className="text-sm text-gray-400">清除应用程序缓存</p>
                </div>
                <Button onClick={handleClearCache} disabled={isProcessing} className="bg-yellow-600 hover:bg-yellow-700">
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      执行
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">优化数据库</p>
                  <p className="text-sm text-gray-400">优化数据库性能</p>
                </div>
                <Button onClick={handleOptimizeDatabase} disabled={isProcessing} className="bg-yellow-600 hover:bg-yellow-700">
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      执行
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">清理临时文件</p>
                  <p className="text-sm text-gray-400">删除临时文件和日志</p>
                </div>
                <Button onClick={handleCleanupTempFiles} disabled={isProcessing} className="bg-yellow-600 hover:bg-yellow-700">
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      执行
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
