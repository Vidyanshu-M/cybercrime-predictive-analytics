import { 
  User, 
  ATM, 
  Complaint, 
  Transaction, 
  Prediction, 
  RiskZone, 
  Alert, 
  Case, 
  DashboardSummary,
  MLModelMetrics
} from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'USR-101',
    name: 'None',
    email: 'none@cybertrace.gov.in',
    role: 'I4C_OFFICER',
    department: 'Indian Cybercrime Coordination Centre (I4C)',
    state: 'Delhi NCR',
    district: 'New Delhi',
    isActive: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'USR-102',
    name: 'None',
    email: 'none.state@police.gov.in',
    role: 'STATE_OFFICER',
    department: 'State Cyber Crime Cell',
    state: 'Haryana',
    district: 'Gurugram',
    isActive: true,
  },
  {
    id: 'USR-103',
    name: 'None',
    email: 'none.bank@sbi.co.in',
    role: 'BANK_OFFICER',
    department: 'Fraud Risk Management',
    state: 'Maharashtra',
    district: 'Mumbai Suburbs',
    isActive: true,
  },
  {
    id: 'USR-104',
    name: 'None',
    email: 'none.analyst@cybertrace.gov.in',
    role: 'ANALYST',
    department: 'Predictive Intelligence Wing',
    state: 'Delhi NCR',
    district: 'Central Delhi',
    isActive: true,
  }
];

