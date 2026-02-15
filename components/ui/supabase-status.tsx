"use client";

import { useSupabase } from "@/hooks/use-supabase";
import {
  Database,
  Server,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SupabaseStatus() {
  const { isReady, isLoggedIn, user, error, supabase } = useSupabase();

  if (error) {
    return (
      <Card className="mb-4 border-red-200 bg-red-50" data-oid="ha0_sgh">
        <CardContent className="p-4" data-oid="0m0rlm9">
          <div className="flex items-center justify-between" data-oid="z5dpr8q">
            <div className="flex items-center gap-3" data-oid="ca5frml">
              <XCircle className="h-5 w-5 text-red-600" data-oid="oigx8h6" />
              <div data-oid="_3_pxx:">
                <p className="font-medium text-red-800" data-oid="wl58_s-">
                  Supabase连接失败
                </p>
                <p className="text-sm text-red-600" data-oid="1gec192">
                  {error}
                </p>
              </div>
            </div>
            <Badge
              variant="destructive"
              className="bg-red-100 text-red-800"
              data-oid="edo0-he"
            >
              未连接
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isReady) {
    return (
      <Card className="mb-4 border-yellow-200 bg-yellow-50" data-oid="1g1auf4">
        <CardContent className="p-4" data-oid="-usg9md">
          <div className="flex items-center justify-between" data-oid="l0mja-_">
            <div className="flex items-center gap-3" data-oid="_ohoqvr">
              <Database
                className="h-5 w-5 text-yellow-600 animate-pulse"
                data-oid="_dsfijl"
              />
              <div data-oid="k_51gql">
                <p className="font-medium text-yellow-800" data-oid="d_c3a-o">
                  正在连接Supabase...
                </p>
                <p className="text-sm text-yellow-600" data-oid="p20e9ub">
                  请稍候
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800"
              data-oid="8cnaafu"
            >
              连接中
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-green-200 bg-green-50" data-oid="3gb_6hn">
      <CardContent className="p-4" data-oid="w1wubyc">
        <div className="flex items-center justify-between" data-oid="52_gav0">
          <div className="flex items-center gap-3" data-oid="x9kau..">
            <Database className="h-5 w-5 text-green-600" data-oid="8362w8v" />
            <div data-oid="k3gxvia">
              <p className="font-medium text-green-800" data-oid="ylk3eme">
                Supabase已连接
              </p>
              <p className="text-sm text-green-600" data-oid="-2cax2a">
                数据库连接正常 • 认证系统就绪
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2" data-oid="bccoff4">
            <CheckCircle
              className="h-4 w-4 text-green-600"
              data-oid="codwjo6"
            />
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800"
              data-oid="_gub:u2"
            >
              {isLoggedIn ? "已登录" : "未登录"}
            </Badge>
          </div>
        </div>

        {user && (
          <div
            className="mt-3 pt-3 border-t border-green-200"
            data-oid="9w0xfqh"
          >
            <div
              className="flex items-center justify-between"
              data-oid="k__n7lc"
            >
              <div className="flex items-center gap-3" data-oid="v-z5psa">
                <User className="h-4 w-4 text-green-600" data-oid="a697a-6" />
                <div data-oid="avq26.2">
                  <p
                    className="text-sm font-medium text-green-800"
                    data-oid="rtgs2h7"
                  >
                    {user.email || "未知用户"}
                  </p>
                  <p className="text-xs text-green-600" data-oid="kdp9u_l">
                    ID: {user.id?.slice(0, 8)}...
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => supabase?.auth.signOut()}
                className="text-red-600 border-red-200 hover:bg-red-50"
                data-oid="q8_g85a"
              >
                登出
              </Button>
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-green-200" data-oid="czgqq.r">
          <div className="text-xs text-green-600" data-oid="m88_e75">
            <p data-oid="5pa8k_z">✅ PostgreSQL数据库</p>
            <p data-oid="xah-g:c">✅ 实时订阅功能</p>
            <p data-oid="wnaw8r2">✅ 身份验证系统</p>
            <p data-oid="g2k72.s">✅ 文件存储服务</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
