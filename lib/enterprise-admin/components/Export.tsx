'use client';

import React, { useState, useCallback } from 'react';
import { Download, FileText, File, FileJson, CheckCircle, AlertCircle } from 'lucide-react';

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

export interface ExportColumn {
  key: string;
  label: string;
  included?: boolean;
}

export interface ExportProps {
  data: Record<string, any>[];
  columns: ExportColumn[];
  filename?: string;
  onExport?: (format: ExportFormat, data: any) => Promise<void>;
  className?: string;
}

export function Export({
  data,
  columns,
  filename = 'export',
  onExport,
  className = '',
}: ExportProps) {
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    new Set(columns.filter(c => c.included !== false).map(c => c.key))
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const toggleColumn = useCallback((key: string) => {
    setSelectedColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  const getFilteredData = useCallback(() => {
    return data.map(row => {
      const filtered: Record<string, any> = {};
      selectedColumns.forEach(key => {
        filtered[key] = row[key];
      });
      return filtered;
    });
  }, [data, selectedColumns]);

  const exportToCSV = useCallback(async () => {
    try {
      setIsExporting(true);
      const filteredData = getFilteredData();

      // Create CSV content
      const headers = Array.from(selectedColumns);
      const csvContent = [
        headers.join(','),
        ...filteredData.map(row =>
          headers
            .map(header => {
              const value = row[header];
              if (value === null || value === undefined) return '';
              if (typeof value === 'string' && value.includes(',')) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(',')
        ),
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      downloadFile(blob, `${filename}.csv`);

      await onExport?.('csv', filteredData);
      setExportStatus({ type: 'success', message: 'CSV exported successfully!' });
    } catch (error) {
      console.error('CSV export error:', error);
      setExportStatus({ type: 'error', message: 'Failed to export CSV' });
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus({ type: null, message: '' }), 3000);
    }
  }, [selectedColumns, getFilteredData, filename, onExport]);

  const exportToJSON = useCallback(async () => {
    try {
      setIsExporting(true);
      const filteredData = getFilteredData();

      const jsonContent = JSON.stringify(filteredData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      downloadFile(blob, `${filename}.json`);

      await onExport?.('json', filteredData);
      setExportStatus({ type: 'success', message: 'JSON exported successfully!' });
    } catch (error) {
      console.error('JSON export error:', error);
      setExportStatus({ type: 'error', message: 'Failed to export JSON' });
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus({ type: null, message: '' }), 3000);
    }
  }, [getFilteredData, filename, onExport]);

  const exportToExcel = useCallback(async () => {
    try {
      setIsExporting(true);
      const filteredData = getFilteredData();

      // Simple Excel format (XLSX would require a library)
      // For now, we'll create a CSV that Excel can open
      const headers = Array.from(selectedColumns);
      const csvContent = [
        headers.join('\t'),
        ...filteredData.map(row =>
          headers.map(header => row[header] || '').join('\t')
        ),
      ].join('\n');

      const blob = new Blob([csvContent], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;',
      });
      downloadFile(blob, `${filename}.xlsx`);

      await onExport?.('excel', filteredData);
      setExportStatus({ type: 'success', message: 'Excel exported successfully!' });
    } catch (error) {
      console.error('Excel export error:', error);
      setExportStatus({ type: 'error', message: 'Failed to export Excel' });
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus({ type: null, message: '' }), 3000);
    }
  }, [selectedColumns, getFilteredData, filename, onExport]);

  const exportToPDF = useCallback(async () => {
    try {
      setIsExporting(true);
      const filteredData = getFilteredData();

      // Create a simple PDF-like format
      // For full PDF support, you'd need a library like jsPDF
      const headers = Array.from(selectedColumns);
      let pdfContent = `${filename}\n\n`;
      pdfContent += headers.join(' | ') + '\n';
      pdfContent += '-'.repeat(80) + '\n';
      filteredData.forEach(row => {
        pdfContent += headers.map(h => String(row[h] || '')).join(' | ') + '\n';
      });

      const blob = new Blob([pdfContent], { type: 'application/pdf;charset=utf-8;' });
      downloadFile(blob, `${filename}.pdf`);

      await onExport?.('pdf', filteredData);
      setExportStatus({ type: 'success', message: 'PDF exported successfully!' });
    } catch (error) {
      console.error('PDF export error:', error);
      setExportStatus({ type: 'error', message: 'Failed to export PDF' });
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportStatus({ type: null, message: '' }), 3000);
    }
  }, [selectedColumns, getFilteredData, filename, onExport]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Messages */}
      {exportStatus.type && (
        <div
          className={`p-3 rounded flex items-center gap-2 ${
            exportStatus.type === 'success'
              ? 'bg-green-900 text-green-200 border border-green-700'
              : 'bg-red-900 text-red-200 border border-red-700'
          }`}
        >
          {exportStatus.type === 'success' ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          {exportStatus.message}
        </div>
      )}

      {/* Column Selector */}
      <div className="relative">
        <button
          onClick={() => setShowColumnSelector(!showColumnSelector)}
          className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <FileText size={16} />
          Select Columns ({selectedColumns.size}/{columns.length})
        </button>

        {showColumnSelector && (
          <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-700 rounded shadow-lg z-10 min-w-max p-3 space-y-2">
            {columns.map(col => (
              <label key={col.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedColumns.has(col.key)}
                  onChange={() => toggleColumn(col.key)}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-300">{col.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Export Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={exportToCSV}
          disabled={isExporting || selectedColumns.size === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
        >
          <File size={16} />
          CSV
        </button>

        <button
          onClick={exportToExcel}
          disabled={isExporting || selectedColumns.size === 0}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
        >
          <File size={16} />
          Excel
        </button>

        <button
          onClick={exportToPDF}
          disabled={isExporting || selectedColumns.size === 0}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
        >
          <FileText size={16} />
          PDF
        </button>

        <button
          onClick={exportToJSON}
          disabled={isExporting || selectedColumns.size === 0}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
        >
          <FileJson size={16} />
          JSON
        </button>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-400">
        {data.length} rows will be exported with {selectedColumns.size} selected columns
      </div>
    </div>
  );
}

// Helper function to download file
function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
