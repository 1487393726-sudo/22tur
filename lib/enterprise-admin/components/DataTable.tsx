'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  onRowSelect?: (selectedRows: T[]) => void;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  loading?: boolean;
  selectable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  className?: string;
}

interface SortState {
  key: keyof any;
  direction: 'asc' | 'desc';
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  pageSize = 10,
  onRowSelect,
  onSort,
  onFilter,
  loading = false,
  selectable = true,
  sortable = true,
  filterable = true,
  paginated = true,
  className = '',
}: DataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [sortState, setSortState] = useState<SortState | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof T>>(
    new Set(columns.map(col => col.key))
  );
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortState || !sortable) return data;

    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortState.key];
      const bVal = b[sortState.key];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortState.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortState.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return sorted;
  }, [data, sortState, sortable]);

  // Filter data
  const filteredData = useMemo(() => {
    if (!filterable || Object.keys(filters).length === 0) return sortedData;

    return sortedData.filter(row => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        const rowValue = String(row[key as keyof T]).toLowerCase();
        return rowValue.includes(String(value).toLowerCase());
      });
    });
  }, [sortedData, filters, filterable]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!paginated) return filteredData;
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize, paginated]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handleSort = useCallback(
    (key: keyof T) => {
      if (!sortable) return;

      let newDirection: 'asc' | 'desc' = 'asc';
      if (sortState?.key === key && sortState.direction === 'asc') {
        newDirection = 'desc';
      }

      setSortState({ key, direction: newDirection });
      onSort?.(key, newDirection);
    },
    [sortState, sortable, onSort]
  );

  const handleSelectRow = useCallback(
    (rowId: string | number) => {
      if (!selectable) return;

      const newSelected = new Set(selectedRows);
      if (newSelected.has(rowId)) {
        newSelected.delete(rowId);
      } else {
        newSelected.add(rowId);
      }

      setSelectedRows(newSelected);
      const selectedData = data.filter(row => newSelected.has(row.id));
      onRowSelect?.(selectedData);
    },
    [selectedRows, selectable, data, onRowSelect]
  );

  const handleSelectAll = useCallback(() => {
    if (!selectable) return;

    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      onRowSelect?.([]);
    } else {
      const newSelected = new Set(paginatedData.map(row => row.id));
      setSelectedRows(newSelected);
      const selectedData = data.filter(row => newSelected.has(row.id));
      onRowSelect?.(selectedData);
    }
  }, [selectedRows, selectable, paginatedData, data, onRowSelect]);

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      setCurrentPage(1);
      onFilter?.(newFilters);
    },
    [filters, onFilter]
  );

  const toggleColumnVisibility = useCallback((key: keyof T) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  const visibleColumnsArray = columns.filter(col => visibleColumns.has(col.key));

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Column Visibility Toggle */}
      <div className="flex gap-2 flex-wrap">
        {columns.map(col => (
          <button
            key={String(col.key)}
            onClick={() => toggleColumnVisibility(col.key)}
            className={`px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors ${
              visibleColumns.has(col.key)
                ? 'bg-gray-700 text-white'
                : 'bg-gray-600 text-gray-300'
            }`}
          >
            {visibleColumns.has(col.key) ? (
              <Eye size={14} />
            ) : (
              <EyeOff size={14} />
            )}
            {col.label}
          </button>
        ))}
      </div>

      {/* Filter Row */}
      {filterable && (
        <div className="flex gap-2 flex-wrap">
          {visibleColumnsArray.map(col => (
            <input
              key={String(col.key)}
              type="text"
              placeholder={`Filter ${col.label}...`}
              value={filters[String(col.key)] || ''}
              onChange={e => handleFilterChange(String(col.key), e.target.value)}
              className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-gray-500 focus:outline-none text-sm"
            />
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded border border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700">
              {selectable && (
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 &&
                      selectedRows.size === paginatedData.length
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 cursor-pointer"
                  />
                </th>
              )}
              {visibleColumnsArray.map(col => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-left font-semibold text-gray-200 ${
                    col.sortable && sortable ? 'cursor-pointer hover:bg-gray-700' : ''
                  }`}
                  onClick={() => col.sortable && sortable && handleSort(col.key)}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable && sortable && (
                      <div className="flex flex-col gap-0.5">
                        {sortState?.key === col.key ? (
                          sortState.direction === 'asc' ? (
                            <ChevronUp size={14} className="text-blue-400" />
                          ) : (
                            <ChevronDown size={14} className="text-blue-400" />
                          )
                        ) : (
                          <div className="flex flex-col gap-0.5 opacity-30">
                            <ChevronUp size={12} />
                            <ChevronDown size={12} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={
                    visibleColumnsArray.length + (selectable ? 1 : 0)
                  }
                  className="px-4 py-8 text-center text-gray-400"
                >
                  Loading...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    visibleColumnsArray.length + (selectable ? 1 : 0)
                  }
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No data available
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-700 hover:bg-gray-750 transition-colors ${
                    idx % 2 === 0 ? 'bg-gray-900' : 'bg-gray-850'
                  }`}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(row.id)}
                        onChange={() => handleSelectRow(row.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                  )}
                  {visibleColumnsArray.map(col => (
                    <td
                      key={String(col.key)}
                      className="px-4 py-3 text-gray-300"
                      style={{ width: col.width }}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : String(row[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {paginated && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Showing {paginatedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors flex items-center gap-1"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
