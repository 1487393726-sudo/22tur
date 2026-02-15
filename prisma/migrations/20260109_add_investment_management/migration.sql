-- CreateTable
CREATE TABLE "investment_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "investorId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" DATETIME,
    "rejectedAt" DATETIME,
    "rejectionReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "investment_applications_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "investment_applications_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "investment_projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalValue" REAL NOT NULL DEFAULT 0,
    "totalInvested" REAL NOT NULL DEFAULT 0,
    "totalReturn" REAL NOT NULL DEFAULT 0,
    "returnPercentage" REAL NOT NULL DEFAULT 0,
    "riskScore" REAL NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "portfolios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "portfolio_investments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portfolioId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "investedAt" DATETIME NOT NULL,
    "currentValue" REAL NOT NULL,
    "returnAmount" REAL NOT NULL DEFAULT 0,
    "returnPercentage" REAL NOT NULL DEFAULT 0,
    "riskLevel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "portfolio_investments_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "portfolio_investments_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "investment_projects" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "risk_assessments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portfolioId" TEXT NOT NULL,
    "riskScore" REAL NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "riskFactors" TEXT NOT NULL,
    "assessmentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recommendations" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "risk_assessments_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "investment_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portfolioId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "generatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "fileUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "investment_reports_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cash_flows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portfolioId" TEXT,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "reference" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cash_flows_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "investment_applications_investorId_idx" ON "investment_applications"("investorId");

-- CreateIndex
CREATE INDEX "investment_applications_projectId_idx" ON "investment_applications"("projectId");

-- CreateIndex
CREATE INDEX "investment_applications_status_idx" ON "investment_applications"("status");

-- CreateIndex
CREATE INDEX "investment_applications_submittedAt_idx" ON "investment_applications"("submittedAt");

-- CreateIndex
CREATE INDEX "portfolios_userId_idx" ON "portfolios"("userId");

-- CreateIndex
CREATE INDEX "portfolios_lastUpdated_idx" ON "portfolios"("lastUpdated");

-- CreateIndex
CREATE INDEX "portfolio_investments_portfolioId_idx" ON "portfolio_investments"("portfolioId");

-- CreateIndex
CREATE INDEX "portfolio_investments_projectId_idx" ON "portfolio_investments"("projectId");

-- CreateIndex
CREATE INDEX "portfolio_investments_status_idx" ON "portfolio_investments"("status");

-- CreateIndex
CREATE INDEX "portfolio_investments_investedAt_idx" ON "portfolio_investments"("investedAt");

-- CreateIndex
CREATE INDEX "risk_assessments_portfolioId_idx" ON "risk_assessments"("portfolioId");

-- CreateIndex
CREATE INDEX "risk_assessments_assessmentDate_idx" ON "risk_assessments"("assessmentDate");

-- CreateIndex
CREATE INDEX "risk_assessments_riskLevel_idx" ON "risk_assessments"("riskLevel");

-- CreateIndex
CREATE INDEX "investment_reports_portfolioId_idx" ON "investment_reports"("portfolioId");

-- CreateIndex
CREATE INDEX "investment_reports_reportType_idx" ON "investment_reports"("reportType");

-- CreateIndex
CREATE INDEX "investment_reports_generatedAt_idx" ON "investment_reports"("generatedAt");

-- CreateIndex
CREATE INDEX "cash_flows_portfolioId_idx" ON "cash_flows"("portfolioId");

-- CreateIndex
CREATE INDEX "cash_flows_type_idx" ON "cash_flows"("type");

-- CreateIndex
CREATE INDEX "cash_flows_date_idx" ON "cash_flows"("date");

-- CreateIndex
CREATE INDEX "cash_flows_category_idx" ON "cash_flows"("category");