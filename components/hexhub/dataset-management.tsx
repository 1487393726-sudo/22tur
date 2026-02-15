'use client'

import { useState, useEffect } from 'react'
import { HexHubDatasetResponse } from '@/lib/hexhub/types'

export function HexHubDatasetManagement() {
  const [datasets, setDatasets] = useState<HexHubDatasetResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    projectId: '',
    name: '',
    description: '',
    dataType: 'CUSTOM',
    format: 'JSON',
  })

  useEffect(() => {
    fetchDatasets()
  }, [])

  const fetchDatasets = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/hexhub/datasets')
      const result = await response.json()
      if (result.success) {
        setDatasets(result.data)
      } else {
        setError(result.error || '加载数据集失败')
      }
    } catch (err) {
      setError('加载数据集失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDataset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/hexhub/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      if (result.success) {
        setDatasets([...datasets, result.data])
        setFormData({
          projectId: '',
          name: '',
          description: '',
          dataType: 'CUSTOM',
          format: 'JSON',
        })
        setShowForm(false)
      } else {
        setError(result.error || '创建数据集失败')
      }
    } catch (err) {
      setError('创建数据集失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDataset = async (datasetId: string) => {
    if (!confirm('确定要删除此数据集吗？')) return

    try {
      const response = await fetch(`/api/hexhub/datasets/${datasetId}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      if (result.success) {
        setDatasets(datasets.filter((d) => d.id !== datasetId))
      } else {
        setError(result.error || '删除数据集失败')
      }
    } catch (err) {
      setError('删除数据集失败')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">数据集管理</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? '取消' : '新建数据集'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateDataset} className="bg-gray-50 p-6 rounded space-y-4">
          <input
            type="text"
            placeholder="项目 ID"
            value={formData.projectId}
            onChange={(e) =>
              setFormData({ ...formData, projectId: e.target.value })
            }
            required
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="数据集名称"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
            className="w-full px-3 py-2 border rounded"
          />
          <textarea
            placeholder="数据集描述"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border rounded"
            rows={3}
          />
          <select
            value={formData.dataType}
            onChange={(e) =>
              setFormData({ ...formData, dataType: e.target.value })
            }
            className="w-full px-3 py-2 border rounded"
          >
            <option value="USER">用户</option>
            <option value="EVENT">事件</option>
            <option value="PRODUCT">产品</option>
            <option value="ORDER">订单</option>
            <option value="CUSTOM">自定义</option>
          </select>
          <select
            value={formData.format}
            onChange={(e) =>
              setFormData({ ...formData, format: e.target.value })
            }
            className="w-full px-3 py-2 border rounded"
          >
            <option value="JSON">JSON</option>
            <option value="CSV">CSV</option>
            <option value="XML">XML</option>
            <option value="PARQUET">PARQUET</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? '创建中...' : '创建数据集'}
          </button>
        </form>
      )}

      {loading && !showForm ? (
        <div className="text-center py-8">加载中...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left">名称</th>
                <th className="border p-3 text-left">数据类型</th>
                <th className="border p-3 text-left">格式</th>
                <th className="border p-3 text-left">记录数</th>
                <th className="border p-3 text-left">大小</th>
                <th className="border p-3 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map((dataset) => (
                <tr key={dataset.id} className="hover:bg-gray-50">
                  <td className="border p-3">{dataset.name}</td>
                  <td className="border p-3">{dataset.dataType}</td>
                  <td className="border p-3">{dataset.format}</td>
                  <td className="border p-3">{dataset.recordCount}</td>
                  <td className="border p-3">{(dataset.size / 1024).toFixed(2)} KB</td>
                  <td className="border p-3">
                    <button
                      onClick={() => handleDeleteDataset(dataset.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
