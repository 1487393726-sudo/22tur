'use client';

import React, { useState } from 'react';

interface SecuritySettingsProps {
  onChangePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  onBindPhone: (phone: string, code: string) => Promise<void>;
  onEnable2FA: () => Promise<void>;
  onDisable2FA: () => Promise<void>;
  twoFactorEnabled?: boolean;
  phoneVerified?: boolean;
}

export function SecuritySettings({
  onChangePassword,
  onBindPhone,
  onEnable2FA,
  onDisable2FA,
  twoFactorEnabled = false,
  phoneVerified = false,
}: SecuritySettingsProps) {
  const [activeTab, setActiveTab] = useState<'password' | 'phone' | '2fa'>('password');
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [phoneForm, setPhoneForm] = useState({
    phone: '',
    code: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!passwordForm.oldPassword) newErrors.oldPassword = 'Current password required';
    if (!passwordForm.newPassword) newErrors.newPassword = 'New password required';
    if (passwordForm.newPassword.length < 8)
      newErrors.newPassword = 'Password must be at least 8 characters';
    if (passwordForm.newPassword !== passwordForm.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await onChangePassword(passwordForm.oldPassword, passwordForm.newPassword);
      setSuccess(true);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to change password',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBindPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!phoneForm.phone) newErrors.phone = 'Phone number required';
    if (!phoneForm.code) newErrors.code = 'Verification code required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await onBindPhone(phoneForm.phone, phoneForm.code);
      setSuccess(true);
      setPhoneForm({ phone: '', code: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to bind phone',
      });
    } finally {
      setLoading(false);
    }
  };

  const handle2FA = async (enable: boolean) => {
    try {
      setLoading(true);
      if (enable) {
        await onEnable2FA();
      } else {
        await onDisable2FA();
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to update 2FA',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {(['password', 'phone', '2fa'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setErrors({});
              setSuccess(false);
            }}
            className={`
              px-4 py-2 font-medium border-b-2 transition-colors
              ${
                activeTab === tab
                  ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }
            `}
          >
            {tab === 'password' && 'Change Password'}
            {tab === 'phone' && 'Bind Phone'}
            {tab === '2fa' && 'Two-Factor Auth'}
          </button>
        ))}
      </div>

      {/* Change Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.oldPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
              }
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              placeholder="Enter current password"
            />
            {errors.oldPassword && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.oldPassword}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              placeholder="Enter new password (min 8 characters)"
            />
            {errors.newPassword && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.newPassword}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {success && (
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm">
              ✓ Password changed successfully
            </div>
          )}

          {errors.submit && (
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      )}

      {/* Bind Phone Tab */}
      {activeTab === 'phone' && (
        <form onSubmit={handleBindPhone} className="space-y-4">
          {phoneVerified && (
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm">
              ✓ Phone number verified
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneForm.phone}
              onChange={(e) => setPhoneForm({ ...phoneForm, phone: e.target.value })}
              disabled={loading || phoneVerified}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              placeholder="Enter phone number"
            />
            {errors.phone && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">
              Verification Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={phoneForm.code}
                onChange={(e) => setPhoneForm({ ...phoneForm, code: e.target.value })}
                disabled={loading}
                maxLength={6}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                placeholder="Enter code"
              />
              <button
                type="button"
                disabled={loading || !phoneForm.phone}
                className="px-4 py-2 rounded-lg font-medium bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Code
              </button>
            </div>
            {errors.code && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.code}</p>
            )}
          </div>

          {success && (
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm">
              ✓ Phone number bound successfully
            </div>
          )}

          {errors.submit && (
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || phoneVerified}
            className="w-full px-4 py-2 rounded-lg font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Bind Phone'}
          </button>
        </form>
      )}

      {/* Two-Factor Auth Tab */}
      {activeTab === '2fa' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">
                  Two-Factor Authentication
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {twoFactorEnabled
                    ? 'Two-factor authentication is enabled'
                    : 'Enable two-factor authentication for extra security'}
                </p>
              </div>
              <button
                onClick={() => handle2FA(!twoFactorEnabled)}
                disabled={loading}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50
                  ${
                    twoFactorEnabled
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }
                `}
              >
                {loading ? 'Updating...' : twoFactorEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>

          {success && (
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm">
              ✓ Two-factor authentication updated
            </div>
          )}

          {errors.submit && (
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-sm">
              {errors.submit}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
