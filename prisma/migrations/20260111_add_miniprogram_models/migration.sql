-- 小程序相关数据模型迁移

-- 银行卡表
CREATE TABLE IF NOT EXISTS "bank_cards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "cardNumber" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "cardHolder" TEXT NOT NULL,
    "cardType" TEXT DEFAULT 'DEBIT',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bank_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "bank_cards_userId_idx" ON "bank_cards"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "bank_cards_userId_cardNumber_key" ON "bank_cards"("userId", "cardNumber");

-- 收藏表
CREATE TABLE IF NOT EXISTS "favorites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "favorites_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "investment_projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "favorites_userId_idx" ON "favorites"("userId");
CREATE INDEX IF NOT EXISTS "favorites_projectId_idx" ON "favorites"("projectId");
CREATE UNIQUE INDEX IF NOT EXISTS "favorites_userId_projectId_key" ON "favorites"("userId", "projectId");

-- 用户反馈表
CREATE TABLE IF NOT EXISTS "feedbacks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "images" TEXT DEFAULT '[]',
    "contact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reply" TEXT,
    "repliedAt" DATETIME,
    "repliedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "feedbacks_userId_idx" ON "feedbacks"("userId");
CREATE INDEX IF NOT EXISTS "feedbacks_status_idx" ON "feedbacks"("status");
CREATE INDEX IF NOT EXISTS "feedbacks_type_idx" ON "feedbacks"("type");
CREATE INDEX IF NOT EXISTS "feedbacks_createdAt_idx" ON "feedbacks"("createdAt");

-- 订单表 (如果不存在)
CREATE TABLE IF NOT EXISTS "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNo" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "investmentId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'INVESTMENT',
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "paymentId" TEXT,
    "paidAt" DATETIME,
    "completedAt" DATETIME,
    "cancelledAt" DATETIME,
    "cancelReason" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "orders_userId_idx" ON "orders"("userId");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders"("status");
CREATE INDEX IF NOT EXISTS "orders_type_idx" ON "orders"("type");
CREATE INDEX IF NOT EXISTS "orders_createdAt_idx" ON "orders"("createdAt");

-- 添加 kycStatus 字段到用户表 (如果不存在)
-- ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "kycStatus" TEXT DEFAULT 'NOT_SUBMITTED';

-- KYC 记录表 (如果不存在)
CREATE TABLE IF NOT EXISTS "kyc_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "realName" TEXT NOT NULL,
    "idType" TEXT NOT NULL DEFAULT 'ID_CARD',
    "idNumber" TEXT NOT NULL,
    "idFrontImage" TEXT NOT NULL,
    "idBackImage" TEXT,
    "selfieImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "rejectReason" TEXT,
    "reviewedAt" DATETIME,
    "reviewedBy" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "kyc_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "kyc_records_userId_idx" ON "kyc_records"("userId");
CREATE INDEX IF NOT EXISTS "kyc_records_status_idx" ON "kyc_records"("status");
CREATE INDEX IF NOT EXISTS "kyc_records_createdAt_idx" ON "kyc_records"("createdAt");
