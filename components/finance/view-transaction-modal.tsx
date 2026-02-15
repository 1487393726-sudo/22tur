"use client";

import {
  Calendar,
  DollarSign,
  Building2,
  FileText,
  User,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge as BadgeComponent } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@prisma/client";

import { TransactionType } from "@/types";

interface TransactionWithRelations extends Transaction {
  client?: {
    name: string;
  };
  project?: {
    name: string;
  };
}

interface ViewTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionWithRelations | null;
}

export function ViewTransactionModal({
  open,
  onOpenChange,
  transaction,
}: ViewTransactionModalProps) {
  if (!transaction) return null;

  const getTypeBadge = (type: TransactionType) => {
    const typeConfig: Record<
      TransactionType,
      { label: string; className: string; icon: React.ReactNode }
    > = {
      INCOME: {
        label: "收入",
        className: "bg-green-100 text-green-800",
        icon: <TrendingUp className="w-4 h-4" data-oid="o2ti:oi" />,
      },
      EXPENSE: {
        label: "支出",
        className: "bg-red-100 text-red-800",
        icon: <TrendingDown className="w-4 h-4" data-oid="2km4ocx" />,
      },
    };

    const config = typeConfig[type];
    return (
      <BadgeComponent className={config.className} data-oid="d7ufxea">
        {config.icon}
        <span className="ml-1" data-oid="q3nm36u">
          {config.label}
        </span>
      </BadgeComponent>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-oid="aheke4t">
      <DialogContent className="sm:max-w-[600px]" data-oid="r:ocx8r">
        <DialogHeader data-oid="-zl:zc7">
          <DialogTitle className="flex items-center gap-2" data-oid="laouy0g">
            <DollarSign className="w-5 h-5" data-oid="lkh3v_d" />
            收支记录详情
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6" data-oid="axmc7gm">
          {/* 基本信息 */}
          <Card data-oid="r5vyvap">
            <CardHeader data-oid="z-ospgu">
              <CardTitle className="text-lg" data-oid="d1_zmh8">
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" data-oid=":rkdzt:">
              <div
                className="flex items-center justify-between"
                data-oid="tvwxqgi"
              >
                <div className="flex items-center gap-2" data-oid="sz94ztr">
                  <span className="text-sm text-gray-600" data-oid="ug57dk6">
                    类型:
                  </span>
                  {getTypeBadge(transaction.type as TransactionType)}
                </div>
                <div
                  className={`text-2xl font-bold ${
                    transaction.type === "INCOME"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                  data-oid="z-l4rv8"
                >
                  {transaction.type === "INCOME" ? "+" : "-"}¥
                  {transaction.amount.toLocaleString()}
                </div>
              </div>

              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                data-oid="tox9g5l"
              >
                <div className="flex items-center gap-2" data-oid="3y37hs5">
                  <Calendar
                    className="w-4 h-4 text-gray-500"
                    data-oid="ydtn1d:"
                  />
                  <span className="text-sm text-gray-600" data-oid="35vrb:4">
                    日期:
                  </span>
                  <span className="text-sm font-medium" data-oid="ec18_ei">
                    {new Date(transaction.date).toLocaleDateString("zh-CN")}
                  </span>
                </div>

                <div className="flex items-center gap-2" data-oid="odta.y0">
                  <FileText
                    className="w-4 h-4 text-gray-500"
                    data-oid="umqxp4m"
                  />
                  <span className="text-sm text-gray-600" data-oid="qgbqj96">
                    类别:
                  </span>
                  <BadgeComponent variant="outline" data-oid="hioi5y2">
                    {transaction.category}
                  </BadgeComponent>
                </div>
              </div>

              {transaction.description && (
                <div data-oid="6h5ralw">
                  <p className="text-sm text-gray-600 mb-2" data-oid="2qsfzxl">
                    描述:
                  </p>
                  <p
                    className="text-sm bg-gray-50 p-3 rounded"
                    data-oid="bkxkjqi"
                  >
                    {transaction.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 关联信息 */}
          <Card data-oid="q.qm3ei">
            <CardHeader data-oid="dyh4686">
              <CardTitle className="text-lg" data-oid="gneqmtf">
                关联信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" data-oid="t7:rsk:">
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                data-oid="loi:rpm"
              >
                {transaction.client && (
                  <div data-oid="99yyt3b">
                    <p
                      className="text-sm text-gray-600 mb-1"
                      data-oid="quuqd0h"
                    >
                      关联客户:
                    </p>
                    <div className="flex items-center gap-2" data-oid="li1y97f">
                      <Building2
                        className="w-4 h-4 text-gray-500"
                        data-oid="6uq3p6p"
                      />
                      <span className="font-medium" data-oid="02z9ek3">
                        {transaction.client.name}
                      </span>
                    </div>
                  </div>
                )}

                {transaction.project && (
                  <div data-oid="w6crsox">
                    <p
                      className="text-sm text-gray-600 mb-1"
                      data-oid="c.ek2.k"
                    >
                      关联项目:
                    </p>
                    <div className="flex items-center gap-2" data-oid="36ccpju">
                      <FileText
                        className="w-4 h-4 text-gray-500"
                        data-oid="lx-ec2o"
                      />
                      <span className="font-medium" data-oid="kun_-co">
                        {transaction.project.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {!transaction.client && !transaction.project && (
                <p className="text-sm text-gray-500 italic" data-oid="yui9lrl">
                  无关联的客户或项目
                </p>
              )}
            </CardContent>
          </Card>

          {/* 创建信息 */}
          <Card data-oid="u8wfe3u">
            <CardHeader data-oid="5jpcy5q">
              <CardTitle className="text-lg" data-oid="gd0ovq-">
                记录信息
              </CardTitle>
            </CardHeader>
            <CardContent data-oid="oed9etz">
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                data-oid="pj9uuv0"
              >
                <div className="flex items-center gap-2" data-oid="azlp3u:">
                  <Calendar
                    className="w-4 h-4 text-gray-500"
                    data-oid="4rrlstj"
                  />
                  <span className="text-sm text-gray-600" data-oid="7kad0es">
                    创建时间:
                  </span>
                  <span className="text-sm" data-oid="r1ebyox">
                    {new Date(transaction.createdAt).toLocaleString("zh-CN")}
                  </span>
                </div>

                <div className="flex items-center gap-2" data-oid="m.qgbis">
                  <Calendar
                    className="w-4 h-4 text-gray-500"
                    data-oid="0yj3k:i"
                  />
                  <span className="text-sm text-gray-600" data-oid="o18xd_j">
                    更新时间:
                  </span>
                  <span className="text-sm" data-oid="jeg8u-s">
                    {new Date(transaction.updatedAt).toLocaleString("zh-CN")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
