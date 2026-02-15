'use client';

import React, { useState } from 'react';
import { NotificationPreference } from '@/lib/user-portal/messaging-types';

interface NotificationSettingsProps {
  preferences: NotificationPreference | null;
  onSave: (preferences: NotificationPreference) => Promise<void>;
  isLoading?: boolean;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  preferences,
  onSave,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<NotificationPreference | null>(
    preferences
  );
  const [saving, setSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="notification-settings skeleton">
        <div className="skeleton-bar" />
      </div>
    );
  }

  if (!formData) {
    return <div className="empty-state">加载中...</div>;
  }

  const handleToggle = (field: keyof NotificationPreference) => {
    setFormData({
      ...formData,
      [field]: !formData[field],
    });
  };

  const handleTimeChange = (
    field: 'quietHoursStart' | 'quietHoursEnd',
    value: string
  ) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="notification-settings">
      <div className="settings-section">
        <h3 className="section-title">消息类型</h3>

        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={formData.orderNotifications}
              onChange={() => handleToggle('orderNotifications')}
            />
            <span>订单通知</span>
          </label>
          <p className="setting-description">订单状态更新和提醒</p>
        </div>

        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={formData.serviceNotifications}
              onChange={() => handleToggle('serviceNotifications')}
            />
            <span>服务通知</span>
          </label>
          <p className="setting-description">服务进度和更新</p>
        </div>

        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={formData.promotionNotifications}
              onChange={() => handleToggle('promotionNotifications')}
            />
            <span>促销通知</span>
          </label>
          <p className="setting-description">优惠和促销活动</p>
        </div>

        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={formData.systemNotifications}
              onChange={() => handleToggle('systemNotifications')}
            />
            <span>系统通知</span>
          </label>
          <p className="setting-description">系统维护和重要公告</p>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-title">通知渠道</h3>

        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={formData.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
            />
            <span>邮件通知</span>
          </label>
        </div>

        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={formData.pushNotifications}
              onChange={() => handleToggle('pushNotifications')}
            />
            <span>推送通知</span>
          </label>
        </div>

        <div className="setting-item">
          <label className="setting-label">
            <input
              type="checkbox"
              checked={formData.smsNotifications}
              onChange={() => handleToggle('smsNotifications')}
            />
            <span>短信通知</span>
          </label>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="section-title">勿扰时间</h3>

        <div className="setting-item">
          <label className="setting-label">开始时间</label>
          <input
            type="time"
            value={formData.quietHoursStart || ''}
            onChange={(e) => handleTimeChange('quietHoursStart', e.target.value)}
            className="time-input"
          />
        </div>

        <div className="setting-item">
          <label className="setting-label">结束时间</label>
          <input
            type="time"
            value={formData.quietHoursEnd || ''}
            onChange={(e) => handleTimeChange('quietHoursEnd', e.target.value)}
            className="time-input"
          />
        </div>

        <p className="setting-description">
          在勿扰时间内，您将不会收到推送通知
        </p>
      </div>

      <div className="settings-actions">
        <button
          className={`save-btn ${saving ? 'loading' : ''}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '保存中...' : '保存设置'}
        </button>
      </div>
    </div>
  );
};
