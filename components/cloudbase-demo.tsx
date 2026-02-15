"use client";

import { useState, useEffect } from "react";
import { useCloudBase } from "@/hooks/use-cloudbase";
import { db } from "@/lib/cloudbase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, RefreshCw } from "lucide-react";

interface TodoItem {
  _id?: string;
  text: string;
  completed: boolean;
  createdAt?: any;
}

export function CloudBaseDemo() {
  const { isReady, isLoggedIn } = useCloudBase();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [loading, setLoading] = useState(false);

  // 获取todos列表
  const fetchTodos = async () => {
    if (!isReady) return;

    setLoading(true);
    try {
      const result = await db().collection("todos").get();
      setTodos(result.data || []);
    } catch (error) {
      console.error("获取todos失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 添加todo
  const addTodo = async () => {
    if (!isReady || !newTodo.trim()) return;

    try {
      await db().collection("todos").add({
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date(),
      });
      setNewTodo("");
      await fetchTodos();
    } catch (error) {
      console.error("添加todo失败:", error);
    }
  };

  // 删除todo
  const deleteTodo = async (id: string) => {
    if (!isReady) return;

    try {
      await db().collection("todos").doc(id).remove();
      await fetchTodos();
    } catch (error) {
      console.error("删除todo失败:", error);
    }
  };

  // 切换完成状态
  const toggleComplete = async (id: string, completed: boolean) => {
    if (!isReady) return;

    try {
      await db().collection("todos").doc(id).update({
        completed: !completed,
      });
      await fetchTodos();
    } catch (error) {
      console.error("更新todo失败:", error);
    }
  };

  useEffect(() => {
    if (isReady) {
      fetchTodos();
    }
  }, [isReady]);

  // 在服务器端渲染时显示加载状态
  if (typeof window === "undefined" || !isReady) {
    return (
      <Card data-oid="hfoq41d">
        <CardHeader data-oid="lf92ie8">
          <CardTitle data-oid="2hsfx0f">CloudBase Demo</CardTitle>
        </CardHeader>
        <CardContent data-oid="fow55fb">
          <p className="text-muted-foreground" data-oid="unj0_n5">
            等待CloudBase连接...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-oid="_3asxlg">
      <CardHeader data-oid="33noha6">
        <div className="flex items-center justify-between" data-oid="dqq3vr_">
          <CardTitle data-oid="f0c7t:8">CloudBase Demo - Todo列表</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTodos}
            disabled={loading}
            data-oid="xyasm88"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              data-oid="903pznv"
            />
            刷新
          </Button>
        </div>
      </CardHeader>
      <CardContent data-oid="c0tvyyw">
        {/* 添加新todo */}
        <div className="flex gap-2 mb-4" data-oid="21s8zcu">
          <Input
            placeholder="输入新的todo..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTodo()}
            data-oid="8sprcm9"
          />

          <Button
            onClick={addTodo}
            disabled={!newTodo.trim()}
            data-oid="7.58bw9"
          >
            <Plus className="h-4 w-4" data-oid="itpdts2" />
          </Button>
        </div>

        {/* Todo列表 */}
        <div className="space-y-2" data-oid="_efuaap">
          {todos.length === 0 ? (
            <p
              className="text-muted-foreground text-center py-4"
              data-oid="ykyxy7_"
            >
              暂无todo，添加一个开始吧！
            </p>
          ) : (
            todos.map((todo) => (
              <div
                key={todo._id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                data-oid="bm9snpv"
              >
                <div className="flex items-center gap-3" data-oid="hy_e1-2">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo._id!, todo.completed)}
                    className="h-4 w-4"
                    data-oid="42n9ol1"
                  />

                  <span
                    className={
                      todo.completed ? "line-through text-muted-foreground" : ""
                    }
                    data-oid=":wqnm9w"
                  >
                    {todo.text}
                  </span>
                  {todo.completed && (
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      data-oid="dfv0tqn"
                    >
                      已完成
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTodo(todo._id!)}
                  className="text-destructive hover:text-destructive"
                  data-oid="g.juwg0"
                >
                  <Trash2 className="h-4 w-4" data-oid=":83544m" />
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 text-xs text-muted-foreground" data-oid="ys.vem4">
          <p data-oid="5e2nkrf">✅ CloudBase数据库已连接</p>
          <p data-oid="6tppa9u">📝 数据集合: todos</p>
          <p data-oid="xltnh60">
            🔑 用户状态: {isLoggedIn ? "已登录" : "匿名"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
