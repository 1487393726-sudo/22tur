'use client'

import { useState, useEffect } from 'react'
import { HexHubProjectResponse } from '@/lib/hexhub/types'

export function HexHubProjectManagement() {
  const [projects, setProjects] = useState<HexHubProjectResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'PRIVATE',
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/hexhub/projects')
      const result = await response.json()
      if (result.success) {
        setProjects(result.data)
      } else {
        setError(result.error || '加载项目失败')
      }
    } catch (err) {
      setError('加载项目失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/hexhub/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      if (result.success) {
        setProjects([...projects, result.data])
        setFormData({
          name: '',
          description: '',
          visibility: 'PRIVATE',
        })
        setShowForm(false)
      } else {
        setError(result.error || '创建项目失败')
      }
    } catch (err) {
      setError('创建项目失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('确定要删除此项目吗？')) return

    try {
      const response = await fetch(`/api/hexhub/projects/${projectId}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      if (result.success) {
        setProjects(projects.filter((p) => p.id !== projectId))
      } else {
        setError(result.error || '删除项目失败')
      }
    } catch (err) {
      setError('删除项目失败')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">项目管理</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? '取消' : '新建项目'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateProject} className="bg-gray-50 p-6 rounded space-y-4">
          <input
            type="text"
            placeholder="项目名称"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
            className="w-full px-3 py-2 border rounded"
          />
          <textarea
            placeholder="项目描述"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border rounded"
            rows={3}
          />
          <select
            value={formData.visibility}
            onChange={(e) =>
              setFormData({ ...formData, visibility: e.target.value })
            }
            className="w-full px-3 py-2 border rounded"
          >
            <option value="PRIVATE">私有</option>
            <option value="SHARED">共享</option>
            <option value="PUBLIC">公开</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? '创建中...' : '创建项目'}
          </button>
        </form>
      )}

      {loading && !showForm ? (
        <div className="text-center py-8">加载中...</div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded p-4 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {project.description || '无描述'}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {project.visibility}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      {project.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
