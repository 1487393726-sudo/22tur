"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Lock,
  Bell,
  Globe,
  CreditCard,
  Shield,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Loader2,
  Check,
  Camera,
  Save,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { dashboardStyles } from "@/lib/dashboard-styles";
import { formatDate } from "@/lib/dashboard-utils";
import { useDashboardTranslations, type DashboardLocale } from "@/lib/i18n/use-dashboard-translations";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  phone?: string;
  avatar?: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
}

interface NotificationPrefs {
  emailNotifications: boolean;
  pushNotifications: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
}

const languages = [
  { value: "zh", label: "简体中文" },
  { value: "zh-TW", label: "繁體中文" },
  { value: "ug", label: "ئۇيغۇرچە" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const { locale, setLocale, t } = useDashboardTranslations();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    promotions: false,
    newsletter: true,
  });
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    bio: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    showOnlineStatus: true,
    allowSearchEngineIndex: false,
    allowMessages: true,
  });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [devices, setDevices] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    type: 'CREDIT_CARD',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    isDefault: false,
  });

  useEffect(() => {
    fetchUserProfile();
    fetchNotificationPrefs();
    fetchPrivacySettings();
    fetch2FAStatus();
    fetchDevices();
    fetchPaymentMethods();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProfileForm({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
          city: data.user.city || "",
          country: data.user.country || "",
          bio: data.user.bio || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationPrefs = async () => {
    try {
      const res = await fetch("/api/user/notification-preferences");
      if (res.ok) {
        const data = await res.json();
        if (data.preferences) {
          setNotifications(data.preferences);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notification preferences:", error);
    }
  };

  const fetchPrivacySettings = async () => {
    try {
      const res = await fetch("/api/user/privacy-settings");
      if (res.ok) {
        const data = await res.json();
        if (data.privacySettings) {
          setPrivacySettings(data.privacySettings);
        }
      }
    } catch (error) {
      console.error("Failed to fetch privacy settings:", error);
    }
  };

  const fetch2FAStatus = async () => {
    try {
      const res = await fetch("/api/user/2fa/status");
      if (res.ok) {
        const data = await res.json();
        setTwoFactorEnabled(data.enabled);
      }
    } catch (error) {
      console.error("Failed to fetch 2FA status:", error);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await fetch("/api/user/devices");
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices || []);
      }
    } catch (error) {
      console.error("Failed to fetch devices:", error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch("/api/user/payment-methods");
      if (res.ok) {
        const data = await res.json();
        setPaymentMethods(data.paymentMethods || []);
      }
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) {
        await fetchUserProfile();
        alert(t("profile.saveSuccess"));
      } else {
        alert(t("profile.saveFailed"));
      }
    } catch (error) {
      alert(t("profile.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      });
      if (res.ok) {
        alert(t("notifications.saveSuccess"));
      }
    } catch (error) {
      alert(t("notifications.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacySettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/privacy-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(privacySettings),
      });
      if (res.ok) {
        alert(t("privacy.saveSuccess"));
      } else {
        alert(t("privacy.saveFailed"));
      }
    } catch (error) {
      alert(t("privacy.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert(t("account.passwordMismatch"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      if (res.ok) {
        alert(t("account.passwordSuccess"));
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const data = await res.json();
        alert(data.error || t("account.passwordFailed"));
      }
    } catch (error) {
      alert(t("account.passwordFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert(t("avatar.invalidFormat"));
      return;
    }

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      alert(t("avatar.fileTooLarge"));
      return;
    }

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        alert(t("avatar.uploadSuccess"));
      } else {
        const data = await res.json();
        alert(data.error || t("avatar.uploadFailed"));
      }
    } catch (error) {
      alert(t("avatar.uploadFailed"));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const res = await fetch('/api/user/2fa/enable', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setQrCode(data.qrCode);
        setBackupCodes(data.backupCodes);
        setTwoFactorSetup(true);
      } else {
        alert(t("security.twoFactor.enableFailed"));
      }
    } catch (error) {
      alert(t("security.twoFactor.enableFailed"));
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode) {
      alert(t("security.twoFactor.enterCode"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/user/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });
      if (res.ok) {
        setTwoFactorEnabled(true);
        setTwoFactorSetup(false);
        setVerificationCode('');
        alert(t("security.twoFactor.enabled"));
      } else {
        const data = await res.json();
        alert(data.error || t("security.twoFactor.invalidCode"));
      }
    } catch (error) {
      alert(t("security.twoFactor.verifyFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDisable2FA = async () => {
    const password = prompt(t("security.twoFactor.enterPasswordToDisable"));
    if (!password) return;

    setSaving(true);
    try {
      const res = await fetch('/api/user/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setTwoFactorEnabled(false);
        alert(t("security.twoFactor.disabled"));
      } else {
        const data = await res.json();
        alert(data.error || t("security.twoFactor.disableFailed"));
      }
    } catch (error) {
      alert(t("security.twoFactor.disableFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    if (!confirm(t("security.devices.confirmRevoke"))) return;

    try {
      const res = await fetch(`/api/user/devices/${deviceId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchDevices();
        alert(t("security.devices.revoked"));
      } else {
        alert(t("security.devices.revokeFailed"));
      }
    } catch (error) {
      alert(t("security.devices.revokeFailed"));
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!paymentForm.cardNumber || !paymentForm.cardHolder || !paymentForm.expiryDate) {
      alert(t("billing.payment.fillRequired"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/user/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm),
      });
      if (res.ok) {
        await fetchPaymentMethods();
        setPaymentForm({
          type: 'CREDIT_CARD',
          cardNumber: '',
          cardHolder: '',
          expiryDate: '',
          isDefault: false,
        });
        setShowPaymentForm(false);
        alert(t("billing.payment.added"));
      } else {
        alert(t("billing.payment.addFailed"));
      }
    } catch (error) {
      alert(t("billing.payment.addFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    if (!confirm(t("billing.payment.confirmDelete"))) return;

    try {
      const res = await fetch(`/api/user/payment-methods/${methodId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchPaymentMethods();
        alert(t("billing.payment.deleted"));
      } else {
        alert(t("billing.payment.deleteFailed"));
      }
    } catch (error) {
      alert(t("billing.payment.deleteFailed"));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} icon="⚙️" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧用户信息卡片 */}
        <Card className={`lg:col-span-1 ${dashboardStyles.card.base}`}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full cursor-pointer"
                    disabled={avatarUploading}
                    asChild
                  >
                    <span>
                      {avatarUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    </span>
                  </Button>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  disabled={avatarUploading}
                  className="hidden"
                />
              </div>
              <h3 className="font-semibold text-lg">{user?.firstName} {user?.lastName}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="secondary" className="mt-2">{user?.role === "ADMIN" ? t("userCard.admin") : t("userCard.user")}</Badge>
              
              <Separator className="my-4" />
              
              <div className="w-full space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{t("userCard.registeredAt")} {user?.createdAt ? formatDate(user.createdAt) : t("userCard.unknown")}</span>
                </div>
                {user?.lastLoginAt && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>{t("userCard.lastLogin")} {formatDate(user.lastLoginAt)}</span>
                  </div>
                )}
                {user?.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {(user?.city || user?.country) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{[user?.city, user?.country].filter(Boolean).join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 右侧设置标签页 */}
        <Card className={`lg:col-span-3 ${dashboardStyles.card.base}`}>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 mb-6">
                <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4 hidden sm:block" />{t("tabs.profile")}</TabsTrigger>
                <TabsTrigger value="account" className="gap-2"><Shield className="h-4 w-4 hidden sm:block" />{t("tabs.account")}</TabsTrigger>
                <TabsTrigger value="security" className="gap-2"><Lock className="h-4 w-4 hidden sm:block" />{t("security.title")}</TabsTrigger>
                <TabsTrigger value="billing" className="gap-2"><CreditCard className="h-4 w-4 hidden sm:block" />{t("tabs.billing")}</TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4 hidden sm:block" />{t("tabs.notifications")}</TabsTrigger>
                <TabsTrigger value="privacy" className="gap-2"><Shield className="h-4 w-4 hidden sm:block" />{t("privacy.title")}</TabsTrigger>
                <TabsTrigger value="language" className="gap-2"><Globe className="h-4 w-4 hidden sm:block" />{t("tabs.language")}</TabsTrigger>
              </TabsList>

              {/* 个人资料 */}
              <TabsContent value="profile" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t("profile.title")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t("profile.firstName")}</Label>
                      <Input id="firstName" value={profileForm.firstName} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t("profile.lastName")}</Label>
                      <Input id="lastName" value={profileForm.lastName} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("profile.phone")}</Label>
                      <Input id="phone" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">{t("profile.country")}</Label>
                      <Input id="country" value={profileForm.country} onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">{t("profile.city")}</Label>
                      <Input id="city" value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">{t("profile.address")}</Label>
                      <Input id="address" value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="bio">{t("profile.bio")}</Label>
                    <textarea id="bio" className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm" value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder={t("profile.bioPlaceholder")} />
                  </div>
                  <Button onClick={handleSaveProfile} disabled={saving} className="mt-4 gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {t("profile.saveChanges")}
                  </Button>
                </div>
              </TabsContent>

              {/* 账户安全 */}
              <TabsContent value="account" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t("account.changePassword")}</h3>
                  <div className="space-y-4 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">{t("account.currentPassword")}</Label>
                      <Input id="currentPassword" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">{t("account.newPassword")}</Label>
                      <Input id="newPassword" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t("account.confirmPassword")}</Label>
                      <Input id="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                    </div>
                    <Button onClick={handleChangePassword} disabled={saving}>{t("account.changePasswordBtn")}</Button>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t("account.accountStatus")}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{t("account.emailVerification")}</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <Badge variant="default" className="gap-1"><Check className="h-3 w-3" />{t("account.verified")}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{t("account.statusTitle")}</p>
                          <p className="text-sm text-muted-foreground">{t("account.statusNormal")}</p>
                        </div>
                      </div>
                      <Badge variant="default">{user?.status === "ACTIVE" ? t("account.normal") : user?.status}</Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 安全设置 */}
              <TabsContent value="security" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t("security.loginHistory")}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{t("security.lastLogin")}</p>
                          <p className="text-sm text-muted-foreground">{user?.lastLoginAt ? formatDate(user.lastLoginAt) : t("security.firstLogin")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t("security.twoFactor.title")}</h3>
                  {!twoFactorSetup ? (
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{t("security.twoFactor.enable")}</p>
                        <p className="text-sm text-muted-foreground">
                          {twoFactorEnabled ? t("security.twoFactor.enabled") : t("security.twoFactor.description")}
                        </p>
                      </div>
                      <Button 
                        variant={twoFactorEnabled ? "destructive" : "outline"}
                        onClick={twoFactorEnabled ? handleDisable2FA : handleEnable2FA}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {twoFactorEnabled ? t("security.twoFactor.disable") : t("security.twoFactor.enable")}
                      </Button>
                    </div>
                  ) : (
                    <Card className="bg-muted/30">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <p className="font-medium mb-3">{t("security.twoFactor.scanQR")}</p>
                            {qrCode && (
                              <div className="flex justify-center mb-4">
                                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium mb-2">{t("security.twoFactor.manualEntry")}</p>
                            <Input value={qrCode ? '已生成' : ''} disabled className="mb-4" />
                          </div>
                          <div>
                            <p className="font-medium mb-2">{t("security.twoFactor.enterCodeLabel")}</p>
                            <Input 
                              placeholder={t("security.twoFactor.codePlaceholder")}
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              maxLength={6}
                              className="mb-4"
                            />
                          </div>
                          <div>
                            <p className="font-medium mb-2">{t("security.twoFactor.backupCodes")}</p>
                            <div className="bg-background p-3 rounded border text-sm font-mono mb-4 max-h-32 overflow-y-auto">
                              {backupCodes.map((code, i) => (
                                <div key={i}>{code}</div>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mb-4">{t("security.twoFactor.backupCodesWarning")}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleVerify2FA}
                              disabled={saving || !verificationCode}
                              className="flex-1"
                            >
                              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                              {t("security.twoFactor.verifyAndEnable")}
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => setTwoFactorSetup(false)}
                              disabled={saving}
                              className="flex-1"
                            >
                              {t("security.twoFactor.cancel")}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t("security.devices.title")}</h3>
                  {devices.length > 0 ? (
                    <div className="space-y-3">
                      {devices.map((device) => (
                        <div key={device.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">{device.browser} on {device.os}</p>
                            <p className="text-sm text-muted-foreground">IP: {device.ipAddress}</p>
                            <p className="text-xs text-muted-foreground">{t("security.devices.lastActive")}: {formatDate(device.lastActiveAt)}</p>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleRevokeDevice(device.id)}
                          >
                            {t("security.devices.revoke")}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/30 rounded-lg text-center text-muted-foreground">
                      {t("security.devices.noDevices")}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* 账单 */}
              <TabsContent value="billing" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t("billing.title")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <span className="font-medium">{t("billing.currentPlan")}</span>
                        </div>
                        <p className="text-2xl font-bold">{t("billing.freePlan")}</p>
                        <p className="text-sm text-muted-foreground mt-1">{t("billing.freePlanDesc")}</p>
                        <Button variant="outline" className="mt-4 w-full">{t("billing.upgradePlan")}</Button>
                      </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Calendar className="h-5 w-5 text-primary" />
                          <span className="font-medium">{t("billing.billingCycle")}</span>
                        </div>
                        <p className="text-2xl font-bold">--</p>
                        <p className="text-sm text-muted-foreground mt-1">{t("billing.noPaidSubscription")}</p>
                        <Button variant="outline" className="mt-4 w-full">{t("billing.viewHistory")}</Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t("billing.paymentMethods")}</h3>
                  {paymentMethods.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">{method.type}</p>
                            <p className="text-sm text-muted-foreground">{t("billing.payment.cardNumber")}: ****{method.cardNumber}</p>
                            <p className="text-xs text-muted-foreground">{t("billing.payment.cardHolder")}: {method.cardHolder}</p>
                            {method.isDefault && <Badge className="mt-2">{t("billing.payment.default")}</Badge>}
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeletePaymentMethod(method.id)}
                          >
                            {t("billing.payment.delete")}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/30 rounded-lg text-center mb-4">
                      <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">{t("billing.noPaymentMethod")}</p>
                    </div>
                  )}
                  {!showPaymentForm ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowPaymentForm(true)}
                    >
                      {t("billing.addPaymentMethod")}
                    </Button>
                  ) : (
                    <Card className="bg-muted/30">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="paymentType">{t("billing.payment.type")}</Label>
                            <Select value={paymentForm.type} onValueChange={(value) => setPaymentForm({ ...paymentForm, type: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CREDIT_CARD">{t("billing.payment.creditCard")}</SelectItem>
                                <SelectItem value="DEBIT_CARD">{t("billing.payment.debitCard")}</SelectItem>
                                <SelectItem value="ALIPAY">{t("billing.payment.alipay")}</SelectItem>
                                <SelectItem value="WECHAT">{t("billing.payment.wechat")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardNumber">{t("billing.payment.cardNumber")}</Label>
                            <Input 
                              id="cardNumber"
                              placeholder={t("billing.payment.cardNumberPlaceholder")}
                              value={paymentForm.cardNumber}
                              onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardHolder">{t("billing.payment.cardHolder")}</Label>
                            <Input 
                              id="cardHolder"
                              placeholder={t("billing.payment.cardHolderPlaceholder")}
                              value={paymentForm.cardHolder}
                              onChange={(e) => setPaymentForm({ ...paymentForm, cardHolder: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="expiryDate">{t("billing.payment.expiryDate")}</Label>
                            <Input 
                              id="expiryDate"
                              placeholder={t("billing.payment.expiryDatePlaceholder")}
                              value={paymentForm.expiryDate}
                              onChange={(e) => setPaymentForm({ ...paymentForm, expiryDate: e.target.value })}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={paymentForm.isDefault}
                              onCheckedChange={(checked) => setPaymentForm({ ...paymentForm, isDefault: checked })}
                            />
                            <Label>{t("billing.payment.setDefault")}</Label>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleAddPaymentMethod}
                              disabled={saving}
                              className="flex-1"
                            >
                              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                              {t("billing.payment.add")}
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => setShowPaymentForm(false)}
                              disabled={saving}
                              className="flex-1"
                            >
                              {t("billing.payment.cancel")}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* 通知设置 */}
              <TabsContent value="notifications" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t("notifications.title")}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{t("notifications.email")}</p>
                        <p className="text-sm text-muted-foreground">{t("notifications.emailDesc")}</p>
                      </div>
                      <Switch checked={notifications.emailNotifications} onCheckedChange={(v) => setNotifications({ ...notifications, emailNotifications: v })} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{t("notifications.push")}</p>
                        <p className="text-sm text-muted-foreground">{t("notifications.pushDesc")}</p>
                      </div>
                      <Switch checked={notifications.pushNotifications} onCheckedChange={(v) => setNotifications({ ...notifications, pushNotifications: v })} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{t("notifications.orderUpdates")}</p>
                        <p className="text-sm text-muted-foreground">{t("notifications.orderUpdatesDesc")}</p>
                      </div>
                      <Switch checked={notifications.orderUpdates} onCheckedChange={(v) => setNotifications({ ...notifications, orderUpdates: v })} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{t("notifications.promotions")}</p>
                        <p className="text-sm text-muted-foreground">{t("notifications.promotionsDesc")}</p>
                      </div>
                      <Switch checked={notifications.promotions} onCheckedChange={(v) => setNotifications({ ...notifications, promotions: v })} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{t("notifications.newsletter")}</p>
                        <p className="text-sm text-muted-foreground">{t("notifications.newsletterDesc")}</p>
                      </div>
                      <Switch checked={notifications.newsletter} onCheckedChange={(v) => setNotifications({ ...notifications, newsletter: v })} />
                    </div>
                  </div>
                  <Button onClick={handleSaveNotifications} disabled={saving} className="mt-4">{t("notifications.saveSettings")}</Button>
                </div>
              </TabsContent>

              {/* 语言设置 */}
              <TabsContent value="language" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t("settings.languageSettings.title", "语言设置")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t("settings.languageSettings.description", "选择您的首选语言")}</p>
                  <div className="max-w-md">
                    <Select value={locale} onValueChange={(value) => setLocale(value as DashboardLocale)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t("settings.languageSettings.selectLanguage", "选择语言")} />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              {lang.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">{t("settings.languageSettings.changeNote", "更改语言后，页面将自动刷新")}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t("languageSettings.regionTitle")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
                    <div className="space-y-2">
                      <Label>{t("languageSettings.timezone")}</Label>
                      <Select defaultValue="Asia/Shanghai">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Shanghai">{t("languageSettings.timezones.shanghai")}</SelectItem>
                          <SelectItem value="Asia/Tokyo">{t("languageSettings.timezones.tokyo")}</SelectItem>
                          <SelectItem value="America/New_York">{t("languageSettings.timezones.newYork")}</SelectItem>
                          <SelectItem value="Europe/London">{t("languageSettings.timezones.london")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("languageSettings.dateFormat")}</Label>
                      <Select defaultValue="YYYY-MM-DD">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YYYY-MM-DD">2024-01-01</SelectItem>
                          <SelectItem value="DD/MM/YYYY">01/01/2024</SelectItem>
                          <SelectItem value="MM/DD/YYYY">01/01/2024</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 隐私设置 */}
              <TabsContent value="privacy" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t("privacy.title")}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{t("privacy.profileVisible")}</p>
                        <p className="text-sm text-muted-foreground">{t("privacy.profileVisibleDesc")}</p>
                      </div>
                      <Switch checked={privacySettings.profileVisible} onCheckedChange={(v) => setPrivacySettings({ ...privacySettings, profileVisible: v })} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{t("privacy.showOnlineStatus")}</p>
                        <p className="text-sm text-muted-foreground">{t("privacy.showOnlineStatusDesc")}</p>
                      </div>
                      <Switch checked={privacySettings.showOnlineStatus} onCheckedChange={(v) => setPrivacySettings({ ...privacySettings, showOnlineStatus: v })} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{t("privacy.allowSearchEngineIndex")}</p>
                        <p className="text-sm text-muted-foreground">{t("privacy.allowSearchEngineIndexDesc")}</p>
                      </div>
                      <Switch checked={privacySettings.allowSearchEngineIndex} onCheckedChange={(v) => setPrivacySettings({ ...privacySettings, allowSearchEngineIndex: v })} />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{t("privacy.allowMessages")}</p>
                        <p className="text-sm text-muted-foreground">{t("privacy.allowMessagesDesc")}</p>
                      </div>
                      <Switch checked={privacySettings.allowMessages} onCheckedChange={(v) => setPrivacySettings({ ...privacySettings, allowMessages: v })} />
                    </div>
                  </div>
                  <Button onClick={handleSavePrivacySettings} disabled={saving} className="mt-4">{t("privacy.saveSettings")}</Button>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t("privacy.dataManagement")}</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      {t("privacy.downloadData")}
                    </Button>
                    <p className="text-xs text-muted-foreground">{t("privacy.downloadDataDesc")}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-red-600">{t("privacy.dangerZone")}</h3>
                  <div className="space-y-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div>
                      <p className="font-medium text-red-600">{t("privacy.deleteAccount")}</p>
                      <p className="text-sm text-muted-foreground mb-3">{t("privacy.deleteAccountDesc")}</p>
                      <Button variant="destructive">{t("privacy.deleteAccountBtn")}</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
