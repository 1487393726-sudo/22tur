-- 投资者项目运营监控系统数据库迁移
-- Migration: Add Investor Operations Monitoring Tables

-- =====================================================
-- 1. 扩展投资项目表，添加项目类型和行业类型字段
-- =====================================================
ALTER TABLE investment_projects ADD COLUMN project_type VARCHAR(20) DEFAULT 'PHYSICAL';
ALTER TABLE investment_projects ADD COLUMN industry_type VARCHAR(50) DEFAULT 'OTHER';
ALTER TABLE investment_projects ADD COLUMN location VARCHAR(500);
ALTER TABLE investment_projects ADD COLUMN area DECIMAL(10,2);
ALTER TABLE investment_projects ADD COLUMN platform VARCHAR(255);
ALTER TABLE investment_projects ADD COLUMN current_phase VARCHAR(20) DEFAULT 'DESIGN';
ALTER TABLE investment_projects ADD COLUMN phase_progress INTEGER DEFAULT 0;

-- =====================================================
-- 2. 项目阶段记录表
-- =====================================================
CREATE TABLE project_phase_records (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  phase VARCHAR(20) NOT NULL,
  start_date DATETIME NOT NULL,
  expected_end_date DATETIME NOT NULL,
  actual_end_date DATETIME,
  progress INTEGER DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES investment_projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_phase_records_project ON project_phase_records(project_id);
CREATE INDEX idx_phase_records_phase ON project_phase_records(phase);

-- =====================================================
-- 3. 项目里程碑表
-- =====================================================
CREATE TABLE project_milestones (
  id TEXT PRIMARY KEY,
  phase_record_id TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  expected_date DATETIME NOT NULL,
  completed_date DATETIME,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (phase_record_id) REFERENCES project_phase_records(id) ON DELETE CASCADE
);

CREATE INDEX idx_milestones_phase_record ON project_milestones(phase_record_id);
CREATE INDEX idx_milestones_status ON project_milestones(status);

-- =====================================================
-- 4. 阶段延期记录表
-- =====================================================
CREATE TABLE phase_delay_records (
  id TEXT PRIMARY KEY,
  phase_record_id TEXT NOT NULL,
  delay_days INTEGER NOT NULL,
  reason TEXT NOT NULL,
  new_expected_date DATETIME NOT NULL,
  recorded_by TEXT NOT NULL,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (phase_record_id) REFERENCES project_phase_records(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id)
);

CREATE INDEX idx_delay_records_phase ON phase_delay_records(phase_record_id);

-- =====================================================
-- 5. 每日运营数据表
-- =====================================================
CREATE TABLE daily_operations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  date DATE NOT NULL,
  revenue DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_expenses DECIMAL(15,2) NOT NULL DEFAULT 0,
  profit DECIMAL(15,2) NOT NULL DEFAULT 0,
  customer_count INTEGER,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES investment_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  UNIQUE(project_id, date)
);

CREATE INDEX idx_daily_ops_project_date ON daily_operations(project_id, date);
CREATE INDEX idx_daily_ops_date ON daily_operations(date);


-- =====================================================
-- 6. 支出明细表
-- =====================================================
CREATE TABLE expense_records (
  id TEXT PRIMARY KEY,
  daily_operations_id TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  receipt_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (daily_operations_id) REFERENCES daily_operations(id) ON DELETE CASCADE
);

CREATE INDEX idx_expense_records_daily_ops ON expense_records(daily_operations_id);
CREATE INDEX idx_expense_records_category ON expense_records(category);

