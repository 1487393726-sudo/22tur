'use client';

import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import { ValidationError } from '../types';
import { validateEmail } from '../utils';
import { X } from 'lucide-react';

export interface UserFormProps {
  user?: User;
  roles?: Role[];
  onSubmit: (user: Partial<User>) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function UserForm({
  user,
  roles = [],
  onSubmit,
  onCancel,
  isLoading = false,
}: UserFormProps) {
  const [formData, setFormData] = useState<Partial<User>>(
    user || {
      username: '',
      email: '',
      status: 'active',
      roles: [],
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(
    new Set(user?.roles.map((r) => r.id) || [])
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRoleToggle = (roleId: string) => {
    const newRoles = new Set(selectedRoles);
    if (newRoles.has(roleId)) {
      newRoles.delete(roleId);
    } else {
      newRoles.add(roleId);
    }
    setSelectedRoles(newRoles);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username || formData.username.trim() === '') {
      newErrors.username = 'Username is required';
    }

    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else {
      try {
        validateEmail(formData.email);
      } catch (error) {
        newErrors.email = (error as ValidationError).message;
      }
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const selectedRoleObjects = roles.filter((r) => selectedRoles.has(r.id));

    onSubmit({
      ...formData,
      roles: selectedRoleObjects,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Username
        </label>
        <input
          type="text"
          name="username"
          value={formData.username || ''}
          onChange={handleChange}
          disabled={isLoading || !!user}
          className={`w-full px-4 py-2 bg-gray-700 text-white rounded border ${
            errors.username ? 'border-red-500' : 'border-gray-600'
          } focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
          placeholder="Enter username"
        />
        {errors.username && (
          <p className="text-red-400 text-sm mt-1">{errors.username}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email || ''}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-4 py-2 bg-gray-700 text-white rounded border ${
            errors.email ? 'border-red-500' : 'border-gray-600'
          } focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
          placeholder="Enter email"
        />
        {errors.email && (
          <p className="text-red-400 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Status
        </label>
        <select
          name="status"
          value={formData.status || 'active'}
          onChange={handleChange}
          disabled={isLoading}
          className={`w-full px-4 py-2 bg-gray-700 text-white rounded border ${
            errors.status ? 'border-red-500' : 'border-gray-600'
          } focus:border-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        {errors.status && (
          <p className="text-red-400 text-sm mt-1">{errors.status}</p>
        )}
      </div>

      {/* Roles */}
      {roles.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Roles
          </label>
          <div className="space-y-2">
            {roles.map((role) => (
              <label
                key={role.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedRoles.has(role.id)}
                  onChange={() => handleRoleToggle(role.id)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-gray-300">{role.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : user ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
}
