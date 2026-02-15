'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { SearchFilter } from '../components/SearchFilter';
import { StatusBadge } from '../components/StatusBadge';
import { UserManagementService } from './user-management-service';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';

export interface UserListProps {
  service: UserManagementService;
  onUserSelect?: (user: User) => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (user: User) => void;
  onUserView?: (user: User) => void;
  onBatchOperation?: (userIds: string[], operation: 'enable' | 'disable' | 'delete') => void;
}

export function UserList({
  service,
  onUserSelect,
  onUserEdit,
  onUserDelete,
  onUserView,
  onBatchOperation,
}: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState<keyof User>('username');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  // Load users
  const loadUsers = useCallback(() => {
    setLoading(true);
    try {
      const result = service.searchUsers(
        searchKeyword,
        filters,
        String(sortBy),
        sortOrder,
        page,
        pageSize
      );
      setUsers(result.items);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }, [service, searchKeyword, filters, sortBy, sortOrder, page, pageSize]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
    setPage(1);
  }, []);

  const handleFilter = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleSort = useCallback((key: keyof User, direction: 'asc' | 'desc') => {
    setSortBy(key);
    setSortOrder(direction);
    setPage(1);
  }, []);

  const handleRowSelect = useCallback((selected: User[]) => {
    setSelectedUsers(selected);
    onUserSelect?.(selected[0]);
  }, [onUserSelect]);

  const handleBatchEnable = useCallback(() => {
    if (selectedUsers.length === 0) return;
    const userIds = selectedUsers.map((u) => u.id);
    onBatchOperation?.(userIds, 'enable');
    service.batchEnableUsers(userIds);
    loadUsers();
    setSelectedUsers([]);
  }, [selectedUsers, onBatchOperation, service, loadUsers]);

  const handleBatchDisable = useCallback(() => {
    if (selectedUsers.length === 0) return;
    const userIds = selectedUsers.map((u) => u.id);
    onBatchOperation?.(userIds, 'disable');
    service.batchDisableUsers(userIds);
    loadUsers();
    setSelectedUsers([]);
  }, [selectedUsers, onBatchOperation, service, loadUsers]);

  const handleBatchDelete = useCallback(() => {
    if (selectedUsers.length === 0) return;
    if (!confirm(`Delete ${selectedUsers.length} user(s)?`)) return;
    const userIds = selectedUsers.map((u) => u.id);
    onBatchOperation?.(userIds, 'delete');
    service.batchDeleteUsers(userIds);
    loadUsers();
    setSelectedUsers([]);
  }, [selectedUsers, onBatchOperation, service, loadUsers]);

  const columns: Column<User>[] = [
    {
      key: 'username',
      label: 'Username',
      sortable: true,
      filterable: true,
      width: '150px',
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true,
      width: '200px',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      width: '120px',
      render: (value: string) => (
        <StatusBadge
          status={value}
          label={value.charAt(0).toUpperCase() + value.slice(1)}
        />
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      width: '150px',
      render: (value: Date) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'id',
      label: 'Actions',
      width: '150px',
      render: (value: string, row: User) => (
        <div className="flex gap-2">
          <button
            onClick={() => onUserView?.(row)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="View"
          >
            <Eye size={16} className="text-blue-400" />
          </button>
          <button
            onClick={() => onUserEdit?.(row)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Edit"
          >
            <Edit2 size={16} className="text-yellow-400" />
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this user?')) {
                onUserDelete?.(row);
                service.deleteUser(row.id);
                loadUsers();
              }
            }}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={16} className="text-red-400" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Filter */}
      <SearchFilter
        onSearch={handleSearch}
        onFilter={handleFilter}
        placeholder="Search users by username or email..."
      />

      {/* Batch Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-gray-800 p-4 rounded border border-gray-700 flex items-center justify-between">
          <span className="text-gray-300">
            {selectedUsers.length} user(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBatchEnable}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
            >
              Enable
            </button>
            <button
              onClick={handleBatchDisable}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm"
            >
              Disable
            </button>
            <button
              onClick={handleBatchDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable<User>
        columns={columns}
        data={users}
        pageSize={pageSize}
        onRowSelect={handleRowSelect}
        onSort={handleSort}
        onFilter={handleFilter}
        loading={loading}
        selectable={true}
        sortable={true}
        filterable={true}
        paginated={true}
        className="bg-gray-900 rounded"
      />
    </div>
  );
}