-- =====================================================
-- 7. 项目员工表
-- =====================================================
CREATE TABLE project_employees (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  hire_date DATE NOT NULL,
  tenure_category VARCHAR(20) NOT NULL,
  recruitment_channel VARCHAR(100),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES investment_projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_project_employees_project ON project_employees(project_id);
CREATE INDEX idx_project_employees_status ON project_employees(status);
CREATE INDEX idx_project_employees_position ON project_employees(position);

-- =====================================================
-- 8. 员工薪资表
-- =====================================================
CREATE TABLE employee_salaries (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  base_salary DECIMAL(10,2) NOT NULL,
  bonus DECIMAL(10,2) DEFAULT 0,
  allowance DECIMAL(10,2) DEFAULT 0,
  overtime_pay DECIMAL(10,2) DEFAULT 0,
  pension DECIMAL(10,2) DEFAULT 0,
  medical DECIMAL(10,2) DEFAULT 0,
  unemployment DECIMAL(10,2) DEFAULT 0,
  work_injury DECIMAL(10,2) DEFAULT 0,
  maternity DECIMAL(10,2) DEFAULT 0,
  housing_fund DECIMAL(10,2) DEFAULT 0,
  effective_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES project_employees(id) ON DELETE CASCADE
);

CREATE INDEX idx_employee_salaries_employee ON employee_salaries(employee_id);
CREATE INDEX idx_employee_salaries_effective_date ON employee_salaries(effective_date);

-- =====================================================
-- 9. 能力评估表
-- =====================================================
CREATE TABLE performance_assessments (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  assessment_period VARCHAR(20) NOT NULL,
  professional_skills INTEGER NOT NULL CHECK (professional_skills BETWEEN 1 AND 10),
  work_attitude INTEGER NOT NULL CHECK (work_attitude BETWEEN 1 AND 10),
  teamwork INTEGER NOT NULL CHECK (teamwork BETWEEN 1 AND 10),
  communication INTEGER NOT NULL CHECK (communication BETWEEN 1 AND 10),
  problem_solving INTEGER NOT NULL CHECK (problem_solving BETWEEN 1 AND 10),
  overall_score DECIMAL(3,1) NOT NULL,
  assessed_by TEXT NOT NULL,
  assessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  comments TEXT,
  FOREIGN KEY (employee_id) REFERENCES project_employees(id) ON DELETE CASCADE,
  FOREIGN KEY (assessed_by) REFERENCES users(id)
);

CREATE INDEX idx_assessments_employee ON performance_assessments(employee_id);
CREATE INDEX idx_assessments_period ON performance_assessments(assessment_period);

-- =====================================================
-- 10. 培训记录表
-- =====================================================
CREATE TABLE training_records (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  training_name VARCHAR(255) NOT NULL,
  training_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'COMPLETED',
  certificate_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES project_employees(id) ON DELETE CASCADE
);

CREATE INDEX idx_training_records_employee ON training_records(employee_id);
CREATE INDEX idx_training_records_type ON training_records(training_type);

-- =====================================================
-- 11. 亏损分析报告表
-- =====================================================
CREATE TABLE loss_analysis_reports (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  report_date DATE NOT NULL,
  total_loss DECIMAL(15,2) NOT NULL,
  loss_factors TEXT NOT NULL,
  market_comparison TEXT,
  improvement_plan TEXT,
  decision_history TEXT,
  created_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES investment_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX idx_loss_reports_project ON loss_analysis_reports(project_id);
CREATE INDEX idx_loss_reports_date ON loss_analysis_reports(report_date);

-- =====================================================
-- 12. 投资者项目访问权限表
-- =====================================================
CREATE TABLE investor_project_access (
  id TEXT PRIMARY KEY,
  investor_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  shareholding_ratio DECIMAL(5,2) NOT NULL,
  access_level VARCHAR(20) DEFAULT 'STANDARD',
  granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  granted_by TEXT NOT NULL,
  FOREIGN KEY (investor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES investment_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES users(id),
  UNIQUE(investor_id, project_id)
);

CREATE INDEX idx_investor_access_investor ON investor_project_access(investor_id);
CREATE INDEX idx_investor_access_project ON investor_project_access(project_id);

-- =====================================================
-- 13. 决策历史记录表
-- =====================================================
CREATE TABLE decision_records (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  decision_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  rationale TEXT,
  impact TEXT,
  decision_date DATE NOT NULL,
  decided_by TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES investment_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (decided_by) REFERENCES users(id)
);

CREATE INDEX idx_decision_records_project ON decision_records(project_id);
CREATE INDEX idx_decision_records_date ON decision_records(decision_date);

-- =====================================================
-- 14. 数据修改历史表（版本控制）
-- =====================================================
CREATE TABLE data_modification_history (
  id TEXT PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id TEXT NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  modification_reason TEXT,
  modified_by TEXT NOT NULL,
  modified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (modified_by) REFERENCES users(id)
);

CREATE INDEX idx_modification_history_table ON data_modification_history(table_name);
CREATE INDEX idx_modification_history_record ON data_modification_history(record_id);
CREATE INDEX idx_modification_history_date ON data_modification_history(modified_at);

-- =====================================================
-- 15. 预警通知表
-- =====================================================
CREATE TABLE operations_alerts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  threshold_value DECIMAL(15,2),
  actual_value DECIMAL(15,2),
  is_read BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at DATETIME,
  resolved_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES investment_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by) REFERENCES users(id)
);

CREATE INDEX idx_ops_alerts_project ON operations_alerts(project_id);
CREATE INDEX idx_ops_alerts_type ON operations_alerts(alert_type);
CREATE INDEX idx_ops_alerts_resolved ON operations_alerts(is_resolved);