export const MOCK_ATMS: ATM[] = [
  {
    id: 'ATM-101',
    atmCode: 'ATM1023',
    bankId: 'BANK-SBI',
    bankName: 'State Bank of India',
    location: { lat: 28.6315, lng: 77.2167 },
    district: 'New Delhi',
    area: 'Connaught Place Circle Block A',
    atmType: 'ONSITE',
    isActive: true,
    historicalHotspotScore: 88
  },
  {
    id: 'ATM-102',
    atmCode: 'ATM1088',
    bankId: 'BANK-HDFC',
    bankName: 'HDFC Bank',
    location: { lat: 28.4595, lng: 77.0266 },
    district: 'Gurugram',
    area: 'DLF Cyber City Phase 2',
    atmType: 'OFFSITE',
    isActive: true,
    historicalHotspotScore: 92
  },
  {
    id: 'ATM-103',
    atmCode: 'ATM2045',
    bankId: 'BANK-ICICI',
    bankName: 'ICICI Bank',
    location: { lat: 28.5700, lng: 77.3200 },
    district: 'Noida',
    area: 'Sector 18 Metro Station Market',
    atmType: 'OFFSITE',
    isActive: true,
    historicalHotspotScore: 76
  },
  {
    id: 'ATM-104',
    atmCode: 'ATM3012',
    bankId: 'BANK-PNB',
    bankName: 'Punjab National Bank',
    location: { lat: 28.6500, lng: 77.1500 },
    district: 'West Delhi',
    area: 'Rajouri Garden Main Market',
    atmType: 'ONSITE',
    isActive: true,
    historicalHotspotScore: 64
  },
  {
    id: 'ATM-105',
    atmCode: 'ATM4099',
    bankId: 'BANK-AXIS',
    bankName: 'Axis Bank',
    location: { lat: 19.0596, lng: 72.8295 },
    district: 'Mumbai West',
    area: 'Bandra Linking Road',
    atmType: 'OFFSITE',
    isActive: true,
    historicalHotspotScore: 82
  },
  {
    id: 'ATM-106',
    atmCode: 'ATM5034',
    bankId: 'BANK-SBI',
    bankName: 'State Bank of India',
    location: { lat: 12.9784, lng: 77.6408 },
    district: 'Bengaluru Urban',
    area: 'Indiranagar 100ft Road',
    atmType: 'ONSITE',
    isActive: true,
    historicalHotspotScore: 45
  },
  {
    id: 'ATM-107',
    atmCode: 'ATM6021',
    bankId: 'BANK-BOB',
    bankName: 'Bank of Baroda',
    location: { lat: 22.5532, lng: 88.3518 },
    district: 'Kolkata Central',
    area: 'Park Street Metro Precinct',
    atmType: 'OFFSITE',
    isActive: true,
    historicalHotspotScore: 58
  },
  {
    id: 'ATM-108',
    atmCode: 'ATM7044',
    bankId: 'BANK-HDFC',
    bankName: 'HDFC Bank',
    location: { lat: 28.6250, lng: 77.2100 },
    district: 'New Delhi',
    area: 'Janpath Metro Exit Gate 2',
    atmType: 'OFFSITE',
    isActive: true,
    historicalHotspotScore: 79
  }
];

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'CMP-2026-8801',
    complaintNumber: 'NCRP-2026-99412',
    reportedAt: '2026-09-17T06:15:00Z',
    crimeCategory: 'ATM_WITHDRAWAL_FRAUD',
    fraudAmount: 45000,
    state: 'Delhi NCR',
    district: 'New Delhi',
    policeStation: 'Connaught Place PS',
    location: { lat: 28.6318, lng: 77.2170 },
    status: 'INVESTIGATING',
    createdAt: '2026-09-17T06:20:00Z'
  },
  {
    id: 'CMP-2026-8802',
    complaintNumber: 'NCRP-2026-99413',
    reportedAt: '2026-09-17T05:40:00Z',
    crimeCategory: 'ATM_WITHDRAWAL_FRAUD',
    fraudAmount: 120000,
    state: 'Haryana',
    district: 'Gurugram',
    policeStation: 'Cyber Crime PS Sector 43',
    location: { lat: 28.4598, lng: 77.0269 },
    status: 'PENDING',
    createdAt: '2026-09-17T05:50:00Z'
  },
  {
    id: 'CMP-2026-8803',
    complaintNumber: 'NCRP-2026-99414',
    reportedAt: '2026-09-17T04:10:00Z',
    crimeCategory: 'SIM_SWAP',
    fraudAmount: 85000,
    state: 'Uttar Pradesh',
    district: 'Noida',
    policeStation: 'Sector 20 PS',
    location: { lat: 28.5703, lng: 77.3204 },
    status: 'INVESTIGATING',
    createdAt: '2026-09-17T04:30:00Z'
  },
  {
    id: 'CMP-2026-8804',
    complaintNumber: 'NCRP-2026-99415',
    reportedAt: '2026-09-17T03:00:00Z',
    crimeCategory: 'MONEY_MULE',
    fraudAmount: 230000,
    state: 'Delhi NCR',
    district: 'West Delhi',
    policeStation: 'Rajouri Garden PS',
    location: { lat: 28.6504, lng: 77.1503 },
    status: 'INVESTIGATING',
    createdAt: '2026-09-17T03:15:00Z'
  },
  {
    id: 'CMP-2026-8805',
    complaintNumber: 'NCRP-2026-99416',
    reportedAt: '2026-09-16T22:30:00Z',
    crimeCategory: 'ATM_WITHDRAWAL_FRAUD',
    fraudAmount: 90000,
    state: 'Maharashtra',
    district: 'Mumbai West',
    policeStation: 'Bandra PS',
    location: { lat: 19.0601, lng: 72.8299 },
    status: 'PENDING',
    createdAt: '2026-09-16T22:45:00Z'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-901221',
    transactionReference: 'TXN-SBI-8840291',
    transactionTime: '2026-09-17T06:10:00Z',
    amount: 20000,
    transactionType: 'ATM_WITHDRAWAL',
    accountId: 'ACC-REF-88421',
    atmId: 'ATM-101',
    location: { lat: 28.6315, lng: 77.2167 },
    riskLabel: 1,
    complaintId: 'CMP-2026-8801'
  },
  {
    id: 'TXN-901222',
    transactionReference: 'TXN-SBI-8840292',
    transactionTime: '2026-09-17T06:12:00Z',
    amount: 25000,
    transactionType: 'ATM_WITHDRAWAL',
    accountId: 'ACC-REF-88421',
    atmId: 'ATM-101',
    location: { lat: 28.6315, lng: 77.2167 },
    riskLabel: 1,
    complaintId: 'CMP-2026-8801'
  },
  {
    id: 'TXN-901223',
    transactionReference: 'TXN-HDFC-991204',
    transactionTime: '2026-09-17T05:35:00Z',
    amount: 50000,
    transactionType: 'ATM_WITHDRAWAL',
    accountId: 'ACC-REF-90211',
    atmId: 'ATM-102',
    location: { lat: 28.4595, lng: 77.0266 },
    riskLabel: 1,
    complaintId: 'CMP-2026-8802'
  }
];

