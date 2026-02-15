'use client';

import React, { useState } from 'react';
import { UserPortalLayout } from '@/components/user-portal/UserPortalLayout';

type SettingsTab = 'account' | 'security' | 'preferences' | 'notifications';

interface AccountSettings {
  username: string;
  email: string;
  phone: string;
  language: string;
  timezone: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginNotifications: boolean;
  sessionTimeout: number;
}

interface PreferenceSettings {
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  dateFormat: string;
  emailDigest: 'daily' | 'weekly' | 'never';
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  investmentUpdates: boolean;
  orderUpdates: boolean;
  marketingEmails: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Account settings state
  const [accountSettings, setAccountSettings] = useState<AccountSettings>({
    username: 'johndoe',
    email: 'john@example.com',
    phone: '+1234567890',
    language: 'en',
    timezone: 'America/New_York',
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: 30,
  });

  // Preference settings state
  const [preferenceSettings, setPreferenceSettings] = useState<PreferenceSettings>({
    theme: 'auto',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    emailDigest: 'weekly',
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    investmentUpdates: true,
    orderUpdates: true,
    marketingEmails: false,
  });

  const handleSaveSettings = async () => {
    setLoading(true);
    setSuccessMessage('');
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'account' as const, label: 'Account', icon: '👤' },
    { id: 'security' as const, label: 'Security', icon: '🔒' },
    { id: 'preferences' as const, label: 'Preferences', icon: '⚙️' },
    { id: 'notifications' as const, label: 'Notifications', icon: '🔔' },
  ];

  return (
    <UserPortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-800 dark:text-green-200 font-medium">
              ✓ {successMessage}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2
                ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Account Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={accountSettings.username}
                    onChange={(e) => setAccountSettings({ ...accountSettings, username: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={accountSettings.email}
                    onChange={(e) => setAccountSettings({ ...accountSettings, email: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={accountSettings.phone}
                    onChange={(e) => setAccountSettings({ ...accountSettings, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Language
                  </label>
                  <select
                    value={accountSettings.language}
                    onChange={(e) => setAccountSettings({ ...accountSettings, language: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="en">English</option>
                    <option value="zh">中文</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={accountSettings.timezone}
                    onChange={(e) => setAccountSettings({ ...accountSettings, timezone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Asia/Shanghai">China Standard Time (CST)</option>
                    <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Security Settings
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button
                    onClick={() => setSecuritySettings({ ...securitySettings, twoFactorEnabled: !securitySettings.twoFactorEnabled })}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${securitySettings.twoFactorEnabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-600'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${securitySettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      Login Notifications
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Get notified when someone logs into your account
                    </p>
                  </div>
                  <button
                    onClick={() => setSecuritySettings({ ...securitySettings, loginNotifications: !securitySettings.loginNotifications })}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${securitySettings.loginNotifications ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-600'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${securitySettings.loginNotifications ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <select
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preference Settings */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Preferences
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Theme
                  </label>
                  <select
                    value={preferenceSettings.theme}
                    onChange={(e) => setPreferenceSettings({ ...preferenceSettings, theme: e.target.value as 'light' | 'dark' | 'auto' })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto (System)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Currency
                  </label>
                  <select
                    value={preferenceSettings.currency}
                    onChange={(e) => setPreferenceSettings({ ...preferenceSettings, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CNY">CNY (¥)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Date Format
                  </label>
                  <select
                    value={preferenceSettings.dateFormat}
                    onChange={(e) => setPreferenceSettings({ ...preferenceSettings, dateFormat: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email Digest
                  </label>
                  <select
                    value={preferenceSettings.emailDigest}
                    onChange={(e) => setPreferenceSettings({ ...preferenceSettings, emailDigest: e.target.value as 'daily' | 'weekly' | 'never' })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Notification Preferences
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      Email Notifications
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Receive notifications via email
                    </p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, emailNotifications: !notificationSettings.emailNotifications })}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${notificationSettings.emailNotifications ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-600'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      Push Notifications
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, pushNotifications: !notificationSettings.pushNotifications })}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${notificationSettings.pushNotifications ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-600'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      SMS Notifications
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <button
                    onClick={() => setNotificationSettings({ ...notificationSettings, smsNotifications: !notificationSettings.smsNotifications })}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${notificationSettings.smsNotifications ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-600'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${notificationSettings.smsNotifications ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="font-medium text-slate-900 dark:text-white mb-4">
                    Notification Types
                  </h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.investmentUpdates}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, investmentUpdates: e.target.checked })}
                        className="w-5 h-5 text-teal-600 border-slate-300 dark:border-slate-600 rounded focus:ring-teal-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        Investment Updates
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.orderUpdates}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, orderUpdates: e.target.checked })}
                        className="w-5 h-5 text-teal-600 border-slate-300 dark:border-slate-600 rounded focus:ring-teal-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        Order Updates
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.marketingEmails}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, marketingEmails: e.target.checked })}
                        className="w-5 h-5 text-teal-600 border-slate-300 dark:border-slate-600 rounded focus:ring-teal-500"
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        Marketing Emails
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                // Reset to initial values
                setActiveTab('account');
              }}
              className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </UserPortalLayout>
  );
}
