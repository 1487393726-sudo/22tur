"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { UserPlus, Trash2, Shield, User, Search, Users } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { toast } from "sonner"

interface ProjectMember {
  id: string
  role: string
  joinedAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
    position?: string
  }
}

interface ProjectMembersProps {
  projectId: string
  members: ProjectMember[]
  onUpdate: () => void
}

export function ProjectMembers({ projectId, members, onUpdate }: ProjectMembersProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedRole, setSelectedRole] = useState("MEMBER")

  // 搜索用户
  const handleSearchUsers = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error("Failed to search users")
      const data = await response.json()
      
      // 过滤掉已经是成员的用户
      const memberIds = members.map((m) => m.user.id)
      const filteredResults = data.users.filter((u: any) => !memberIds.includes(u.id))
      setSearchResults(filteredResults)
    } catch (error) {
      console.error("Failed to search users:", error)
      toast.error("搜索用户失败")
    } finally {
      setIsSearching(false)
    }
  }

  // 添加成员
  const handleAddMember = async () => {
    if (!selectedUserId) {
      toast.error("请选择用户")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          role: selectedRole,
        }),
      })

      if (!response.ok) throw new Error("Failed to add member")

      toast.success("成员已添加")
      setIsAddDialogOpen(false)
      setSelectedUserId("")
      setSelectedRole("MEMBER")
      setSearchQuery("")
      setSearchResults([])
      onUpdate()
    } catch (error) {
      console.error("Failed to add member:", error)
      toast.error("添加成员失败")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 修改角色
  const handleUpdateRole = async () => {
    if (!selectedMember) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/members/${selectedMember.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      })

      if (!response.ok) throw new Error("Failed to update role")

      toast.success("角色已更新")
      setIsEditDialogOpen(false)
      setSelectedMember(null)
      onUpdate()
    } catch (error) {
      console.error("Failed to update role:", error)
      toast.error("更新角色失败")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 移除成员
  const handleRemoveMember = async () => {
    if (!selectedMember) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/members/${selectedMember.id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to remove member")

      toast.success("成员已移除")
      setIsDeleteDialogOpen(false)
      setSelectedMember(null)
      onUpdate()
    } catch (error) {
      console.error("Failed to remove member:", error)
      toast.error("移除成员失败")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { text: string; variant: any }> = {
      LEADER: { text: "负责人", variant: "default" },
      MEMBER: { text: "成员", variant: "secondary" },
      VIEWER: { text: "查看者", variant: "outline" },
    }
    const config = roleMap[role] || roleMap.MEMBER
    return <Badge variant={config.variant as any}>{config.text}</Badge>
  }

  const getRoleIcon = (role: string) => {
    return role === "LEADER" ? (
      <Shield className="h-4 w-4 text-yellow-400" />
    ) : (
      <User className="h-4 w-4 text-white300" />
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">项目成员</h3>
          <p className="text-sm text-white200">共 {members.length} 名成员</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              添加成员
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 border-white/20">
            <DialogHeader>
              <DialogTitle className="text-white">添加项目成员</DialogTitle>
              <DialogDescription className="text-white200">
                搜索并添加用户到项目
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-white">
                  搜索用户
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white300" />
                  <Input
                    id="search"
                    placeholder="输入姓名或邮箱搜索..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      handleSearchUsers(e.target.value)
                    }}
                    className="bg-white/10 border-white/20 text-white pl-10"
                  />
                </div>
                {isSearching && (
                  <p className="text-sm text-white200">搜索中...</p>
                )}
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto space-y-2 bg-white/5 rounded-lg p-2">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setSelectedUserId(user.id)
                          setSearchQuery(`${user.firstName} ${user.lastName}`)
                          setSearchResults([])
                        }}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-purple-500 text-white text-xs">
                            {user.firstName[0]}
                            {user.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-white200 truncate">{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-white">
                  角色
                </Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LEADER">负责人</SelectItem>
                    <SelectItem value="MEMBER">成员</SelectItem>
                    <SelectItem value="VIEWER">查看者</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setSelectedUserId("")
                  setSearchQuery("")
                  setSearchResults([])
                }}
                className="text-white border-white/20"
              >
                取消
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={isSubmitting || !selectedUserId}
                className="bg-white/20 hover:bg-white/30 text-white"
              >
                {isSubmitting ? "添加中..." : "添加"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 成员列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((member) => (
          <Card key={member.id} className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.user.avatar} />
                  <AvatarFallback className="bg-purple-500 text-white">
                    {member.user.firstName[0]}
                    {member.user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getRoleIcon(member.role)}
                    <h4 className="text-white font-medium truncate">
                      {member.user.firstName} {member.user.lastName}
                    </h4>
                  </div>
                  <p className="text-sm text-white200 truncate mb-2">{member.user.email}</p>
                  {member.user.position && (
                    <p className="text-xs text-white300 mb-2">{member.user.position}</p>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    {getRoleBadge(member.role)}
                    <span className="text-xs text-white200">
                      加入于 {format(new Date(member.joinedAt), "yyyy-MM-dd", { locale: zhCN })}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedMember(member)
                        setSelectedRole(member.role)
                        setIsEditDialogOpen(true)
                      }}
                      className="text-white border-white/20 hover:bg-white/10"
                    >
                      修改角色
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedMember(member)
                        setIsDeleteDialogOpen(true)
                      }}
                      className="text-red-300 border-red-300/20 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      移除
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {members.length === 0 && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-white300 mx-auto mb-4" />
            <p className="text-white mb-2">暂无项目成员</p>
            <p className="text-white200 text-sm mb-4">点击上方按钮添加成员</p>
          </CardContent>
        </Card>
      )}

      {/* 修改角色对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white">修改成员角色</DialogTitle>
            <DialogDescription className="text-white200">
              修改 {selectedMember?.user.firstName} {selectedMember?.user.lastName} 的角色
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-white">
                角色
              </Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LEADER">负责人</SelectItem>
                  <SelectItem value="MEMBER">成员</SelectItem>
                  <SelectItem value="VIEWER">查看者</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="text-white border-white/20"
            >
              取消
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={isSubmitting}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">确认移除成员</AlertDialogTitle>
            <AlertDialogDescription className="text-white200">
              确定要将 {selectedMember?.user.firstName} {selectedMember?.user.lastName}{" "}
              从项目中移除吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-white border-white/20">取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isSubmitting ? "移除中..." : "确认移除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
