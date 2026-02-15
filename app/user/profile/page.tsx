'use client';

import React, { useState } from 'react';
import { UserPortalLayout } from '@/components/user-portal/UserPortalLayout';
import { BasicInfoForm } from '@/components/user-portal/BasicInfoForm';
import { AddressManager } from '@/components/user-portal/AddressManager';
import { PaymentMethodManager } from '@/components/user-portal/PaymentMethodManager';
import { SecuritySettings } from '@/components/user-portal/SecuritySettings';

interface BasicInfo {
  name: string;
  email: string;
  phone: string;
}

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  recipient: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'alipay' | 'wechat';
  name: string;
  lastFour: string;
  isDefault: boolean;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'basic' | 'addresses' | 'payment' | 'security'>(
    'basic'
  );
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
  });
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'home',
      recipient: 'John Doe',
      phone: '+1234567890',
      province: 'California',
      city: 'San Francisco',
      district: 'Downtown',
      detail: '123 Main St, Apt 4B',
      isDefault: true,
    },
  ]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'My Visa',
      lastFour: '4242',
      isDefault: true,
    },
  ]);

  const handleUpdateBasicInfo = async (data: BasicInfo) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setBasicInfo(data);
  };

  const handleAddAddress = async (address: Omit<Address, 'id'>) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newAddress: Address = {
      ...address,
      id: Date.now().toString(),
    };
    setAddresses([...addresses, newAddress]);
  };

  const handleEditAddress = async (id: string, address: Omit<Address, 'id'>) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setAddresses(addresses.map((a) => (a.id === id ? { ...address, id } : a)));
  };

  const handleDeleteAddress = async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setAddresses(addresses.filter((a) => a.id !== id));
  };

  const handleSetDefaultAddress = async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setAddresses(
      addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  const handleAddPaymentMethod = async (method: Omit<PaymentMethod, 'id'>) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newMethod: PaymentMethod = {
      ...method,
      id: Date.now().toString(),
    };
    setPaymentMethods([...paymentMethods, newMethod]);
  };

  const handleDeletePaymentMethod = async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setPaymentMethods(paymentMethods.filter((m) => m.id !== id));
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    setPaymentMethods(
      paymentMethods.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }))
    );
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Simulate password change
  };

  const handleBindPhone = async (phone: string, code: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Simulate phone binding
  };

  const handleEnable2FA = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Simulate 2FA enable
  };

  const handleDisable2FA = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Simulate 2FA disable
  };

  return (
    <UserPortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Profile Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your personal information and account settings
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          {(
            [
              { id: 'basic', label: 'Basic Information' },
              { id: 'addresses', label: 'Addresses' },
              { id: 'payment', label: 'Payment Methods' },
              { id: 'security', label: 'Security' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-600 dark:border-teal-400 dark:text-teal-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          {activeTab === 'basic' && (
            <BasicInfoForm initialData={basicInfo} onSubmit={handleUpdateBasicInfo} />
          )}

          {activeTab === 'addresses' && (
            <AddressManager
              addresses={addresses}
              onAdd={handleAddAddress}
              onEdit={handleEditAddress}
              onDelete={handleDeleteAddress}
              onSetDefault={handleSetDefaultAddress}
            />
          )}

          {activeTab === 'payment' && (
            <PaymentMethodManager
              methods={paymentMethods}
              onAdd={handleAddPaymentMethod}
              onDelete={handleDeletePaymentMethod}
              onSetDefault={handleSetDefaultPaymentMethod}
            />
          )}

          {activeTab === 'security' && (
            <SecuritySettings
              onChangePassword={handleChangePassword}
              onBindPhone={handleBindPhone}
              onEnable2FA={handleEnable2FA}
              onDisable2FA={handleDisable2FA}
              twoFactorEnabled={false}
              phoneVerified={true}
            />
          )}
        </div>
      </div>
    </UserPortalLayout>
  );
}
