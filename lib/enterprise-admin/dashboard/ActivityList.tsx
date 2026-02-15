'use client';

import React from 'react';
import { ActivityItem } from './types';
import {
  ShoppingCart,
  Users,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
} from 'lucide-react';

interface ActivityListProps {
  activities: ActivityItem[];
  maxItems?: number;
  className?: string;
}

export function ActivityList({
  activities,
  maxItems = 5,
  className = '',
}: ActivityListProps) {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingCart size={16} />;
      case 'user':
        return <Users size={16} />;
      case 'transaction':
        return <CreditCard size={16} />;
      case 'system':
        return <AlertCircle size={16} />;
      default:
        return null;
    }
  };

  const getStatusIcon = (status?: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={14} className="text-green-400" />;
      case 'warning':
        return <AlertTriangle size={14} className="text-yellow-400" />;
      case 'error':
        return <AlertCircle size={14} className="text-red-400" />;
      case 'info':
        return <Info size={14} className="text-blue-400" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order':
        return 'text-blue-400';
      case 'user':
        return 'text-green-400';
      case 'transaction':
        return 'text-purple-400';
      case 'system':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return new Date(date).toLocaleDateString();
  };

  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className={`bg-gray-900 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-white font-semibold mb-4">Recent Activity</h3>

      <div className="space-y-3">
        {displayActivities.length === 0 ? (
          <p className="text-gray-400 text-sm">No recent activities</p>
        ) : (
          displayActivities.map(activity => (
            <div
              key={activity.id}
              className="flex gap-3 p-3 rounded bg-gray-800 hover:bg-gray-750 transition-colors"
            >
              <div className={`flex-shrink-0 mt-1 ${getTypeColor(activity.type)}`}>
                {getIcon(activity.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-white text-sm font-medium truncate">
                      {activity.title}
                    </p>
                    <p className="text-gray-400 text-xs truncate">
                      {activity.description}
                    </p>
                  </div>
                  {activity.status && getStatusIcon(activity.status)}
                </div>
              </div>

              <div className="flex-shrink-0 text-right">
                <p className="text-gray-400 text-xs whitespace-nowrap">
                  {formatTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {activities.length > maxItems && (
        <button className="mt-4 w-full py-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
          View all activities
        </button>
      )}
    </div>
  );
}
