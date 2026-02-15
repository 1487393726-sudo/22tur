-- 创建访客会话表
CREATE TABLE IF NOT EXISTS "VisitorSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "firstVisit" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivity" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pageViews" INTEGER NOT NULL DEFAULT 1,
    "isOnline" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建页面访问表
CREATE TABLE IF NOT EXISTS "PageView" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ipAddress" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "country" TEXT,
    "city" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS "VisitorSession_ipAddress_createdAt_idx" ON "VisitorSession"("ipAddress", "createdAt");
CREATE INDEX IF NOT EXISTS "VisitorSession_lastActivity_idx" ON "VisitorSession"("lastActivity");
CREATE INDEX IF NOT EXISTS "VisitorSession_isOnline_idx" ON "VisitorSession"("isOnline");
CREATE INDEX IF NOT EXISTS "PageView_timestamp_idx" ON "PageView"("timestamp");
CREATE INDEX IF NOT EXISTS "PageView_ipAddress_idx" ON "PageView"("ipAddress");