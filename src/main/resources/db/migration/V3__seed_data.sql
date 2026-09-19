INSERT INTO roles (id, name) VALUES
('a0000000-0000-0000-0000-000000000001', 'ROLE_ADMIN'),
('a0000000-0000-0000-0000-000000000002', 'ROLE_I4C_OFFICER'),
('a0000000-0000-0000-0000-000000000003', 'ROLE_STATE_OFFICER'),
('a0000000-0000-0000-0000-000000000004', 'ROLE_DISTRICT_OFFICER'),
('a0000000-0000-0000-0000-000000000005', 'ROLE_BANK_OFFICER'),
('a0000000-0000-0000-0000-000000000006', 'ROLE_ANALYST')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (id, name, email, password_hash, role_id, department, state, district, is_active) VALUES
('b0000000-0000-0000-0000-000000000001', 'Admin Officer', 'admin@cybertrace.gov.in', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxGQrvkWChTa', 'a0000000-0000-0000-0000-000000000001', 'Cyber Operations Command', 'Delhi', 'New Delhi', TRUE),
('b0000000-0000-0000-0000-000000000002', 'Inspector Vikram Roy', 'officer@cybertrace.gov.in', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxGQrvkWChTa', 'a0000000-0000-0000-0000-000000000002', 'I4C Rapid Response', 'Delhi', 'Central Delhi', TRUE),
('b0000000-0000-0000-0000-000000000003', 'Dr. Meera Nambiar', 'analyst@cybertrace.gov.in', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxGQrvkWChTa', 'a0000000-0000-0000-0000-000000000006', 'Predictive Analytics Wing', 'Karnataka', 'Bengaluru Urban', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO banks (id, bank_code, name, type) VALUES
('c0000000-0000-0000-0000-000000000001', 'SBIN', 'State Bank of India', 'PUBLIC'),
('c0000000-0000-0000-0000-000000000002', 'HDFC', 'HDFC Bank', 'PRIVATE'),
('c0000000-0000-0000-0000-000000000003', 'ICIC', 'ICICI Bank', 'PRIVATE'),
('c0000000-0000-0000-0000-000000000004', 'PUNB', 'Punjab National Bank', 'PUBLIC')
ON CONFLICT (bank_code) DO NOTHING;

INSERT INTO atms (id, atm_code, bank_id, location, district, area, atm_type, is_active) VALUES
('d0000000-0000-0000-0000-000000000001', 'ATM1023', 'c0000000-0000-0000-0000-000000000001', ST_SetSRID(ST_MakePoint(77.2167, 28.6289), 4326)::geography, 'New Delhi', 'Connaught Place Outer Circle', 'STANDALONE', TRUE),
('d0000000-0000-0000-0000-000000000002', 'ATM1024', 'c0000000-0000-0000-0000-000000000002', ST_SetSRID(ST_MakePoint(77.2205, 28.6320), 4326)::geography, 'New Delhi', 'Barakhamba Road', 'ON_SITE', TRUE),
('d0000000-0000-0000-0000-000000000003', 'ATM1025', 'c0000000-0000-0000-0000-000000000003', ST_SetSRID(ST_MakePoint(77.6221, 12.9352), 4326)::geography, 'Bengaluru Urban', 'Koramangala 5th Block', 'STANDALONE', TRUE),
('d0000000-0000-0000-0000-000000000004', 'ATM1026', 'c0000000-0000-0000-0000-000000000001', ST_SetSRID(ST_MakePoint(72.8397, 19.0596), 4326)::geography, 'Mumbai Suburban', 'Bandra West Linking Road', 'STANDALONE', TRUE),
('d0000000-0000-0000-0000-000000000005', 'ATM1027', 'c0000000-0000-0000-0000-000000000004', ST_SetSRID(ST_MakePoint(78.3814, 17.4475), 4326)::geography, 'Hyderabad', 'HITEC City Cyber Towers', 'ON_SITE', TRUE)
ON CONFLICT (atm_code) DO NOTHING;

INSERT INTO accounts (id, tokenized_account_ref, bank_id) VALUES
('e0000000-0000-0000-0000-000000000001', 'TOK_ACCT_9921_SBIN', 'c0000000-0000-0000-0000-000000000001'),
('e0000000-0000-0000-0000-000000000002', 'TOK_ACCT_8834_HDFC', 'c0000000-0000-0000-0000-000000000002'),
('e0000000-0000-0000-0000-000000000003', 'TOK_ACCT_7712_ICIC', 'c0000000-0000-0000-0000-000000000003')
ON CONFLICT (tokenized_account_ref) DO NOTHING;

INSERT INTO complaints (id, complaint_number, reported_at, crime_category, fraud_amount, state, district, police_station, location, status) VALUES
('f0000000-0000-0000-0000-000000000001', 'NCRP-2026-90812', CURRENT_TIMESTAMP - INTERVAL '2 hours', 'ATM Skimming & Clone', 45000.00, 'Delhi', 'New Delhi', 'Connaught Place PS', ST_SetSRID(ST_MakePoint(77.2165, 28.6291), 4326)::geography, 'NEW'),
('f0000000-0000-0000-0000-000000000002', 'NCRP-2026-90813', CURRENT_TIMESTAMP - INTERVAL '1 hour', 'Unauthorized Cash Withdrawal', 20000.00, 'Delhi', 'New Delhi', 'Barakhamba PS', ST_SetSRID(ST_MakePoint(77.2198, 28.6315), 4326)::geography, 'IN_PROGRESS'),
('f0000000-0000-0000-0000-000000000003', 'NCRP-2026-90814', CURRENT_TIMESTAMP - INTERVAL '4 hours', 'Phishing & Mule Withdrawal', 85000.00, 'Karnataka', 'Bengaluru Urban', 'Koramangala PS', ST_SetSRID(ST_MakePoint(77.6219, 12.9355), 4326)::geography, 'RESOLVED')
ON CONFLICT (complaint_number) DO NOTHING;

INSERT INTO transactions (id, transaction_reference, transaction_time, amount, transaction_type, account_id, atm_id, location, risk_label, complaint_id) VALUES
('10000000-0000-0000-0000-000000000001', 'TXN-98210-CP', CURRENT_TIMESTAMP - INTERVAL '90 minutes', 10000.00, 'WITHDRAWAL', 'e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', ST_SetSRID(ST_MakePoint(77.2167, 28.6289), 4326)::geography, 'FRAUD', 'f0000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000002', 'TXN-98211-CP', CURRENT_TIMESTAMP - INTERVAL '80 minutes', 10000.00, 'WITHDRAWAL', 'e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', ST_SetSRID(ST_MakePoint(77.2167, 28.6289), 4326)::geography, 'FRAUD', 'f0000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000003', 'TXN-98212-CP', CURRENT_TIMESTAMP - INTERVAL '50 minutes', 500.00, 'BALANCE_INQUIRY', 'e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', ST_SetSRID(ST_MakePoint(77.2205, 28.6320), 4326)::geography, 'NORMAL', NULL)
ON CONFLICT (transaction_reference) DO NOTHING;

INSERT INTO predictions (id, atm_id, prediction_time, window_start, window_end, risk_score, risk_level, model_version, confidence, reasons) VALUES
('20000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '3 hours', 91, 'CRITICAL', 'xgb-v1', 0.91, '["High complaint density nearby", "Recent withdrawal activity increased", "Historical hotspot pattern for this time window"]'::jsonb)
ON CONFLICT DO NOTHING;

INSERT INTO alerts (id, prediction_id, alert_type, risk_score, risk_level, message, status, created_at) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'ELEVATED_WITHDRAWAL_RISK', 91, 'CRITICAL', 'Urgent: High probability (91%) of fraudulent cash withdrawals at Connaught Place Outer Circle (ATM1023) in the next 3 hours.', 'NEW', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO cases (id, case_number, title, priority, status, assigned_officer) VALUES
('40000000-0000-0000-0000-000000000001', 'CASE-2026-DEL-042', 'Connaught Place ATM Skimming Cluster', 'HIGH', 'OPEN', 'b0000000-0000-0000-0000-000000000002')
ON CONFLICT (case_number) DO NOTHING;

INSERT INTO case_complaints (case_id, complaint_id) VALUES
('40000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

INSERT INTO case_transactions (case_id, transaction_id) VALUES
('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

INSERT INTO risk_zones (id, name, geometry, risk_score, risk_level, prediction_window_start, prediction_window_end) VALUES
('50000000-0000-0000-0000-000000000001', 'Connaught Place High-Risk Corridor', ST_SetSRID(ST_GeomFromText('POLYGON((77.2100 28.6250, 77.2250 28.6250, 77.2250 28.6350, 77.2100 28.6350, 77.2100 28.6250))'), 4326)::geography, 88, 'CRITICAL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '3 hours')
ON CONFLICT DO NOTHING;
