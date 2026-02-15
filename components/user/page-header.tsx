"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: string;
  actions?: React.ReactNode;
  stats?: Array<{
    label: string;
    value: string;
    icon?: LucideIcon;
    color?: string;
  }>;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  badge,
  actions,
  stats,
}: PageHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {Icon && (
            <div className="p-3 bg-blue-600/10 rounded-xl">
              <Icon className="w-8 h-8 text-blue-400" />
            </div>
          )}
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              {badge && (
                <Badge className="bg-red-500 text-white">
                  {badge}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-slate-400 mt-1">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>

      {/* Stats Section */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                {stat.icon && (
                  <div className={`p-2 rounded-lg ${stat.color || 'bg-slate-700'}`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}