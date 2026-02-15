'use client'

import { useState, useEffect } from 'react'
import { HexHubUserResponse } from '@/lib/hexhub/types'

export function HexHubUserManagement() {
  const [users, setUsers] = useState<HexHubUserResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
  })

  // 加载用户列表
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/hexhub/users')
      const result = await response.json()
      if (result.success) {
        setUsers(result.data)
      } else {
        setError(result.error || '加载用户失败')
      }
    } catch (err) {
      setError('加载用户失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/hexhub/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      if (result.success) {
        setUsers([...users, result.data])
        setFormData({
          email: '',
          username: '',
          password: '',
          firstName: '',
          lastName: '',
        })
        setShowForm(false)
      } else {
        setError(result.error || '创建用户失败')
      }
    } catch (err) {
      setError('创建用户失败')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要删除此用户吗？')) return

    try {
      const response = await fetch(`/api/hexhub/users/${userId}`, {
        method: 'DELETE',
      })

      const result = await response.json()
      if (result.success) {
        setUsers(users.filter((u) => u.id !== userId))
      } else {
        setError(result.error || '删除用户失败')
      }
    } catch (err) {
      setError('删除用户失败')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">用户管理</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showForm ? '取消' : '新建用户'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreateUser} className="bg-gray-50 p-6 rounded space-y-4">
          <input
            type="email"
            placeholder="邮箱"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="用户名"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="password"
            placeholder="密码"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="名字"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            className="w-full px-3 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="姓氏"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            className="w-full px-3 py-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? '创建中...' : '创建用户'}
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
                <th className="border p-3 text-left">邮箱</th>
                <th className="border p-3 text-left">用户名</th>
                <th className="border p-3 text-left">名字</th>
                <th className="border p-3 text-left">角色</th>
                <th className="border p-3 text-left">状态</th>
                <th className="border p-3 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border p-3">{user.email}</td>
                  <td className="border p-3">{user.username}</td>
                  <td className="border p-3">{user.firstName || '-'}</td>
                  <td className="border p-3">{user.role}</td>
                  <td className="border p-3">{user.status}</td>
                  <td className="border p-3">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
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
