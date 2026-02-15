import { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "访问被拒绝 | 创意代理",
  description: "您没有权限访问此页面",
}

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Card className="max-w-md w-full mx-4 bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl text-white">访问被拒绝</CardTitle>
          <CardDescription className="text-gray-300">
            您没有权限访问此页面，请联系管理员获取相应权限
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <h3 className="font-semibold text-white mb-2">可能的解决方案：</h3>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• 使用具有管理员权限的账户登录</li>
              <li>• 联系系统管理员分配权限</li>
              <li>• 检查您的账户状态是否正常</li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/admin-login">重新登录</Link>
            </Button>
            <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10">
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}