'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface VirtualizedDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowHeight?: number;
  visibleRows?: number;
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

export function VirtualizedDataTable<T extends { id: string | number }>({
  columns,
  data,
  rowHeight = 40,
  visibleRows = 10,
  onRowSelect,
  onSort,
  onFilter,
  loading = false,
  selectable = true,
  sortable = true,
  filterable = true,
  paginated = false,
  className = '',
}: VirtualizedDataTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [sortState, setSortState] = useState<SortState | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof T>>(
    new Set(columns.map(col => col.key))
  );
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  // Calculate virtual scroll
  const startIndex = Math.floor(scrollTop / rowHeight);
  const endIndex = Math.min(startIndex + visibleRows + 1, filteredData.length);
  const visibleData = filteredData.slice(startIndex, endIndex);
  const offsetY = startIndex * rowHeight;

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

    if (selectedRows.size === filteredData.length) {
      setSelectedRows(new Set());
      onRowSelect?.([]);
    } else {
      const newSelected = new Set(filteredData.map(row => row.id));
      setSelectedRows(newSelected);
      const selectedData = data.filter(row => newSelected.has(row.id));
      onRowSelect?.(selectedData);
    }
  }, [selectedRows, selectable, filteredData, data, onRowSelect]);

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const newFilters = { ...filters, [key]: value };
      setFilters(newFilters);
      setScrollTop(0);
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

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);
  }, []);

  const visibleColumnsArray = columns.filter(col => visibleColumns.has(col.key));
  const totalHeight = filteredData.length * rowHeight;

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

      {/* Virtualized Table */}
      <div className="overflow-hidden rounded border border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-800 border-b border-gray-700">
                {selectable && (
                  <th className="px-4 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={
                        filteredData.length > 0 &&
                        selectedRows.size === filteredData.length
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
          </table>
        </div>

        {/* Virtualized Body */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="overflow-y-auto"
          style={{ height: `${visibleRows * rowHeight}px` }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Loading...
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              No data available
            </div>
          ) : (
            <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
              <div style={{ transform: `translateY(${offsetY}px)` }}>
                {visibleData.map((row, idx) => {
                  const actualIndex = startIndex + idx;
                  return (
                    <div
                      key={row.id}
                      className={`flex border-b border-gray-700 ${
                        actualIndex % 2 === 0 ? 'bg-gray-900' : 'bg-gray-850'
                      }`}
                      style={{ height: `${rowHeight}px` }}
                    >
                      {selectable && (
                        <div className="px-4 py-3 w-12 flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(row.id)}
                            onChange={() => handleSelectRow(row.id)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </div>
                      )}
                      {visibleColumnsArray.map(col => (
                        <div
                          key={String(col.key)}
                          className="px-4 py-3 text-gray-300 flex items-center overflow-hidden"
                          style={{ width: col.width }}
                        >
                          {col.render
                            ? col.render(row[col.key], row)
                            : String(row[col.key])}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="text-sm text-gray-400">
        Showing {filteredData.length} of {data.length} rows
      </div>
    </div>
  );
}