export const MOCK_PREDICTIONS: Prediction[] = [
  {
    id: 'PRED-7001',
    atmId: 'ATM-101',
    atmCode: 'ATM1023',
    predictionTime: '2026-09-17T06:30:00Z',
    probability: 0.91,
    riskScore: 91,
    riskLevel: 'CRITICAL',
    modelVersion: 'xgb-v1',
    confidence: 0.94,
    predictionWindow: {
      start: '2026-09-17T07:00:00Z',
      end: '2026-09-17T10:00:00Z'
    },
    reasons: [
      'High complaint density within 1.0 km in last 6 hours (5 reported incidents)',
      'Burst withdrawal frequency detected: 4 consecutive max limits in 15 mins',
      'Historical hotspot temporal pattern matched (Thursday 07:00 - 10:00 window)',
      'Proximity to active mule account cash-out node'
    ]
  },
  {
    id: 'PRED-7002',
    atmId: 'ATM-102',
    atmCode: 'ATM1088',
    predictionTime: '2026-09-17T06:25:00Z',
    probability: 0.84,
    riskScore: 84,
    riskLevel: 'CRITICAL',
    modelVersion: 'xgb-v1',
    confidence: 0.91,
    predictionWindow: {
      start: '2026-09-17T07:00:00Z',
      end: '2026-09-17T10:00:00Z'
    },
    reasons: [
      'Cluster of 3 Vishing/Phishing complaints logged in Cyber City Sector 43',
      'Abnormal surge in high-value withdrawal velocity (+320% vs baseline)',
      'Spatial heat index 92/100 for Gurugram Cyber Corridor'
    ]
  },
  {
    id: 'PRED-7003',
    atmId: 'ATM-103',
    atmCode: 'ATM2045',
    predictionTime: '2026-09-17T06:00:00Z',
    probability: 0.68,
    riskScore: 68,
    riskLevel: 'HIGH',
    modelVersion: 'xgb-v1',
    confidence: 0.88,
    predictionWindow: {
      start: '2026-09-17T07:00:00Z',
      end: '2026-09-17T10:00:00Z'
    },
    reasons: [
      'Sim Swap complaint reported 0.8 km away at 04:10 AM',
      'Multiple off-hour card skim alerts on adjacent network terminal'
    ]
  },
  {
    id: 'PRED-7004',
    atmId: 'ATM-104',
    atmCode: 'ATM3012',
    predictionTime: '2026-09-17T05:30:00Z',
    probability: 0.42,
    riskScore: 42,
    riskLevel: 'MEDIUM',
    modelVersion: 'xgb-v1',
    confidence: 0.85,
    predictionWindow: {
      start: '2026-09-17T06:00:00Z',
      end: '2026-09-17T09:00:00Z'
    },
    reasons: [
      'Moderate withdrawal activity spikes near Rajouri Garden Market',
      'No immediate 1km complaint cluster reported in past 3 hours'
    ]
  }
];

export const MOCK_RISK_ZONES: RiskZone[] = [
  {
    id: 'ZONE-DELHI-CP',
    name: 'Connaught Place Fraud Corridor',
    center: { lat: 28.6315, lng: 77.2167 },
    radiusKm: 1.2,
    riskScore: 91,
    riskLevel: 'CRITICAL',
    complaintCount: 14,
    atmCount: 6,
    predictionWindowStart: '2026-09-17T07:00:00Z',
    predictionWindowEnd: '2026-09-17T10:00:00Z'
  },
  {
    id: 'ZONE-GURUGRAM-CYBER',
    name: 'Gurugram DLF Cyber Corridor',
    center: { lat: 28.4595, lng: 77.0266 },
    radiusKm: 2.0,
    riskScore: 84,
    riskLevel: 'CRITICAL',
    complaintCount: 19,
    atmCount: 9,
    predictionWindowStart: '2026-09-17T07:00:00Z',
    predictionWindowEnd: '2026-09-17T10:00:00Z'
  },
  {
    id: 'ZONE-NOIDA-SEC18',
    name: 'Noida Sector 18 Commercial Hub',
    center: { lat: 28.5700, lng: 77.3200 },
    radiusKm: 1.5,
    riskScore: 68,
    riskLevel: 'HIGH',
    complaintCount: 8,
    atmCount: 5,
    predictionWindowStart: '2026-09-17T07:00:00Z',
    predictionWindowEnd: '2026-09-17T10:00:00Z'
  },
  {
    id: 'ZONE-MUMBAI-BANDRA',
    name: 'Bandra West Financial Zone',
    center: { lat: 19.0596, lng: 72.8295 },
    radiusKm: 1.8,
    riskScore: 62,
    riskLevel: 'HIGH',
    complaintCount: 11,
    atmCount: 7,
    predictionWindowStart: '2026-09-17T07:00:00Z',
    predictionWindowEnd: '2026-09-17T10:00:00Z'
  }
];

