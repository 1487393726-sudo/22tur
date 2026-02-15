-- CreateTable
CREATE TABLE "cash_flow_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "description" TEXT NOT NULL,
    "fromAccount" TEXT,
    "toAccount" TEXT,
    "portfolioId" TEXT,
    "investmentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "transactionDate" DATETIME NOT NULL,
    "settlementDate" DATETIME,
    "reference" TEXT NOT NULL,
    "metadata" TEXT,
    "createdBy" TEXT NOT NULL,
    "approvedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "balance" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "ownerId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "settlement_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period" TEXT NOT NULL,
    "totalTransactions" INTEGER NOT NULL,
    "totalAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "discrepancies" TEXT,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reconciledAt" DATETIME,
    "reconciledBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "cash_flow_records_reference_key" ON "cash_flow_records"("reference");

-- CreateIndex
CREATE INDEX "cash_flow_records_type_idx" ON "cash_flow_records"("type");

-- CreateIndex
CREATE INDEX "cash_flow_records_status_idx" ON "cash_flow_records"("status");

-- CreateIndex
CREATE INDEX "cash_flow_records_transactionDate_idx" ON "cash_flow_records"("transactionDate");

-- CreateIndex
CREATE INDEX "cash_flow_records_fromAccount_idx" ON "cash_flow_records"("fromAccount");

-- CreateIndex
CREATE INDEX "cash_flow_records_toAccount_idx" ON "cash_flow_records"("toAccount");

-- CreateIndex
CREATE INDEX "cash_flow_records_portfolioId_idx" ON "cash_flow_records"("portfolioId");

-- CreateIndex
CREATE INDEX "cash_flow_records_createdBy_idx" ON "cash_flow_records"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_accountNumber_key" ON "accounts"("accountNumber");

-- CreateIndex
CREATE INDEX "accounts_accountType_idx" ON "accounts"("accountType");

-- CreateIndex
CREATE INDEX "accounts_status_idx" ON "accounts"("status");

-- CreateIndex
CREATE INDEX "accounts_ownerId_idx" ON "accounts"("ownerId");

-- CreateIndex
CREATE INDEX "settlement_reports_status_idx" ON "settlement_reports"("status");

-- CreateIndex
CREATE INDEX "settlement_reports_generatedAt_idx" ON "settlement_reports"("generatedAt");

-- CreateIndex
CREATE INDEX "settlement_reports_currency_idx" ON "settlement_reports"("currency");