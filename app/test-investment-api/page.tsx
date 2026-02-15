"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function TestInvestmentAPI() {
  const { data: session } = useSession();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("开始测试 API...");
      console.log("Session:", session);

      const response = await fetch("/api/user/investment-status", {
        credentials: 'include',
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const data = await response.json();
      console.log("Response data:", data);

      setResult(data);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">测试投资状态 API</h1>
      
      <div className="mb-4">
        <p className="mb-2">当前会话信息：</p>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <button
        onClick={testAPI}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "测试中..." : "测试 API"}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
          <p className="text-red-800 font-bold">错误：</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
          <p className="text-green-800 font-bold">API 响应：</p>
          <pre className="mt-2 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
          <div className="mt-4">
            <p className="font-semibold">hasInvestments: {String(result.hasInvestments)}</p>
            <p className="font-semibold">totalAmount: ¥{result.totalAmount?.toLocaleString()}</p>
            <p className="font-semibold">解锁状态: {result.hasInvestments ? "✅ 已解锁" : "❌ 未解锁"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
