"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Download } from "lucide-react";

export default function AuditSettings() {
  const [auditLogs] = useState([
    { id: 1, user: "admin@example.com", action: "登录系统", timestamp: "2024-01-15 14:30:00", status: "成功" },
    { id: 2, user: "user@example.com", action: "修改用户信息", timestamp: "2024-01-15 14:25:00", status: "成功" },
    { id: 3, user: "admin@example.com", action: "删除项目", timestamp: "2024-01-15 14:20:00", status: "成功" },
    { id: 4, user: "user@example.com", action: "登录失败", timestamp: "2024-01-15 14:15:00", status: "失败" },
    { id: 5, user: "admin@example.com", action: "导出数据", timestamp: "2024-01-15 14:10:00", status: "成功" },
  ]);

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Eye className="h-5 w-4" />
          审计日志
        </CardTitle>
        <CardDescription className="text-gray-300">
          查看系统操作记录
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-4 text-gray-400">用户</th>
                <th className="text-left py-2 px-4 text-gray-400">操作</th>
                <th className="text-left py-2 px-4 text-gray-400">时间</th>
                <th className="text-left py-2 px-4 text-gray-400">状态</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-white">{log.user}</td>
                  <td className="py-3 px-4 text-gray-300">{log.action}</td>
                  <td className="py-3 px-4 text-gray-400">{log.timestamp}</td>
                  <td className="py-3 px-4">
                    <Badge className={log.status === "成功" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}>
                      {log.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2">
          <Button className="bg-violet-600 hover:bg-violet-700">
            <Download className="h-4 w-4 mr-2" />
            导出日志
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