export const MOCK_ALERTS: Alert[] = [
  {
    id: 'ALT-2026-901',
    predictionId: 'PRED-7001',
    alertType: 'ATM_HOTSPOT_PREDICTION',
    riskScore: 91,
    riskLevel: 'CRITICAL',
    message: 'CRITICAL ALERT: ATM1023 (CP Block A) predicted 91% probability of illegal withdrawal surge within next 3 hours.',
    status: 'NEW',
    createdAt: '2026-09-17T06:30:15Z',
    atmId: 'ATM-101',
    atmCode: 'ATM1023',
    district: 'New Delhi',
    location: { lat: 28.6315, lng: 77.2167 },
    reasons: [
      '5 NCRP complaints lodged within 1.0 km radius in past 6 hrs',
      '4 rapid max-limit cash out attempts detected on terminal'
    ]
  },
  {
    id: 'ALT-2026-902',
    predictionId: 'PRED-7002',
    alertType: 'HIGH_FREQUENCY_WITHDRAWAL',
    riskScore: 84,
    riskLevel: 'CRITICAL',
    message: 'CRITICAL ALERT: ATM1088 (DLF Cyber City) cash-out pattern correlates with active Vishing campaign.',
    status: 'ACKNOWLEDGED',
    createdAt: '2026-09-17T06:25:40Z',
    acknowledgedAt: '2026-09-17T06:28:10Z',
    atmId: 'ATM-102',
    atmCode: 'ATM1088',
    district: 'Gurugram',
    location: { lat: 28.4595, lng: 77.0266 },
    reasons: [
      'Abnormal withdrawal velocity surge (+320%)',
      'Linked to NCRP complaint cluster NCRP-2026-99413'
    ]
  },
  {
    id: 'ALT-2026-903',
    predictionId: 'PRED-7003',
    alertType: 'COMPLAINT_CLUSTER',
    riskScore: 68,
    riskLevel: 'HIGH',
    message: 'HIGH ALERT: ATM2045 (Noida Sec 18) proximity risk elevated due to recent SIM-swap fraud report.',
    status: 'ASSIGNED',
    createdAt: '2026-09-17T06:01:00Z',
    assignedTo: 'None',
    atmId: 'ATM-103',
    atmCode: 'ATM2045',
    district: 'Noida',
    location: { lat: 28.5700, lng: 77.3200 }
  },
  {
    id: 'ALT-2026-904',
    alertType: 'SUSPICIOUS_MULE_ACTIVITY',
    riskScore: 75,
    riskLevel: 'HIGH',
    message: 'HIGH ALERT: Multiple cardless withdrawals detected across 3 adjacent ATMs in West Delhi.',
    status: 'NEW',
    createdAt: '2026-09-17T05:12:00Z',
    district: 'West Delhi',
    location: { lat: 28.6500, lng: 77.1500 }
  }
];

