-- CreateTable
CREATE TABLE "advisor_clients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "advisorId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "communicationPreferences" TEXT NOT NULL DEFAULT '{"email":true,"phone":false,"inApp":true}',
    "riskProfile" TEXT NOT NULL DEFAULT 'MODERATE',
    "investmentGoals" TEXT,
    "notes" TEXT,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "advisor_clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "advisor_clients_advisorId_fkey" FOREIGN KEY ("advisorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "advisor_strategies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "advisorId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetReturn" REAL NOT NULL,
    "riskTolerance" TEXT NOT NULL,
    "timeHorizon" INTEGER NOT NULL,
    "assetAllocation" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "communication_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "advisorId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" DATETIME,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "advisor_clients_advisorId_userId_key" ON "advisor_clients"("advisorId", "userId");

-- CreateIndex
CREATE INDEX "advisor_clients_advisorId_idx" ON "advisor_clients"("advisorId");

-- CreateIndex
CREATE INDEX "advisor_clients_userId_idx" ON "advisor_clients"("userId");

-- CreateIndex
CREATE INDEX "advisor_clients_status_idx" ON "advisor_clients"("status");

-- CreateIndex
CREATE INDEX "advisor_strategies_advisorId_idx" ON "advisor_strategies"("advisorId");

-- CreateIndex
CREATE INDEX "advisor_strategies_clientId_idx" ON "advisor_strategies"("clientId");

-- CreateIndex
CREATE INDEX "advisor_strategies_status_idx" ON "advisor_strategies"("status");

-- CreateIndex
CREATE INDEX "communication_records_advisorId_idx" ON "communication_records"("advisorId");

-- CreateIndex
CREATE INDEX "communication_records_clientId_idx" ON "communication_records"("clientId");

-- CreateIndex
CREATE INDEX "communication_records_type_idx" ON "communication_records"("type");

-- CreateIndex
CREATE INDEX "communication_records_timestamp_idx" ON "communication_records"("timestamp");