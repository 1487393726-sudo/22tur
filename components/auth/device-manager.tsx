'use client';

// components/auth/device-manager.tsx
// 登录设备管理组件

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  Trash2,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 静态文本
const texts = {
  title: '登录设备',
  description: '管理您账户的登录设备',
  fetchFailed: '获取设备列表失败',
  revoked: '设备已移除',
  revokeFailed: '移除设备失败',
  allRevoked: '已移除所有其他设备',
  revokeAllFailed: '移除所有设备失败',
  revokeAll: '移除所有其他设备',
  revokeAllTitle: '移除所有其他设备',
  revokeAllDescription: '这将使所有其他设备上的登录会话失效。您需要在这些设备上重新登录。',
  confirmRevokeAll: '确认移除',
  noDevices: '没有登录设备',
  current: '当前设备',
  revokeTitle: '移除设备',
  revokeDescription: '这将使该设备上的登录会话失效。',
  confirmRevoke: '确认移除',
  cancel: '取消',
};

interface Device {
  id: string;
  fingerprint: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: {
    country?: string;
    city?: string;
  };
  lastActiveAt: string;
  createdAt: string;
  isCurrent?: boolean;
}

export function DeviceManager() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const dateLocale = zhCN;

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/auth/devices');
      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices || []);
      }
    } catch (error) {
      toast.error(texts.fetchFailed);
    } finally {
      setLoading(false);
    }
  };

  const revokeDevice = async (deviceId: string) => {
    setRevoking(deviceId);
    try {
      const response = await fetch(`/api/auth/devices/${deviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDevices(devices.filter((d) => d.id !== deviceId));
        toast.success(texts.revoked);
      } else {
        const data = await response.json();
        toast.error(data.error || texts.revokeFailed);
      }
    } catch (error) {
      toast.error(texts.revokeFailed);
    } finally {
      setRevoking(null);
    }
  };

  const revokeAllDevices = async () => {
    setRevokingAll(true);
    try {
      const response = await fetch('/api/auth/devices/revoke-all', {
        method: 'POST',
      });

      if (response.ok) {
        // 只保留当前设备
        setDevices(devices.filter((d) => d.isCurrent));
        toast.success(texts.allRevoked);
      } else {
        const data = await response.json();
        toast.error(data.error || texts.revokeAllFailed);
      }
    } catch (error) {
      toast.error(texts.revokeAllFailed);
    } finally {
      setRevokingAll(false);
    }
  };

  const getDeviceIcon = (os: string) => {
    const osLower = os.toLowerCase();
    if (osLower.includes('ios') || osLower.includes('android')) {
      return <Smartphone className="h-5 w-5" />;
    }
    if (osLower.includes('ipad') || osLower.includes('tablet')) {
      return <Tablet className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{texts.title}</CardTitle>
          <CardDescription>{texts.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{texts.title}</CardTitle>
            <CardDescription>{texts.description}</CardDescription>
          </div>
          {devices.length > 1 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={revokingAll}>
                  {revokingAll && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <LogOut className="mr-2 h-4 w-4" />
                  {texts.revokeAll}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{texts.revokeAllTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {texts.revokeAllDescription}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{texts.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={revokeAllDevices}>
                    {texts.confirmRevokeAll}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {devices.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {texts.noDevices}
          </p>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => (
              <div
                key={device.id}
                className="flex items-start gap-4 p-4 border rounded-lg"
              >
                <div className="flex-shrink-0 p-2 bg-muted rounded-full">
                  {getDeviceIcon(device.os)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {device.browser} on {device.os}
                    </span>
                    {device.isCurrent && (
                      <Badge variant="secondary">{texts.current}</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {device.ipAddress}
                    </span>
                    {device.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {[device.location.city, device.location.country]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(device.lastActiveAt), {
                        addSuffix: true,
                        locale: dateLocale,
                      })}
                    </span>
                  </div>
                </div>
                {!device.isCurrent && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={revoking === device.id}
                      >
                        {revoking === device.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{texts.revokeTitle}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {texts.revokeDescription}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{texts.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => revokeDevice(device.id)}>
                          {texts.confirmRevoke}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
