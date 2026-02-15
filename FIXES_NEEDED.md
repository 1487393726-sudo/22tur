# 项目修复清单

## 构建错误总结
Vercel 部署失败，共 40 个错误需要修复

---

## 1. 缺少的 NPM 依赖包 (优先级: 高)

需要安装以下包：
```bash
npm install stripe mongodb mysql2 pg
```

---

## 2. 语法错误 - 未闭合的字符串 (优先级: 高)

### 需要修复的文件：
1. `app/case-studies/page.tsx:292` - timeline 字段
2. `app/consultation/page.tsx:214` - experience 字段
3. `app/design-services/page.tsx:134` - 缺少三元运算符
4. `app/messages/page.tsx:80` - senderName 字段
5. `app/notifications/page.tsx:96` - message 字段
6. `app/reports/new/page.tsx:230` - toast 消息
7. `app/reports/page.tsx:118,120` - 返回值字符串
8. `app/research/page.tsx:89` - tags 数组
9. `app/resources/page.tsx:73,75` - title 和 description
10. `app/schedule/page.tsx:127` - description 字段
11. `app/security/page.tsx:196` - label 字段
12. `app/tasks/page.tsx:112` - alert 消息
13. `app/workflow/page.tsx:191` - label 字段
14. `components/investor-operations/project-detail-page.tsx:239` - zh 字段

---

## 3. JSX 语法错误 (优先级: 高)

### 需要修复的文件：
1. `app/admin/ab-tests/page.tsx:554` - JSX 闭合标签错误
2. `app/marketplace/cart/page.tsx:61` - 三元运算符语法
3. `app/marketplace/checkout/page.tsx:239` - 三元运算符语法
4. `app/payments/page.tsx:248` - 三元运算符语法
5. `app/reports/page.tsx:147` - JSX 特殊字符
6. `app/support/page.tsx:410` - data-oid 属性格式错误

---

## 4. 缺少的模块导出 (优先级: 高)

### lib/rate-limit.ts
缺少以下导出：
- `applyRateLimit`
- `passwordResetRateLimiter`
- `emailVerificationRateLimiter`
- `fileUploadRateLimiter`
- `paymentCreateRateLimiter`
- `getClientIp`

### lib/websocket/index.ts
缺少以下导出：
- `getPushService`
- `resetPushService`

### lib/sms/sms-service.ts
缺少导出：
- `smsService` (应该导出实例)

---

## 5. 缺少的文件 (优先级: 中)

1. `i18n.ts` 或 `i18n/index.ts` - sitemap.ts 需要
2. 需要创建 locales 配置

---

## 6. 可选依赖警告 (优先级: 低)

这些是动态导入，可以暂时忽略：
- mongodb (用于数据库配置测试)
- mysql2/promise (用于数据库配置测试)
- pg (用于数据库配置测试)

---

## 修复步骤建议

### 第一步：安装依赖
```bash
npm install stripe
```

### 第二步：修复语法错误
使用查找替换修复所有未闭合的字符串

### 第三步：修复导出问题
更新 lib 文件以导出缺少的函数

### 第四步：创建缺少的文件
创建 i18n 配置文件

### 第五步：测试构建
```bash
npm run build
```

---

## 注意事项

1. 某些中文字符串可能在编辑过程中损坏
2. 需要仔细检查每个文件的字符串完整性
3. 建议使用 TypeScript 检查确保类型正确
4. 修复后需要重新测试所有功能

---

生成时间: 2026-02-16
