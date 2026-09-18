export type UserRole = 
  | 'ADMIN'
  | 'I4C_OFFICER'
  | 'STATE_OFFICER'
  | 'DISTRICT_OFFICER'
  | 'BANK_OFFICER'
  | 'ANALYST';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'ASSIGNED' | 'RESOLVED';

export type CaseStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  state: string;
  district: string;
  isActive: boolean;
  avatarUrl?: string;
}

export interface ATM {
  id: string;
  atmCode: string;
  bankId: string;
  bankName: string;
  location: LocationCoordinates;
  district: string;
  area: string;
  atmType: 'ONSITE' | 'OFFSITE' | 'DRIVE_THRU';
  isActive: boolean;
  historicalHotspotScore?: number;
}

export interface Complaint {
  id: string;
  complaintNumber: string;
  reportedAt: string;
  crimeCategory: 'ATM_WITHDRAWAL_FRAUD' | 'PHISHING_LINK' | 'VISHING_CALL' | 'IDENTITY_THEFT' | 'SIM_SWAP' | 'MONEY_MULE';
  fraudAmount: number;
  state: string;
  district: string;
  policeStation: string;
  location: LocationCoordinates;
  status: 'PENDING' | 'INVESTIGATING' | 'CLOSED';
  createdAt: string;
}

export interface Transaction {
  id: string;
  transactionReference: string;
  transactionTime: string;
  amount: number;
  transactionType: 'ATM_WITHDRAWAL' | 'ONLINE_TRANSFER' | 'POS_PURCHASE';
  accountId: string;
  atmId?: string;
  location: LocationCoordinates;
  riskLabel: number; // 0 or 1
  complaintId?: string;
}

export interface PredictionWindow {
  start: string;
  end: string;
}

export interface Prediction {
  id: string;
  atmId: string;
  atmCode?: string;
  predictionTime: string;
  probability: number;
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  modelVersion: string;
  confidence: number;
  predictionWindow: PredictionWindow;
  reasons: string[];
}

export interface PredictionRunRequest {
  atmId: string;
  predictionWindowMinutes: number;
}

export interface RiskZone {
  id: string;
  name: string;
  center: LocationCoordinates;
  radiusKm: number;
  riskScore: number;
  riskLevel: RiskLevel;
  complaintCount: number;
  atmCount: number;
  predictionWindowStart: string;
  predictionWindowEnd: string;
  coordinates?: [number, number][]; // Polygon coordinates if needed
}

export interface Alert {
  id: string;
  predictionId?: string;
  alertType: 'ATM_HOTSPOT_PREDICTION' | 'HIGH_FREQUENCY_WITHDRAWAL' | 'COMPLAINT_CLUSTER' | 'SUSPICIOUS_MULE_ACTIVITY';
  riskScore: number;
  riskLevel: RiskLevel;
  message: string;
  status: AlertStatus;
  createdAt: string;
  acknowledgedAt?: string;
  assignedTo?: string;
  atmId?: string;
  atmCode?: string;
  district: string;
  location: LocationCoordinates;
  reasons?: string[];
}

export interface Evidence {
  id: string;
  caseId: string;
  fileName: string;
  fileType: string;
  storageReference: string;
  uploadedBy: string;
  uploadedAt: string;
  hash: string;
  fileSizeBytes?: number;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  priority: CasePriority;
  status: CaseStatus;
  assignedOfficer: string;
  createdAt: string;
  updatedAt: string;
  complaintCount: number;
  transactionCount: number;
  evidenceCount: number;
  district: string;
  summary: string;
  linkedComplaints?: Complaint[];
  linkedTransactions?: Transaction[];
  evidenceList?: Evidence[];
}

export interface DashboardSummary {
  totalComplaints: number;
  activeHotspots: number;
  highRiskATMs: number;
  pendingAlerts: number;
  avgResponseTimeMinutes: number;
  fraudAmountPrevented: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  recentAlerts: Alert[];
  recentComplaints: Complaint[];
  hourlyRiskTrend: { hour: string; low: number; medium: number; high: number; critical: number }[];
  topDistrictRisks: { district: string; riskScore: number; complaintCount: number }[];
}

export interface MLModelMetrics {
  modelVersion: string;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  prAuc: number;
  trainedAt: string;
  datasetSize: string;
  featureImportance: { feature: string; importance: number; group: 'Temporal' | 'Spatial' | 'Financial' }[];
}
