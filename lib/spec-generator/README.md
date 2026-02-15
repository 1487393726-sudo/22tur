# Spec Task Generator

自动化 Spec 任务生成工具，从需求文档和设计文档自动生成任务列表。

## 功能

- 📖 **自动解析需求** - 从 requirements.md 提取需求和验收标准
- 📝 **生成任务列表** - 自动生成结构化的 tasks.md
- 🏷️ **智能分类** - 按功能模块自动分组任务
- 📊 **工作量估计** - 基于验收标准自动估计工作量
- 🔗 **需求追踪** - 任务与需求文档的双向引用
- 🚀 **批量生成** - 支持一次性生成所有 Spec 的任务

## 安装

该工具已集成到项目中，无需额外安装。

## 使用方法

### 命令行使用

#### 生成单个 Spec 的任务

```bash
npx ts-node scripts/generate-spec-tasks.ts enterprise-system-completion
```

#### 生成所有 Spec 的任务

```bash
npx ts-node scripts/generate-spec-tasks.ts --all
```

#### 查看帮助

```bash
npx ts-node scripts/generate-spec-tasks.ts --help
```

### 编程使用

```typescript
import {
  generateSpecTasks,
  generateAllSpecTasks,
  loadSpec,
  parseRequirements,
  generateTasksFromRequirements
} from 'lib/spec-generator/task-generator';

// 生成单个 Spec 的任务
const tasksPath = await generateSpecTasks('enterprise-system-completion');

// 生成所有 Spec 的任务
const results = await generateAllSpecTasks();

// 加载 Spec 数据
const { requirements, taskGroups } = await loadSpec('enterprise-system-completion');

// 手动解析需求
const requirements = parseRequirements(requirementsContent);

// 从需求生成任务
const taskGroups = generateTasksFromRequirements(requirements);
```

## 工作流程

### 1. 需求解析

脚本从 `requirements.md` 中提取：

- **需求编号** - `### Requirement X:`
- **需求标题** - 第一行内容
- **用户故事** - `**User Story**:` 后的内容
- **验收标准** - `#### Acceptance Criteria` 下的列表

```markdown
### Requirement 1: 用户认证增强

**User Story**: 作为用户，我希望能够安全地管理我的账户...

#### Acceptance Criteria

1. WHEN the User clicks the forgot password link...
2. WHEN the User submits a registered email address...
```

### 2. 任务生成

脚本根据需求生成任务：

- **任务标题** - 基于需求标题
- **子任务** - 基于验收标准
- **优先级** - 从需求继承
- **工作量** - 基于验收标准数量估计
- **分类** - 根据关键词自动分类

### 3. 输出格式

生成的 `tasks.md` 包含：

```markdown
# Spec 名称 - 实施任务列表

## 功能模块

- [ ] 1. 任务标题
   - **优先级**: 🔴
   - **工作量**: 3 天
   - **需求**: REQ-1
   - **子任务**:
     - [ ] 实现: 验收标准 1
     - [ ] 实现: 验收标准 2
```

## 配置

### 自动分类规则

脚本根据需求标题中的关键词自动分类：

| 关键词 | 分类 |
|--------|------|
| 认证 | 用户认证 |
| 设置 | 个人中心 |
| 通知 | 通知系统 |
| 消息 | 消息系统 |
| 文件 | 文件管理 |
| 支付 | 支付集成 |
| 看板 | 看板功能 |
| 工作流 | 工作流系统 |
| 报表 | 报表系统 |
| 仪表板 | 仪表板系统 |

### 工作量估计

工作量基于验收标准数量：

- 1-2 个标准 = 1 天
- 3-5 个标准 = 2 天
- 6-8 个标准 = 3 天
- 9+ 个标准 = 4+ 天

## 示例

### 输入 (requirements.md)

```markdown
### Requirement 1: 用户认证增强

**User Story**: 作为用户，我希望能够安全地管理我的账户...

#### Acceptance Criteria

1. WHEN the User clicks the forgot password link, THEN THE System SHALL display the password reset request page
2. WHEN the User submits a registered email address, THEN THE System SHALL send an email containing a reset link
3. WHEN the User clicks the reset link in the email, THEN THE System SHALL validate the Token and display the password reset form
```

### 输出 (tasks.md)

```markdown
## 用户认证

用户认证相关的所有任务

- [ ] 1. 实现用户认证增强
   - **优先级**: 🔴
   - **工作量**: 1 天
   - **需求**: REQ-1
   - **子任务**:
     - [ ] 实现: WHEN the User clicks the forgot password link...
     - [ ] 实现: WHEN the User submits a registered email address...
     - [ ] 实现: WHEN the User clicks the reset link in the email...
```

