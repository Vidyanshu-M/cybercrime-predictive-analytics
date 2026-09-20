CREATE INDEX IF NOT EXISTS idx_atms_location ON atms USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_complaints_location ON complaints USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_transactions_location ON transactions USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_risk_zones_geometry ON risk_zones USING GIST (geometry);

CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_atms_bank_id ON atms(bank_id);
CREATE INDEX IF NOT EXISTS idx_atms_district ON atms(district);

CREATE INDEX IF NOT EXISTS idx_complaints_status_date ON complaints(status, reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_district ON complaints(district);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(crime_category);

CREATE INDEX IF NOT EXISTS idx_accounts_bank_id ON accounts(bank_id);

CREATE INDEX IF NOT EXISTS idx_transactions_time ON transactions(transaction_time DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_atm ON transactions(atm_id);
CREATE INDEX IF NOT EXISTS idx_transactions_complaint ON transactions(complaint_id);
CREATE INDEX IF NOT EXISTS idx_transactions_risk ON transactions(risk_label);

CREATE INDEX IF NOT EXISTS idx_predictions_atm_time ON predictions(atm_id, prediction_time DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_risk_level ON predictions(risk_level);

CREATE INDEX IF NOT EXISTS idx_alerts_status_level ON alerts(status, risk_level, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_prediction_id ON alerts(prediction_id);
CREATE INDEX IF NOT EXISTS idx_alerts_assigned_to ON alerts(assigned_to);

CREATE INDEX IF NOT EXISTS idx_cases_status_priority ON cases(status, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_officer ON cases(assigned_officer);

CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action, timestamp DESC);
