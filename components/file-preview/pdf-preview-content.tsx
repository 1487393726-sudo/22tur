"use client";

import { useState } from "react";

interface PDFPreviewContentProps {
  url: string;
}

export function PDFPreviewContent({ url }: PDFPreviewContentProps) {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-center space-y-4">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
      <iframe
        src={url}
        className="w-full h-full border-0"
        title="PDF Preview"
        onError={() => setError("无法加载 PDF 文件")}
      />
    </div>
  );
}