export const MOCK_CASES: Case[] = [
  {
    id: 'CASE-2026-041',
    caseNumber: 'CAS-I4C-2026-0091',
    title: 'Connaught Place Multi-ATM Cash Out Syndicate',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    assignedOfficer: 'None',
    createdAt: '2026-09-17T06:22:00Z',
    updatedAt: '2026-09-17T06:35:00Z',
    complaintCount: 4,
    transactionCount: 8,
    evidenceCount: 3,
    district: 'New Delhi',
    summary: 'Coordinate investigation into organized cash-out mule group operating around Connaught Place Block A ATMs following phishing scam victim funds transfer.',
    linkedComplaints: [MOCK_COMPLAINTS[0]],
    linkedTransactions: [MOCK_TRANSACTIONS[0], MOCK_TRANSACTIONS[1]],
    evidenceList: [
      {
        id: 'EVD-101',
        caseId: 'CASE-2026-041',
        fileName: 'ATM1023_CCTV_Footage_0610AM.mp4',
        fileType: 'video/mp4',
        storageReference: 's3://cybertrace-evidence/2026/09/17/cctv_cp.mp4',
        uploadedBy: 'None',
        uploadedAt: '2026-09-17T06:25:00Z',
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        fileSizeBytes: 45200000
      },
      {
        id: 'EVD-102',
        caseId: 'CASE-2026-041',
        fileName: 'NCRP_Complaint_Audit_Log_99412.pdf',
        fileType: 'application/pdf',
        storageReference: 's3://cybertrace-evidence/2026/09/17/ncrp_audit.pdf',
        uploadedBy: 'None',
        uploadedAt: '2026-09-17T06:28:00Z',
        hash: '8f4e912bc001d9f821049281a',
        fileSizeBytes: 1200000
      }
    ]
  },
  {
    id: 'CASE-2026-042',
    caseNumber: 'CAS-HR-2026-0104',
    title: 'Gurugram Vishing Phishing Ring',
    priority: 'HIGH',
    status: 'OPEN',
    assignedOfficer: 'None',
    createdAt: '2026-09-17T05:55:00Z',
    updatedAt: '2026-09-17T06:10:00Z',
    complaintCount: 3,
    transactionCount: 5,
    evidenceCount: 2,
    district: 'Gurugram',
    summary: 'Targeted call center operating illegal bank KYC update scams with rapid ATM withdrawals in Cyber City.',
    linkedComplaints: [MOCK_COMPLAINTS[1]],
    linkedTransactions: [MOCK_TRANSACTIONS[2]],
    evidenceList: []
  }
];

export const MOCK_DASHBOARD_SUMMARY: DashboardSummary = {
  totalComplaints: 12480,
  activeHotspots: 14,
  highRiskATMs: 38,
  pendingAlerts: 7,
  avgResponseTimeMinutes: 18,
  fraudAmountPrevented: 4850000,
  riskDistribution: {
    low: 420,
    medium: 145,
    high: 48,
    critical: 14
  },
  recentAlerts: MOCK_ALERTS,
  recentComplaints: MOCK_COMPLAINTS,
  hourlyRiskTrend: [
    { hour: '00:00', low: 12, medium: 4, high: 1, critical: 0 },
    { hour: '03:00', low: 8, medium: 6, high: 3, critical: 1 },
    { hour: '06:00', low: 24, medium: 18, high: 12, critical: 5 },
    { hour: '09:00', low: 45, medium: 28, high: 14, critical: 3 },
    { hour: '12:00', low: 52, medium: 32, high: 10, critical: 2 },
    { hour: '15:00', low: 40, medium: 25, high: 8, critical: 1 },
    { hour: '18:00', low: 35, medium: 20, high: 9, critical: 2 },
    { hour: '21:00', low: 22, medium: 15, high: 7, critical: 4 },
  ],
  topDistrictRisks: [
    { district: 'New Delhi', riskScore: 91, complaintCount: 342 },
    { district: 'Gurugram', riskScore: 84, complaintCount: 288 },
    { district: 'Noida', riskScore: 76, complaintCount: 215 },
    { district: 'Mumbai West', riskScore: 72, complaintCount: 198 },
    { district: 'Bengaluru Urban', riskScore: 58, complaintCount: 142 }
  ]
};

export const MOCK_ML_METRICS: MLModelMetrics = {
  modelVersion: 'XGBoost v1.4.2 (Production)',
  precision: 0.884,
  recall: 0.862,
  f1Score: 0.873,
  rocAuc: 0.941,
  prAuc: 0.915,
  trainedAt: '2026-09-15 18:30:00 UTC',
  datasetSize: '30,000 Transactions | 10,000 Complaints | 500 ATMs',
  featureImportance: [
    { feature: 'complaints_1km_6h', importance: 0.32, group: 'Spatial' },
    { feature: 'withdrawal_burst_count_15m', importance: 0.24, group: 'Financial' },
    { feature: 'dist_from_recent_fraud', importance: 0.18, group: 'Spatial' },
    { feature: 'historical_hotspot_score', importance: 0.14, group: 'Temporal' },
    { feature: 'hour_of_day_peak', importance: 0.08, group: 'Temporal' },
    { feature: 'unique_accounts_1h', importance: 0.04, group: 'Financial' },
  ]
};
