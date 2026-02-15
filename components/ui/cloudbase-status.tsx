"use client";

import { useCloudBase } from "@/hooks/use-cloudbase";
import { Cloud, CloudOff, User, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function CloudBaseStatus() {
  const { isReady, isLoggedIn, user, error, isClient } = useCloudBase();

  // 服务器端渲染时显示加载状态
  if (typeof window === "undefined" || !isClient) {
    return (
      <Card className="mb-4 border-gray-200 bg-gray-50" data-oid="eouhc7d">
        <CardContent className="p-4" data-oid="utw8b2w">
          <div className="flex items-center gap-3" data-oid=".gb5ek7">
            <Cloud
              className="h-5 w-5 text-gray-600 animate-pulse"
              data-oid="fikct9f"
            />
            <div data-oid="2ljwf_d">
              <p className="font-medium text-gray-800" data-oid="wxakf6r">
                正在初始化CloudBase...
              </p>
              <p className="text-sm text-gray-600" data-oid=".4-zfz4">
                请稍候
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4 border-red-200 bg-red-50" data-oid="f6cm6k9">
        <CardContent className="p-4" data-oid="ryi-5cv">
          <div className="flex items-center gap-3" data-oid="f2rr_6k">
            <AlertCircle className="h-5 w-5 text-red-600" data-oid="8cdp-3-" />
            <div data-oid="xlh2p8e">
              <p className="font-medium text-red-800" data-oid="gnrhjne">
                CloudBase连接失败
              </p>
              <p className="text-sm text-red-600" data-oid="es_hqsc">
                {error}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isReady) {
    return (
      <Card className="mb-4 border-yellow-200 bg-yellow-50" data-oid="ds42daz">
        <CardContent className="p-4" data-oid="j79g4pl">
          <div className="flex items-center gap-3" data-oid="u4iu:tq">
            <Cloud
              className="h-5 w-5 text-yellow-600 animate-pulse"
              data-oid="0ze7sl3"
            />
            <div data-oid="ajp5lag">
              <p className="font-medium text-yellow-800" data-oid="fkp3_cj">
                正在连接CloudBase...
              </p>
              <p className="text-sm text-yellow-600" data-oid=".::k20c">
                请稍候
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-green-200 bg-green-50" data-oid="ko.h0-6">
      <CardContent className="p-4" data-oid="g4-q9r3">
        <div className="flex items-center justify-between" data-oid="1-hrqr-">
          <div className="flex items-center gap-3" data-oid="wo0est2">
            <Cloud className="h-5 w-5 text-green-600" data-oid="jzsaj8e" />
            <div data-oid="9n_gou5">
              <p className="font-medium text-green-800" data-oid="_zbpxy-">
                CloudBase已连接
              </p>
              <p className="text-sm text-green-600" data-oid="63q:q1-">
                {isLoggedIn ? "用户已登录" : "用户未登录"}
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-2" data-oid="52v6pi1">
              <User className="h-4 w-4 text-green-600" data-oid="_tg:ga2" />
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
                data-oid="cbw7kmy"
              >
                {user.isAnonymous
                  ? "匿名用户"
                  : `用户 ${user.uid?.slice(0, 8)}`}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