## API 参考

### 类型定义

```typescript
interface Requirement {
  id: string;                    // REQ-1
  number: number;                // 1
  title: string;                 // 需求标题
  userStory: string;             // 用户故事
  description: string;           // 需求描述
  criteria: AcceptanceCriterion[]; // 验收标准
  priority: 'high' | 'medium' | 'low';
  phase?: string;                // 功能模块
}

interface Task {
  id: string;                    // REQ-1
  number: number;                // 1
  title: string;                 // 任务标题
  description: string;           // 任务描述
  subtasks: Subtask[];           // 子任务
  requirementRefs: string[];     // 需求引用
  priority: 'high' | 'medium' | 'low';
  estimatedDays: number;         // 工作量估计
  isOptional: boolean;           // 是否可选
  category: string;              // 分类
}

interface TaskGroup {
  title: string;                 // 分组标题
  description: string;           // 分组描述
  tasks: Task[];                 // 任务列表
  priority: 'high' | 'medium' | 'low';
}
```

### 函数

#### `parseRequirements(content: string): Requirement[]`

解析需求文档内容，提取所有需求。

```typescript
const requirements = parseRequirements(requirementsContent);
```

#### `generateTasksFromRequirements(requirements: Requirement[]): TaskGroup[]`

从需求生成任务组。

```typescript
const taskGroups = generateTasksFromRequirements(requirements);
```

#### `generateTasksMarkdown(taskGroups: TaskGroup[], specName: string): string`

生成 Markdown 格式的任务列表。

```typescript
const markdown = generateTasksMarkdown(taskGroups, 'enterprise-system-completion');
```

#### `loadSpec(specName: string): Promise<{ requirements, taskGroups }>`

加载 Spec 并解析需求和任务。

```typescript
const { requirements, taskGroups } = await loadSpec('enterprise-system-completion');
```

#### `generateSpecTasks(specName: string): Promise<string>`

生成并保存 Spec 的任务列表。

```typescript
const tasksPath = await generateSpecTasks('enterprise-system-completion');
```

#### `generateAllSpecTasks(): Promise<Map<string, string>>`

生成所有 Spec 的任务列表。

```typescript
const results = await generateAllSpecTasks();
for (const [specName, tasksPath] of results) {
  console.log(`${specName} -> ${tasksPath}`);
}
```

## 最佳实践

### 1. 编写清晰的需求

- 使用标准的 `### Requirement X:` 格式
- 提供清晰的用户故事
- 编写具体的验收标准

### 2. 使用关键词

- 在需求标题中使用分类关键词
- 这样脚本可以自动分类任务

### 3. 定期更新

- 修改需求后重新生成任务
- 保持 tasks.md 与 requirements.md 同步

### 4. 手动调整

- 生成后可以手动调整任务
- 添加额外的子任务或依赖关系
- 调整优先级和工作量

## 故障排除

### 问题：找不到 Spec 目录

**解决方案**：确保 Spec 目录存在于 `.kiro/specs/` 下

```bash
ls -la .kiro/specs/
```

### 问题：requirements.md 不存在

**解决方案**：确保 requirements.md 文件存在

```bash
ls -la .kiro/specs/[spec-name]/requirements.md
```

### 问题：没有解析到需求

**解决方案**：检查需求格式是否正确

```markdown
# 正确格式
### Requirement 1: 需求标题

**User Story**: 用户故事

#### Acceptance Criteria

1. 验收标准 1
2. 验收标准 2
```

## 扩展

### 自定义分类规则

编辑 `lib/spec-generator/task-generator.ts` 中的 `extractPhase` 函数：

```typescript
function extractPhase(title: string): string {
  const phaseMap: Record<string, string> = {
    '认证': '用户认证',
    '自定义关键词': '自定义分类',
    // 添加更多规则
  };
  
  for (const [keyword, phase] of Object.entries(phaseMap)) {
    if (title.includes(keyword)) {
      return phase;
    }
  }
  
  return '其他功能';
}
```

### 自定义工作量估计

编辑 `generateTasksFromRequirements` 函数中的工作量计算逻辑：

```typescript
estimatedDays: Math.max(1, Math.ceil(req.criteria.length / 3))
```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！

## 相关文档

- [Spec 文档](../../specs/)
- [项目状态](../../PROJECT_STATUS_SUMMARY.md)
- [开发路线图](../../DEVELOPMENT_ROADMAP_2026.md)
