'use client';

import React, { useState, useEffect } from 'react';
import { User, Order } from '../types';
import { ArrowLeft } from 'lucide-react';

export interface UserDetailProps {
  user: User;
  orders?: Order[];
  onBack?: () => void;
  onEdit?: (user: User) => void;
}

export function UserDetail({ user, orders = [], onBack, onEdit }: UserDetailProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'payments'>('info');

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-400" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{user.username}</h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>
        {onEdit && (
          <button
            onClick={() => onEdit(user)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Edit User
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'info'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          User Information
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'orders'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Order History
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'payments'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Payment Methods
        </button>
      </div>

      {/* Content */}
      <div className="bg-gray-800 rounded border border-gray-700 p-6">
        {activeTab === 'info' && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Username
              </label>
              <p className="text-white">{user.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email
              </label>
              <p className="text-white">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Status
              </label>
              <p className="text-white capitalize">{user.status}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Roles
              </label>
              <p className="text-white">
                {user.roles.length > 0
                  ? user.roles.map((r) => r.name).join(', ')
                  : 'No roles assigned'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Created At
              </label>
              <p className="text-white">
                {new Date(user.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Last Updated
              </label>
              <p className="text-white">
                {new Date(user.updatedAt).toLocaleString()}
              </p>
            </div>
            {user.lastLoginAt && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Last Login
                </label>
                <p className="text-white">
                  {new Date(user.lastLoginAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-gray-700 p-4 rounded border border-gray-600"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-white">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-white">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-400 capitalize">
                          {order.status}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">
                      {order.items.length} item(s)
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No orders found</p>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div>
            <p className="text-gray-400">Payment methods will be displayed here</p>
          </div>
        )}
      </div>
    </div>
  );
}
