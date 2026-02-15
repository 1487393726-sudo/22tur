"use client";

import { SupabaseEnhancedDemo } from "@/components/supabase-enhanced-demo";
import { SupabaseStatus } from "@/components/ui/supabase-status";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Database, Shield, Zap, Globe } from "lucide-react";

export default function SupabasePage() {
  return (
    <main className="min-h-screen bg-background" data-oid="op-zd-q">
      <Navbar data-oid="ya.v-qs" />

      <div className="container mx-auto px-4 py-8" data-oid="8vmlpgf">
        <div className="max-w-4xl mx-auto" data-oid="hpnwzsz">
          <div className="text-center mb-8" data-oid="_6wqyuu">
            <div
              className="flex items-center justify-center gap-3 mb-4"
              data-oid="1o1lin3"
            >
              <Database
                className="h-10 w-10 text-blue-600"
                data-oid="_ta847u"
              />
              <h1 className="text-3xl font-bold" data-oid="f16oc58">
                Supabase集成演示
              </h1>
            </div>
            <p className="text-muted-foreground mb-6" data-oid="1j8136b">
              基于PostgreSQL的开源Firebase替代方案，提供完整的后端服务
            </p>

            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
              data-oid=".c6chvb"
            >
              <div
                className="flex flex-col items-center p-4 bg-blue-50 rounded-lg"
                data-oid="cxeakvc"
              >
                <Database
                  className="h-8 w-8 text-blue-600 mb-2"
                  data-oid="b96-xke"
                />
                <span className="text-sm font-medium" data-oid="u3y:d_y">
                  PostgreSQL
                </span>
              </div>
              <div
                className="flex flex-col items-center p-4 bg-green-50 rounded-lg"
                data-oid="hezp-ku"
              >
                <Shield
                  className="h-8 w-8 text-green-600 mb-2"
                  data-oid="o_:2d6z"
                />
                <span className="text-sm font-medium" data-oid="gmwc04i">
                  身份认证
                </span>
              </div>
              <div
                className="flex flex-col items-center p-4 bg-purple-50 rounded-lg"
                data-oid="7lhiwwc"
              >
                <Zap
                  className="h-8 w-8 text-purple-600 mb-2"
                  data-oid="9e:qqw7"
                />
                <span className="text-sm font-medium" data-oid="4a3k2v3">
                  实时API
                </span>
              </div>
              <div
                className="flex flex-col items-center p-4 bg-orange-50 rounded-lg"
                data-oid="qawymga"
              >
                <Globe
                  className="h-8 w-8 text-orange-600 mb-2"
                  data-oid="9j2fv2c"
                />
                <span className="text-sm font-medium" data-oid="ppltpwf">
                  文件存储
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6" data-oid="zmh:a5j">
            <SupabaseStatus data-oid="m-hrhi:" />
            <SupabaseEnhancedDemo data-oid="11s-47c" />
          </div>

          <div className="mt-8 p-6 bg-muted/30 rounded-lg" data-oid="5cx.8hz">
            <h2 className="text-xl font-semibold mb-4" data-oid="u7epwld">
              🚀 Supabase优势
            </h2>
            <div className="grid md:grid-cols-2 gap-6" data-oid="p8qykdu">
              <div data-oid="g03r9zp">
                <h3 className="font-medium mb-2" data-oid="ue7kyqq">
                  ✨ 开发体验
                </h3>
                <ul
                  className="text-sm text-muted-foreground space-y-1"
                  data-oid=".z-6k1q"
                >
                  <li data-oid="4wmxeob">
                    • 类型安全的JavaScript/TypeScript客户端
                  </li>
                  <li data-oid="n1gt.8r">• 自动生成的API文档</li>
                  <li data-oid="ej9nphc">• 实时订阅功能</li>
                  <li data-oid="p.:7en:">• 边缘函数支持</li>
                </ul>
              </div>
              <div data-oid="rrnjb:0">
                <h3 className="font-medium mb-2" data-oid="6pgbtfl">
                  🛡️ 企业级功能
                </h3>
                <ul
                  className="text-sm text-muted-foreground space-y-1"
                  data-oid="2t.e9k9"
                >
                  <li data-oid="9hjox5g">• 行级安全策略(RLS)</li>
                  <li data-oid="0jax1rj">• 数据库备份和恢复</li>
                  <li data-oid="_t54aj.">• 多区域部署</li>
                  <li data-oid="1gfzldx">• 99.99%可用性保证</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer data-oid="qf7q0w7" />
    </main>
  );
}
