"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { supabase, db } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  RefreshCw,
  User as UserIcon,
  Mail,
  Lock,
  Edit,
  Save,
  X,
  CheckCircle,
  Circle,
  Filter,
  Clock,
} from "lucide-react";

interface TodoItem {
  id?: number;
  text: string;
  completed: boolean;
  user_id?: string;
  category_id?: number;
  created_at?: string;
  updated_at?: string;
  categories?: Category;
}

interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface UserForm {
  email: string;
  password: string;
  username?: string;
}

export function SupabaseEnhancedDemo() {
  const { isReady, isLoggedIn, user } = useSupabase();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [userForm, setUserForm] = useState<UserForm>({
    email: "",
    password: "",
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [editingTodo, setEditingTodo] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [profile, setProfile] = useState<any>(null);

  // 获取分类列表
  const fetchCategories = async () => {
    if (!isReady) return;

    try {
      const data = await db.select("categories");
      setCategories((data as unknown as Category[]) || []);
    } catch (error) {
      console.error("获取分类失败:", error);
    }
  };

  // 获取todos列表
  const fetchTodos = async () => {
    if (!isReady || !isLoggedIn || !supabase || !user) return;

    setLoading(true);
    try {
      let query = supabase
        .from("todos")
        .select(
          `
          *,
          categories (
            id,
            name,
            color,
            icon
          )
        `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // 应用分类过滤
      if (selectedCategory !== "all") {
        query = query.eq("category_id", parseInt(selectedCategory));
      }

      const { data, error } = await query;

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error("获取todos失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 获取用户profile
  const fetchProfile = async () => {
    if (!isReady || !isLoggedIn || !supabase || !user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }
      setProfile(data);
    } catch (error) {
      console.error("获取profile失败:", error);
    }
  };

  // 添加todo
  const addTodo = async () => {
    if (!isReady || !isLoggedIn || !newTodo.trim()) return;

    try {
      await db.insert("todos", {
        text: newTodo.trim(),
        completed: false,
        user_id: user.id,
        category_id:
          selectedCategory !== "all" ? parseInt(selectedCategory) : null,
      });
      setNewTodo("");
      await fetchTodos();
    } catch (error) {
      console.error("添加todo失败:", error);
    }
  };

  // 删除todo
  const deleteTodo = async (id: number) => {
    if (!isReady) return;

    try {
      await db.delete("todos", { id });
      await fetchTodos();
    } catch (error) {
      console.error("删除todo失败:", error);
    }
  };

  // 切换完成状态
  const toggleComplete = async (id: number, completed: boolean) => {
    if (!isReady) return;

    try {
      await db.update("todos", { completed: !completed }, { id });
      await fetchTodos();
    } catch (error) {
      console.error("更新todo失败:", error);
    }
  };

  // 开始编辑todo
  const startEdit = (todo: TodoItem) => {
    setEditingTodo(todo.id!);
    setEditingText(todo.text);
  };

  // 保存编辑
  const saveEdit = async (id: number) => {
    if (!isReady || !editingText.trim()) return;

    try {
      await db.update("todos", { text: editingText.trim() }, { id });
      setEditingTodo(null);
      setEditingText("");
      await fetchTodos();
    } catch (error) {
      console.error("更新todo失败:", error);
    }
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingTodo(null);
    setEditingText("");
  };

  // 用户登录
  const handleLogin = async () => {
    if (!userForm.email || !userForm.password) {
      alert("请输入邮箱和密码");
      return;
    }

    if (!supabase) return;
    
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userForm.email,
        password: userForm.password,
      });

      if (error) {
        alert("登录失败: " + error.message);
      }
    } catch (error) {
      console.error("登录失败:", error);
      alert("登录失败，请检查账号密码");
    } finally {
      setAuthLoading(false);
    }
  };

  // 用户注册
  const handleSignup = async () => {
    if (!userForm.email || !userForm.password) {
      alert("请输入邮箱和密码");
      return;
    }

    if (!supabase) return;

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userForm.email,
        password: userForm.password,
        options: {
          data: {
            username: userForm.username,
          },
        },
      });

      if (error) {
        alert("注册失败: " + error.message);
      } else {
        alert("注册成功！请检查邮箱确认账号");
      }
    } catch (error) {
      console.error("注册失败:", error);
      alert("注册失败");
    } finally {
      setAuthLoading(false);
    }
  };

  // 更新用户profile
  const updateProfile = async (updates: any) => {
    if (!isReady || !isLoggedIn || !supabase || !user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, ...updates });

      if (error) throw error;
      await fetchProfile();
    } catch (error) {
      console.error("更新profile失败:", error);
    }
  };

  // 用户登出
  const handleLogout = async () => {
    if (!supabase) return;
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("登出失败:", error);
    }
  };

  // 设置实时订阅
  useEffect(() => {
    if (!isReady || !isLoggedIn || !supabase) return;

    const subscription = supabase
      .channel("todos_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todos",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("实时数据变化:", payload);
          fetchTodos(); // 刷新列表
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isReady, isLoggedIn, user]);

  useEffect(() => {
    if (isReady) {
      fetchCategories();
    }
  }, [isReady]);

  useEffect(() => {
    if (isReady && isLoggedIn) {
      fetchTodos();
      fetchProfile();
    }
  }, [isReady, isLoggedIn, selectedCategory]);

  if (!isReady) {
    return (
      <Card data-oid="0r0mhi:">
        <CardHeader data-oid="pgj8lb4">
          <CardTitle data-oid="lrhv9ne">Supabase 增强演示</CardTitle>
        </CardHeader>
        <CardContent data-oid=":rms217">
          <p className="text-muted-foreground" data-oid="s8lx2-4">
            等待Supabase连接...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-oid="p-hdoeq">
      {/* 用户认证区域 */}
      <Card data-oid="nx6qsmu">
        <CardHeader data-oid="uywd:9t">
          <CardTitle className="flex items-center gap-2" data-oid="8e10-w1">
            <UserIcon className="h-5 w-5" data-oid="o9ean03" />
            用户认证与资料
          </CardTitle>
        </CardHeader>
        <CardContent data-oid="t9_f3lb">
          {isLoggedIn ? (
            <div className="space-y-4" data-oid="mm8hf3k">
              <div
                className="flex items-center justify-between p-4 bg-green-50 rounded-lg"
                data-oid="nxv62wi"
              >
                <div data-oid="-meara.">
                  <p className="font-medium text-green-800" data-oid="djowb7h">
                    已登录
                  </p>
                  <p className="text-sm text-green-600" data-oid="zqip926">
                    {user.email}
                  </p>
                  <p className="text-xs text-green-500" data-oid="9en1pqv">
                    ID: {user.id?.slice(0, 8)}...
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                  data-oid="8epcshm"
                >
                  在线
                </Badge>
              </div>

              {profile && (
                <div className="p-4 bg-blue-50 rounded-lg" data-oid="itd1q-a">
                  <p
                    className="font-medium text-blue-800 mb-2"
                    data-oid="qjlllmo"
                  >
                    用户资料
                  </p>
                  <div className="grid grid-cols-2 gap-4" data-oid="0icda42">
                    <Input
                      placeholder="用户名"
                      value={profile.username || ""}
                      onChange={(e) =>
                        updateProfile({ username: e.target.value })
                      }
                      className="mb-2"
                      data-oid="1a52p_."
                    />

                    <Input
                      placeholder="全名"
                      value={profile.full_name || ""}
                      onChange={(e) =>
                        updateProfile({ full_name: e.target.value })
                      }
                      className="mb-2"
                      data-oid="j9m8zqh"
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
                data-oid="hn67h4q"
              >
                退出登录
              </Button>
            </div>
          ) : (
            <div className="space-y-4" data-oid="yqafcyo">
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                data-oid="116c9e8"
              >
                <Input
                  type="email"
                  placeholder="邮箱地址"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  data-oid="e8i.8cx"
                />

                <Input
                  type="password"
                  placeholder="密码"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  data-oid="vt:3jdq"
                />

                <Input
                  placeholder="用户名（可选）"
                  value={userForm.username || ""}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  data-oid="lob6ntj"
                />

                <div className="grid grid-cols-2 gap-2" data-oid="w1iq6:4">
                  <Button
                    onClick={handleLogin}
                    disabled={authLoading}
                    data-oid="v6b.tt2"
                  >
                    <Mail className="h-4 w-4 mr-2" data-oid=":id1ib." />
                    登录
                  </Button>
                  <Button
                    onClick={handleSignup}
                    variant="outline"
                    disabled={authLoading}
                    data-oid="hnjnbqx"
                  >
                    <UserIcon className="h-4 w-4 mr-2" data-oid="51s:id3" />
                    注册
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Todo管理区域 */}
      <Card data-oid="exd8.s0">
        <CardHeader data-oid="958u_mb">
          <div className="flex items-center justify-between" data-oid="ndwt2-y">
            <CardTitle className="flex items-center gap-2" data-oid="mht8m0b">
              <CheckCircle className="h-5 w-5" data-oid="kn5ewnd" />
              高级Todo管理
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTodos}
              disabled={loading || !isLoggedIn}
              data-oid="0sfq5_z"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                data-oid="5dv2re0"
              />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent data-oid="khwnxv5">
          {!isLoggedIn ? (
            <div
              className="text-center py-8 text-muted-foreground"
              data-oid="8byxi_f"
            >
              <Lock
                className="h-12 w-12 mx-auto mb-4 opacity-50"
                data-oid="vrdou14"
              />
              <p data-oid="b28guyb">请先登录以使用Todo功能</p>
            </div>
          ) : (
            <>
              {/* 分类过滤器 */}
              <div className="flex items-center gap-4 mb-4" data-oid="::11w3m">
                <Filter
                  className="h-4 w-4 text-muted-foreground"
                  data-oid="lq:e6sq"
                />
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                  data-oid="3sj89x0"
                >
                  <SelectTrigger className="w-48" data-oid=":-h8iuf">
                    <SelectValue placeholder="选择分类" data-oid="au01bno" />
                  </SelectTrigger>
                  <SelectContent data-oid="7hg0dto">
                    <SelectItem value="all" data-oid="rhdj:m5">
                      全部分类
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                        data-oid="b8kiest"
                      >
                        <div
                          className="flex items-center gap-2"
                          data-oid="w07pp8h"
                        >
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                            data-oid="-6vmet."
                          />

                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="outline" data-oid="j5_sf9o">
                  {todos.length} 个任务
                </Badge>
              </div>

              {/* 添加新todo */}
              <div className="flex gap-2 mb-4" data-oid="xuqsr75">
                <Input
                  placeholder="输入新的todo..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTodo()}
                  data-oid=".kfm2gf"
                />

                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                  data-oid="ls6bslm"
                >
                  <SelectTrigger className="w-32" data-oid="9c11-mu">
                    <SelectValue placeholder="分类" data-oid="nc6tbw:" />
                  </SelectTrigger>
                  <SelectContent data-oid="-nt1ylp">
                    <SelectItem value="all" data-oid="-gbidmn">
                      无分类
                    </SelectItem>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                        data-oid="vpl-mwm"
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={addTodo}
                  disabled={!newTodo.trim()}
                  data-oid="re.gvee"
                >
                  <Plus className="h-4 w-4" data-oid="seoyozq" />
                </Button>
              </div>

              {/* Todo列表 */}
              <div className="space-y-2" data-oid="j0h11ir">
                {todos.length === 0 ? (
                  <p
                    className="text-muted-foreground text-center py-4"
                    data-oid="qyw12my"
                  >
                    暂无todo，添加一个开始吧！
                  </p>
                ) : (
                  todos.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      data-oid=".e6rf3k"
                    >
                      <div
                        className="flex items-center gap-3 flex-1"
                        data-oid="6z_nomf"
                      >
                        <button
                          onClick={() =>
                            toggleComplete(todo.id!, todo.completed)
                          }
                          className="flex-shrink-0"
                          data-oid="7xievng"
                        >
                          {todo.completed ? (
                            <CheckCircle
                              className="h-4 w-4 text-green-600"
                              data-oid="v4yct:t"
                            />
                          ) : (
                            <Circle
                              className="h-4 w-4 text-muted-foreground"
                              data-oid="clnrphp"
                            />
                          )}
                        </button>

                        {todo.categories && (
                          <span
                            className="px-2 py-1 text-xs rounded-full text-white"
                            style={{ backgroundColor: todo.categories.color }}
                            data-oid="3jrwj61"
                          >
                            {todo.categories.name}
                          </span>
                        )}

                        {editingTodo === todo.id ? (
                          <Input
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="flex-1"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") saveEdit(todo.id!);
                              if (e.key === "Escape") cancelEdit();
                            }}
                            data-oid="wsjcn4n"
                          />
                        ) : (
                          <span
                            className={
                              todo.completed
                                ? "line-through text-muted-foreground"
                                : ""
                            }
                            data-oid="l9-0u:o"
                          >
                            {todo.text}
                          </span>
                        )}

                        {todo.created_at && (
                          <div
                            className="flex items-center gap-1 text-xs text-muted-foreground"
                            data-oid="e1c1:uq"
                          >
                            <Clock className="h-3 w-3" data-oid=":9z-6no" />
                            {new Date(todo.created_at).toLocaleDateString()}
                          </div>
                        )}

                        {todo.completed && (
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            data-oid="5fyv7dm"
                          >
                            已完成
                          </Badge>
                        )}
                      </div>

                      <div
                        className="flex items-center gap-2"
                        data-oid="f8g0l4s"
                      >
                        {editingTodo === todo.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => saveEdit(todo.id!)}
                              className="text-green-600"
                              data-oid=":0xiq:4"
                            >
                              <Save className="h-4 w-4" data-oid="maa_epc" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEdit}
                              className="text-orange-600"
                              data-oid="84uh4_b"
                            >
                              <X className="h-4 w-4" data-oid="ke_wqx5" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(todo)}
                            className="text-blue-600"
                            data-oid="6t0t9-o"
                          >
                            <Edit className="h-4 w-4" data-oid="eugel6g" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTodo(todo.id!)}
                          className="text-destructive hover:text-destructive"
                          data-oid="as8-3hc"
                        >
                          <Trash2 className="h-4 w-4" data-oid="-5vsn0g" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div
                className="mt-4 text-xs text-muted-foreground"
                data-oid="k4z3hke"
              >
                <p data-oid="f8epl12">✅ Supabase PostgreSQL数据库</p>
                <p data-oid=".8nmoo6">📝 数据表: todos, categories, profiles</p>
                <p data-oid="sl0mqbv">
                  🔑 用户认证: {isLoggedIn ? "已登录" : "未登录"}
                </p>
                <p data-oid="d461phh">🔄 实时数据同步: 已启用</p>
                <p data-oid="2994czm">🛡️ 行级安全: 已配置</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
