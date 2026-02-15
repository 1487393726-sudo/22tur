"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  CalendarIcon,
  Clock,
  User,
  FileText,
  Save,
  Plus,
  Trash2,
  Copy,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// 任务模板数据验证模式
const taskTemplateSchema = z.object({
  name: z.string().min(2, "模板名称至少需要2个字符"),
  description: z.string().optional(),
  category: z.string().min(1, "请选择任务类别"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  estimatedHours: z.string().optional(),
  checklist: z.array(z.string()).default([]),
  defaultAssigneeId: z.string().optional(),
  defaultProjectId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isRecurring: z.boolean().default(false),
  recurringPattern: z
    .enum(["daily", "weekly", "monthly", "quarterly"])
    .optional(),
});

type TaskTemplateFormData = z.infer<typeof taskTemplateSchema>;

// 预设任务类别和优先级
const categories = [
  "开发",
  "设计",
  "测试",
  "文档",
  "会议",
  "客户沟通",
  "项目管理",
  "培训",
  "研究",
  "维护",
];

const priorities = [
  { value: "low", label: "低", color: "bg-gray-500" },
  { value: "medium", label: "中", color: "bg-blue-500" },
  { value: "high", label: "高", color: "bg-orange-500" },
  { value: "urgent", label: "紧急", color: "bg-red-500" },
];

const recurringPatterns = [
  { value: "daily", label: "每日" },
  { value: "weekly", label: "每周" },
  { value: "monthly", label: "每月" },
  { value: "quarterly", label: "每季度" },
];

// 预设模板示例
const predefinedTemplates: TaskTemplateFormData[] = [
  {
    name: "代码审查",
    description: "审查团队提交的代码，确保代码质量和规范",
    category: "开发",
    priority: "high" as const,
    estimatedHours: "2",
    checklist: ["检查代码规范", "评估逻辑正确性", "测试覆盖率", "性能优化建议"],
    tags: ["代码质量", "团队协作"],
    isRecurring: false,
  },
  {
    name: "客户需求会议",
    description: "与客户讨论项目需求和进展",
    category: "客户沟通",
    priority: "high" as const,
    estimatedHours: "1",
    checklist: ["准备会议议程", "记录需求变更", "确认时间节点", "发送会议纪要"],
    tags: ["客户", "需求", "会议"],
    isRecurring: false,
  },
  {
    name: "项目周报",
    description: "整理并提交项目周进展报告",
    category: "项目管理",
    priority: "medium" as const,
    estimatedHours: "1",
    checklist: ["收集团队进展", "统计完成情况", "识别风险问题", "制定下周计划"],
    tags: ["报告", "项目管理"],
    isRecurring: false,
  },
  {
    name: "新功能开发",
    description: "开发新功能模块",
    category: "开发",
    priority: "medium" as const,
    estimatedHours: "8",
    checklist: ["需求分析", "技术设计", "编码实现", "单元测试", "文档编写"],
    tags: ["开发", "新功能"],
    isRecurring: false,
  },
];

export default function TaskTemplateModal({
  onClose,
  onTemplateSelect,
  mode = "select",
}: {
  onClose: () => void;
  onTemplateSelect?: (template: TaskTemplateFormData) => void;
  mode?: "select" | "manage";
}) {
  const [templates, setTemplates] =
    useState<TaskTemplateFormData[]>(predefinedTemplates);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState<"select" | "create">("select");
  const [checklistItems, setChecklistItems] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const { toast } = useToast();

  // 创建/编辑模板表单
  const {
    register: registerTemplate,
    handleSubmit: handleTemplateSubmit,
    reset: resetTemplate,
    formState: { errors: templateErrors },
    setValue: setTemplateValue,
    watch: watchTemplate,
  } = useForm<TaskTemplateFormData>({
    resolver: zodResolver(taskTemplateSchema),
    defaultValues: {
      priority: "medium",
      estimatedHours: "1",
      checklist: [],
      tags: [],
      isRecurring: false,
    },
  });

  const isRecurring = watchTemplate("isRecurring");

  // 保存模板
  const saveTemplate = (data: TaskTemplateFormData) => {
    const newTemplate = {
      ...data,
      checklist: checklistItems,
      tags: tags,
    };

    setTemplates((prev) => [...prev, newTemplate]);
    resetTemplate();
    setChecklistItems([]);
    setTags([]);
    setTagInput("");

    toast({
      title: "模板创建成功",
      description: `任务模板 "${data.name}" 已保存`,
    });

    if (mode === "select") {
      setCurrentTab("select");
    }
  };

  // 使用模板创建任务
  const useTemplate = (template: TaskTemplateFormData) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
      onClose();
    }
  };

  // 删除模板
  const deleteTemplate = (index: number) => {
    setTemplates((prev) => prev.filter((_, i) => i !== index));
    toast({
      title: "模板已删除",
      description: "任务模板已成功删除",
    });
  };

  // 复制模板
  const copyTemplate = (template: TaskTemplateFormData) => {
    const newTemplate = {
      ...template,
      name: `${template.name} - 副本`,
    };
    setTemplates((prev) => [...prev, newTemplate]);
    toast({
      title: "模板已复制",
      description: `已创建 "${template.name}" 的副本`,
    });
  };

  // 添加检查项
  const addChecklistItem = () => {
    if (checklistItems.length < 10) {
      setChecklistItems((prev) => [...prev, ""]);
    }
  };

  // 更新检查项
  const updateChecklistItem = (index: number, value: string) => {
    setChecklistItems((prev) =>
      prev.map((item, i) => (i === index ? value : item)),
    );
  };

  // 删除检查项
  const removeChecklistItem = (index: number) => {
    setChecklistItems((prev) => prev.filter((_, i) => i !== index));
  };

  // 添加标签
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags((prev) => [...prev, tagInput.trim()]);
      setTagInput("");
    }
  };

  // 删除标签
  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = priorities.find((p) => p.value === priority);
    return priorityConfig ? (
      <Badge className={priorityConfig.color} data-oid="d1d0w0a">
        {priorityConfig.label}
      </Badge>
    ) : null;
  };

  if (mode === "manage") {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        data-oid="67y6x87"
      >
        <Card
          className="w-full max-w-4xl max-h-[90vh] overflow-auto"
          data-oid="tzni9dz"
        >
          <CardHeader data-oid="-:wpga8">
            <CardTitle data-oid="80b18fm">任务模板管理</CardTitle>
          </CardHeader>
          <CardContent data-oid="ntmchvz">
            <Tabs
              value={currentTab}
              onValueChange={(value) =>
                setCurrentTab(value as "select" | "create")
              }
              data-oid="n84p519"
            >
              <TabsList
                className="grid w-full grid-cols-2 mb-4"
                data-oid="-53we29"
              >
                <TabsTrigger value="select" data-oid="wpbdch5">
                  现有模板
                </TabsTrigger>
                <TabsTrigger value="create" data-oid="sd81ca9">
                  创建模板
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="select"
                className="space-y-4"
                data-oid="-tqam91"
              >
                <div className="grid gap-4" data-oid="qqb:.hc">
                  {templates.map((template, index) => (
                    <Card key={index} className="p-4" data-oid="-ge.u:n">
                      <div
                        className="flex items-start justify-between"
                        data-oid="t895eax"
                      >
                        <div className="flex-1" data-oid="3g8ng62">
                          <div
                            className="flex items-center gap-2 mb-2"
                            data-oid="yps65ao"
                          >
                            <h3 className="font-medium" data-oid="f-xss8t">
                              {template.name}
                            </h3>
                            {getPriorityBadge(template.priority)}
                            {template.isRecurring && (
                              <Badge variant="outline" data-oid="29cr_nf">
                                循环任务
                              </Badge>
                            )}
                          </div>
                          <p
                            className="text-sm text-gray-600 mb-2"
                            data-oid="46mbozv"
                          >
                            {template.description}
                          </p>
                          <div
                            className="flex items-center gap-4 text-sm text-gray-500 mb-2"
                            data-oid="scuylql"
                          >
                            <span data-oid="2_.1xhu">
                              类别: {template.category}
                            </span>
                            {template.estimatedHours && (
                              <span data-oid=".xhey7g">
                                预计: {template.estimatedHours}小时
                              </span>
                            )}
                          </div>
                          {template.checklist.length > 0 && (
                            <div className="mb-2" data-oid="_3b84eq">
                              <p
                                className="text-sm font-medium mb-1"
                                data-oid="nb:pzgl"
                              >
                                检查项:
                              </p>
                              <ul
                                className="text-sm text-gray-600 space-y-1"
                                data-oid="zth3lm7"
                              >
                                {template.checklist
                                  .slice(0, 3)
                                  .map((item, i) => (
                                    <li
                                      key={i}
                                      className="flex items-center gap-1"
                                      data-oid="7jr7coy"
                                    >
                                      <span
                                        className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-xs"
                                        data-oid="72-eljv"
                                      >
                                        ✓
                                      </span>
                                      {item}
                                    </li>
                                  ))}
                                {template.checklist.length > 3 && (
                                  <li
                                    className="text-gray-400"
                                    data-oid="90.l56s"
                                  >
                                    ...还有 {template.checklist.length - 3} 项
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                          {template.tags.length > 0 && (
                            <div
                              className="flex flex-wrap gap-1"
                              data-oid="jumwlcs"
                            >
                              {template.tags.map((tag, i) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="text-xs"
                                  data-oid="1atj.2n"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2" data-oid="g7ntzd2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyTemplate(template)}
                            data-oid="cki4p4m"
                          >
                            <Copy className="w-4 h-4" data-oid="mtg0.yd" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteTemplate(index)}
                            data-oid=".fk7huj"
                          >
                            <Trash2 className="w-4 h-4" data-oid="m1htjbc" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent
                value="create"
                className="space-y-4"
                data-oid="44bdbv2"
              >
                <form
                  onSubmit={handleTemplateSubmit(saveTemplate)}
                  className="space-y-4"
                  data-oid="e649kbs"
                >
                  <div className="grid grid-cols-2 gap-4" data-oid="--vxwe3">
                    <div data-oid="08e7hr4">
                      <Label htmlFor="name" data-oid="t7w0kqk">
                        模板名称 *
                      </Label>
                      <Input
                        id="name"
                        {...registerTemplate("name")}
                        placeholder="请输入模板名称"
                        data-oid="4ejystg"
                      />

                      {templateErrors.name && (
                        <p
                          className="text-red-500 text-sm mt-1"
                          data-oid="84.wt-l"
                        >
                          {templateErrors.name.message}
                        </p>
                      )}
                    </div>

                    <div data-oid="5akj05n">
                      <Label htmlFor="category" data-oid="eszy-mg">
                        任务类别 *
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setTemplateValue("category", value)
                        }
                        data-oid="qrigtvd"
                      >
                        <SelectTrigger data-oid="7k688g.">
                          <SelectValue
                            placeholder="选择任务类别"
                            data-oid="txr_8bi"
                          />
                        </SelectTrigger>
                        <SelectContent data-oid="7rtlt9e">
                          {categories.map((cat) => (
                            <SelectItem
                              key={cat}
                              value={cat}
                              data-oid="_pbvbkj"
                            >
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {templateErrors.category && (
                        <p
                          className="text-red-500 text-sm mt-1"
                          data-oid="11aocf_"
                        >
                          {templateErrors.category.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div data-oid="57zv5.j">
                    <Label htmlFor="description" data-oid="5xuhl71">
                      描述
                    </Label>
                    <Textarea
                      id="description"
                      {...registerTemplate("description")}
                      placeholder="请输入任务描述"
                      rows={3}
                      data-oid="yn3.vqn"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4" data-oid="_bfs0ea">
                    <div data-oid="gj21.k2">
                      <Label htmlFor="priority" data-oid="tq3b:gx">
                        优先级
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setTemplateValue("priority", value as "high" | "low" | "medium" | "urgent")
                        }
                        defaultValue="medium"
                        data-oid="1wyct7e"
                      >
                        <SelectTrigger data-oid="hamozpt">
                          <SelectValue
                            placeholder="选择优先级"
                            data-oid="29madkh"
                          />
                        </SelectTrigger>
                        <SelectContent data-oid="f37pkix">
                          {priorities.map((priority) => (
                            <SelectItem
                              key={priority.value}
                              value={priority.value}
                              data-oid="9o1fp0v"
                            >
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div data-oid="qw76vi3">
                      <Label htmlFor="estimatedHours" data-oid="pe3cq6o">
                        预计工时
                      </Label>
                      <Input
                        id="estimatedHours"
                        {...registerTemplate("estimatedHours")}
                        placeholder="预计小时数"
                        type="number"
                        min="0.5"
                        step="0.5"
                        data-oid="emv5:u5"
                      />
                    </div>
                  </div>

                  <div
                    className="flex items-center space-x-2"
                    data-oid="khsum_0"
                  >
                    <Switch
                      id="isRecurring"
                      checked={isRecurring}
                      onCheckedChange={(checked) =>
                        setTemplateValue("isRecurring", checked)
                      }
                      data-oid="t:1xf_w"
                    />

                    <Label htmlFor="isRecurring" data-oid="lrp4-a9">
                      设为循环任务
                    </Label>
                  </div>

                  {isRecurring && (
                    <div data-oid="0r.or17">
                      <Label htmlFor="recurringPattern" data-oid="t9dv659">
                        循环模式
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setTemplateValue("recurringPattern", value as "weekly" | "monthly" | "daily" | "quarterly")
                        }
                        data-oid="0k21tmc"
                      >
                        <SelectTrigger data-oid="lxpabc0">
                          <SelectValue
                            placeholder="选择循环模式"
                            data-oid="pmyh61q"
                          />
                        </SelectTrigger>
                        <SelectContent data-oid="__-e:oj">
                          {recurringPatterns.map((pattern) => (
                            <SelectItem
                              key={pattern.value}
                              value={pattern.value}
                              data-oid="l4kyd:x"
                            >
                              {pattern.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div data-oid="51q6i51">
                    <div
                      className="flex items-center justify-between mb-2"
                      data-oid="ka0a.ue"
                    >
                      <Label data-oid="b1fkojy">检查清单</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addChecklistItem}
                        data-oid="mk-gawz"
                      >
                        <Plus className="w-4 h-4 mr-1" data-oid="cw018xe" />
                        添加检查项
                      </Button>
                    </div>
                    <div className="space-y-2" data-oid="gi.rk:8">
                      {checklistItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex gap-2"
                          data-oid="63.o3.d"
                        >
                          <Input
                            value={item}
                            onChange={(e) =>
                              updateChecklistItem(index, e.target.value)
                            }
                            placeholder="检查项内容"
                            data-oid="klxazqp"
                          />

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeChecklistItem(index)}
                            data-oid="9:ks3ls"
                          >
                            <Trash2 className="w-4 h-4" data-oid="yh-sg80" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div data-oid="6u7ikml">
                    <Label htmlFor="tags" data-oid="zx_ylfe">
                      标签
                    </Label>
                    <div className="flex gap-2 mb-2" data-oid="vpy6nb1">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="输入标签后按回车"
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addTag())
                        }
                        data-oid="93lesc6"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        onClick={addTag}
                        data-oid="9kknjm3"
                      >
                        添加
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2" data-oid="pg.rc47">
                      {tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeTag(tag)}
                          data-oid="5qf4mje"
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2" data-oid="v:vq1a_">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentTab("select")}
                      data-oid="zjne9u."
                    >
                      取消
                    </Button>
                    <Button type="submit" data-oid="nvs2w14">
                      <Save className="w-4 h-4 mr-2" data-oid="yug0.23" />
                      保存模板
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end mt-6" data-oid="t_j2ahq">
              <Button variant="outline" onClick={onClose} data-oid="mzb4lcy">
                关闭
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 选择模板模式
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      data-oid="sj-mm2v"
    >
      <Card
        className="w-full max-w-3xl max-h-[90vh] overflow-auto"
        data-oid="ttey5iz"
      >
        <CardHeader data-oid="99lm3rp">
          <CardTitle data-oid="hqs_m0l">选择任务模板</CardTitle>
        </CardHeader>
        <CardContent data-oid="dm9any6">
          <div className="grid gap-4" data-oid=":zjg..q">
            {templates.map((template, index) => (
              <Card
                key={index}
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => useTemplate(template)}
                data-oid="u1p69r4"
              >
                <div
                  className="flex items-center justify-between"
                  data-oid="qkp-vy."
                >
                  <div className="flex-1" data-oid="zxl879j">
                    <div
                      className="flex items-center gap-2 mb-2"
                      data-oid="i:7jy74"
                    >
                      <h3 className="font-medium" data-oid="y8n36mb">
                        {template.name}
                      </h3>
                      {getPriorityBadge(template.priority)}
                      {template.isRecurring && (
                        <Badge variant="outline" data-oid="9_j_jsv">
                          循环任务
                        </Badge>
                      )}
                    </div>
                    <p
                      className="text-sm text-gray-600 mb-2"
                      data-oid="n.gs3uj"
                    >
                      {template.description}
                    </p>
                    <div
                      className="flex items-center gap-4 text-sm text-gray-500"
                      data-oid="4c49ezv"
                    >
                      <span data-oid="2::km.:">类别: {template.category}</span>
                      {template.estimatedHours && (
                        <span data-oid=":4.vfy-">
                          预计: {template.estimatedHours}小时
                        </span>
                      )}
                      {template.checklist.length > 0 && (
                        <span data-oid="gg2xzvw">
                          检查项: {template.checklist.length}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" data-oid="mxan5kk">
                    使用模板
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end mt-6" data-oid="fk2bf_z">
            <Button variant="outline" onClick={onClose} data-oid="ia-e422">
              取消
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
