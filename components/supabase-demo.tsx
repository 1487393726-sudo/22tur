"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/use-supabase";
import { db } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  RefreshCw,
  User as UserIcon,
  Mail,
  Lock,
} from "lucide-react";

interface TodoItem {
  id?: number;
  text: string;
  completed: boolean;
  created_at?: string;
}

interface UserForm {
  email: string;
  password: string;
}

export function SupabaseDemo() {
  const { isReady, isLoggedIn, user, supabase } = useSupabase();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [userForm, setUserForm] = useState<UserForm>({
    email: "",
    password: "",
  });
  const [authLoading, setAuthLoading] = useState(false);

  // 获取todos列表
  const fetchTodos = async () => {
    if (!isReady || !isLoggedIn || !user) return;

    setLoading(true);
    try {
      const data = await db.select("todos", "*", { user_id: user.id });
      setTodos((data as unknown as TodoItem[]) || []);
    } catch (error) {
      console.error("获取todos失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 添加todo
  const addTodo = async () => {
    if (!isReady || !isLoggedIn || !newTodo.trim() || !user) return;

    try {
      await db.insert("todos", {
        text: newTodo.trim(),
        completed: false,
        user_id: user.id,
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

  // 用户登出
  const handleLogout = async () => {
    if (!supabase) return;
    
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("登出失败:", error);
    }
  };

  useEffect(() => {
    if (isReady && isLoggedIn) {
      fetchTodos();
    }
  }, [isReady, isLoggedIn, user]);

  if (!isReady) {
    return (
      <Card data-oid="wl6widf">
        <CardHeader data-oid="wx5s2yq">
          <CardTitle data-oid="fg9w1_w">Supabase Demo</CardTitle>
        </CardHeader>
        <CardContent data-oid="c0uzmyc">
          <p className="text-muted-foreground" data-oid="2mtm63b">
            等待Supabase连接...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-oid="cpmy3un">
      {/* 用户认证区域 */}
      <Card data-oid="isas0de">
        <CardHeader data-oid="u_2ijek">
          <CardTitle className="flex items-center gap-2" data-oid="xkf9-v-">
            <UserIcon className="h-5 w-5" data-oid="yp0:f--" />
            用户认证
          </CardTitle>
        </CardHeader>
        <CardContent data-oid="zqbv1px">
          {isLoggedIn ? (
            <div className="space-y-4" data-oid="2i7uwm7">
              <div
                className="flex items-center justify-between p-4 bg-green-50 rounded-lg"
                data-oid="cf9yzo0"
              >
                <div data-oid="bdb0d7d">
                  <p className="font-medium text-green-800" data-oid="t:9yniy">
                    已登录
                  </p>
                  <p className="text-sm text-green-600" data-oid="9juwdjb">
                    {user?.email}
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                  data-oid="e_unp5e"
                >
                  在线
                </Badge>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
                data-oid="ks..ezl"
              >
                退出登录
              </Button>
            </div>
          ) : (
            <div className="space-y-4" data-oid="edyly5h">
              <div className="grid grid-cols-2 gap-4" data-oid=":j6cs8w">
                <Input
                  type="email"
                  placeholder="邮箱地址"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  data-oid="s04kqhm"
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
                  data-oid="n6s56:6"
                />
              </div>
              <div className="grid grid-cols-2 gap-4" data-oid="vughg9b">
                <Button
                  onClick={handleLogin}
                  disabled={authLoading}
                  data-oid=".iezhbt"
                >
                  <Mail className="h-4 w-4 mr-2" data-oid="71_:y.g" />
                  登录
                </Button>
                <Button
                  onClick={handleSignup}
                  variant="outline"
                  disabled={authLoading}
                  data-oid="cfvdt03"
                >
                  <UserIcon className="h-4 w-4 mr-2" data-oid="t08wegb" />
                  注册
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Todo管理区域 */}
      <Card data-oid="93dbvu3">
        <CardHeader data-oid="l6ia13f">
          <div className="flex items-center justify-between" data-oid="xz42t.y">
            <CardTitle data-oid="7mv:6az">Todo列表管理</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTodos}
              disabled={loading || !isLoggedIn}
              data-oid="xyaplkr"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                data-oid="n0afb:m"
              />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent data-oid="gpu0ipj">
          {!isLoggedIn ? (
            <div
              className="text-center py-8 text-muted-foreground"
              data-oid="d1vzi38"
            >
              <Lock
                className="h-12 w-12 mx-auto mb-4 opacity-50"
                data-oid="y7vv0-c"
              />
              <p data-oid="yn3rt:v">请先登录以使用Todo功能</p>
            </div>
          ) : (
            <>
              {/* 添加新todo */}
              <div className="flex gap-2 mb-4" data-oid="6o:a600">
                <Input
                  placeholder="输入新的todo..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTodo()}
                  data-oid="r-cuqby"
                />

                <Button
                  onClick={addTodo}
                  disabled={!newTodo.trim()}
                  data-oid="3.xi3vk"
                >
                  <Plus className="h-4 w-4" data-oid="km6p:4x" />
                </Button>
              </div>

              {/* Todo列表 */}
              <div className="space-y-2" data-oid="4z_1l3q">
                {todos.length === 0 ? (
                  <p
                    className="text-muted-foreground text-center py-4"
                    data-oid="xk3by2o"
                  >
                    暂无todo，添加一个开始吧！
                  </p>
                ) : (
                  todos.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      data-oid="n37fer2"
                    >
                      <div
                        className="flex items-center gap-3"
                        data-oid="1rcl__g"
                      >
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() =>
                            toggleComplete(todo.id!, todo.completed)
                          }
                          className="h-4 w-4"
                          aria-label={`标记 ${todo.title} 为${todo.completed ? '未完成' : '已完成'}`}
                          data-oid="3:ca:ad"
                        />

                        <span
                          className={
                            todo.completed
                              ? "line-through text-muted-foreground"
                              : ""
                          }
                          data-oid="chnvgp7"
                        >
                          {todo.text}
                        </span>
                        {todo.completed && (
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            data-oid="rbedujv"
                          >
                            已完成
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTodo(todo.id!)}
                        className="text-destructive hover:text-destructive"
                        data-oid="xwgjxzd"
                      >
                        <Trash2 className="h-4 w-4" data-oid="hc-cpzu" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          <div
            className="mt-4 text-xs text-muted-foreground"
            data-oid="tc6km4p"
          >
            <p data-oid="3zhhatg">✅ Supabase PostgreSQL数据库</p>
            <p data-oid="ryjzyb.">📝 数据表: todos</p>
            <p data-oid="g8k82a:">
              🔑 用户认证: {isLoggedIn ? "已登录" : "未登录"}
            </p>
            <p data-oid="_65:bg:">🔄 实时数据同步</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
