import { apiClient } from './api';
import { Case, Evidence } from '../types';
import { MOCK_CASES, MOCK_COMPLAINTS, MOCK_TRANSACTIONS } from './mockData';
import { authService } from './authService';

export const caseService = {
  async getCases(): Promise<Case[]> {
    try {
      const response = await apiClient.get<any>('/cases');
      const rawList = Array.isArray(response.data) ? response.data : (response.data?.content || []);
      return rawList.map((raw: any) => ({
        id: String(raw.id || raw.caseNumber || ''),
        caseNumber: raw.caseNumber || 'CAS-UNKNOWN',
        title: raw.title || 'Cybercrime Investigation Case',
        priority: raw.priority || 'HIGH',
        status: raw.status || 'OPEN',
        assignedOfficer: raw.assignedOfficerName || raw.assignedOfficer || 'Inspector Vikram Roy',
        createdAt: raw.createdAt || new Date().toISOString(),
        updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
        complaintCount: raw.linkedComplaintsCount ?? raw.complaintCount ?? 0,
        transactionCount: raw.linkedTransactionsCount ?? raw.transactionCount ?? 0,
        evidenceCount: raw.evidenceCount ?? 0,
        district: raw.district || (raw.title?.includes('Bandra') ? 'Mumbai Suburban' : raw.title?.includes('Indiranagar') ? 'Bengaluru Urban' : 'New Delhi'),
        summary: raw.summary || `Investigation dossier for ${raw.title}. Correlated with live NCRP financial fraud complaints.`
      }));
    } catch (err) {
      console.warn('Backend cases unavailable, falling back to mock dataset', err);
      return [...MOCK_CASES];
    }
  },

  async getCaseById(id: string): Promise<Case> {
    try {
      const response = await apiClient.get<any>(`/cases/${id}`);
      const raw = response.data;
      return {
        id: String(raw.id || id),
        caseNumber: raw.caseNumber || 'CAS-UNKNOWN',
        title: raw.title || 'Investigation Case',
        priority: raw.priority || 'HIGH',
        status: raw.status || 'OPEN',
        assignedOfficer: raw.assignedOfficerName || raw.assignedOfficer || 'Inspector Vikram Roy',
        createdAt: raw.createdAt || new Date().toISOString(),
        updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
        complaintCount: raw.linkedComplaintsCount ?? (raw.complaints?.length || 0),
        transactionCount: raw.linkedTransactionsCount ?? (raw.transactions?.length || 0),
        evidenceCount: raw.evidenceCount ?? (raw.evidenceList?.length || 0),
        district: raw.district || (raw.title?.includes('Bandra') ? 'Mumbai Suburban' : raw.title?.includes('Indiranagar') ? 'Bengaluru Urban' : 'New Delhi'),
        summary: raw.summary || 'Active cyber fraud investigation dossier with linked NCRP complaints and transaction forensics.',
        linkedComplaints: (raw.complaints || []).map((cmp: any) => ({
          id: String(cmp.id || cmp.complaintNumber || ''),
          complaintNumber: cmp.complaintNumber || 'NCRP-UNKNOWN',
          reportedAt: cmp.reportedAt || new Date().toISOString(),
          crimeCategory: cmp.crimeCategory || 'ATM_WITHDRAWAL_FRAUD',
          fraudAmount: cmp.fraudAmount || 0,
          state: cmp.state || 'Delhi NCR',
          district: cmp.district || 'New Delhi',
          policeStation: cmp.policeStation || 'Police Station',
          location: {
            lat: cmp.latitude ?? cmp.location?.lat ?? 28.6315,
            lng: cmp.longitude ?? cmp.location?.lng ?? 77.2167
          },
          status: cmp.status || 'NEW',
          createdAt: cmp.createdAt || new Date().toISOString()
        })),
        linkedTransactions: (raw.transactions || []).map((txn: any) => ({
          id: String(txn.id || txn.transactionReference || ''),
          transactionReference: txn.transactionReference || 'TXN-REF',
          transactionTime: txn.transactionTime || new Date().toISOString(),
          amount: txn.amount || 0,
          transactionType: txn.transactionType || 'ATM_WITHDRAWAL',
          accountId: txn.tokenizedAccountRef || txn.accountId || 'ACC-****',
          atmId: txn.atmCode || txn.atmId || '',
          location: {
            lat: txn.latitude ?? txn.location?.lat ?? 28.6328,
            lng: txn.longitude ?? txn.location?.lng ?? 77.2197
          },
          riskLabel: txn.riskLabel === '1' || txn.riskLabel === 1 || txn.riskLabel === 'SUSPICIOUS' ? 1 : 0,
          complaintId: txn.complaintId
        })),
        evidenceList: (raw.evidenceList || []).map((evd: any) => ({
          id: String(evd.id || ''),
          caseId: id,
          fileName: evd.fileName || 'Evidence_File.pdf',
          fileType: evd.fileType || 'application/pdf',
          storageReference: evd.storageReference || 's3://cybertrace-evidence/',
          uploadedBy: evd.uploadedByName || evd.uploadedBy || 'Investigating Officer',
          uploadedAt: evd.uploadedAt || new Date().toISOString(),
          hash: evd.hash || 'sha256-evidence-token',
          fileSizeBytes: evd.fileSizeBytes || 1024000
        }))
      };
    } catch (err) {
      console.warn('Failed to fetch case by id, falling back to mock dataset', err);
      const found = MOCK_CASES.find((c) => c.id === id || c.caseNumber === id) || MOCK_CASES[0];
      return {
        ...found,
        linkedComplaints: MOCK_COMPLAINTS.slice(0, 3),
        linkedTransactions: MOCK_TRANSACTIONS.slice(0, 2),
      };
    }
  },

  async createCase(caseData: Partial<Case>): Promise<Case> {
    if (authService.isMockMode()) {
      await new Promise((res) => setTimeout(res, 500));
      const newCase: Case = {
        id: `CASE-2026-${Math.floor(Math.random() * 90 + 10)}`,
        caseNumber: caseData.caseNumber || `CAS-I4C-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
        title: caseData.title || 'New Cybercrime Investigation',
        priority: caseData.priority || 'HIGH',
        status: 'OPEN',
        assignedOfficer: caseData.assignedOfficer || 'Inspector Vikram Roy',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        complaintCount: 1,
        transactionCount: 2,
        evidenceCount: 0,
        district: caseData.district || 'New Delhi',
        summary: caseData.summary || 'Initial investigation initialized.',
        linkedComplaints: [],
        linkedTransactions: [],
        evidenceList: []
      };
      MOCK_CASES.unshift(newCase);
      return newCase;
    }

    try {
      const payload = {
        caseNumber: caseData.caseNumber || `CASE-2026-DEL-${Math.floor(Math.random() * 900 + 100)}`,
        title: caseData.title || 'Untitled Investigation Case',
        priority: caseData.priority || 'HIGH',
        assignedOfficerId: 'b0000000-0000-0000-0000-000000000002',
        complaintIds: [],
        transactionIds: []
      };
      const response = await apiClient.post<any>('/cases', payload);
      const raw = response.data;
      return {
        id: String(raw.id),
        caseNumber: raw.caseNumber,
        title: raw.title,
        priority: raw.priority,
        status: raw.status || 'OPEN',
        assignedOfficer: raw.assignedOfficerName || 'Inspector Vikram Roy',
        createdAt: raw.createdAt || new Date().toISOString(),
        updatedAt: raw.createdAt || new Date().toISOString(),
        complaintCount: raw.linkedComplaintsCount ?? 0,
        transactionCount: raw.linkedTransactionsCount ?? 0,
        evidenceCount: raw.evidenceCount ?? 0,
        district: caseData.district || 'New Delhi',
        summary: caseData.summary || 'Newly created investigation dossier.'
      };
    } catch (err) {
      console.warn('Backend create case failed, returning local state', err);
      const fallback: Case = {
        id: `CASE-2026-${Date.now().toString().slice(-4)}`,
        caseNumber: caseData.caseNumber || `CASE-2026-DEL-${Math.floor(Math.random() * 900 + 100)}`,
        title: caseData.title || 'New Cybercrime Investigation',
        priority: caseData.priority || 'HIGH',
        status: 'OPEN',
        assignedOfficer: 'Inspector Vikram Roy',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        complaintCount: 0,
        transactionCount: 0,
        evidenceCount: 0,
        district: caseData.district || 'New Delhi',
        summary: caseData.summary || 'Newly created investigation dossier.'
      };
      MOCK_CASES.unshift(fallback);
      return fallback;
    }
  },

  async addEvidence(caseId: string, evidenceData: Partial<Evidence>): Promise<Evidence> {
    if (authService.isMockMode()) {
      await new Promise((res) => setTimeout(res, 400));
      const newEvidence: Evidence = {
        id: `EVD-${Date.now().toString().slice(-4)}`,
        caseId,
        fileName: evidenceData.fileName || 'Evidence_Document.pdf',
        fileType: evidenceData.fileType || 'application/pdf',
        storageReference: `s3://cybertrace-evidence/2026/09/${evidenceData.fileName}`,
        uploadedBy: 'Inspector Vikram Roy',
        uploadedAt: new Date().toISOString(),
        hash: 'a7c9f821d3320b98214',
        fileSizeBytes: 2450000
      };

      const foundCase = MOCK_CASES.find((c) => c.id === caseId);
      if (foundCase) {
        foundCase.evidenceCount += 1;
        if (!foundCase.evidenceList) foundCase.evidenceList = [];
        foundCase.evidenceList.push(newEvidence);
      }
      return newEvidence;
    }

    try {
      const payload = {
        fileName: evidenceData.fileName || 'Evidence_Artifact.pdf',
        fileType: evidenceData.fileType || 'application/pdf',
        storageReference: evidenceData.storageReference || `s3://cybertrace-evidence/2026/09/${evidenceData.fileName || 'document.pdf'}`,
        hash: evidenceData.hash || 'sha256-demo-artifact'
      };
      const response = await apiClient.post<any>(`/cases/${caseId}/evidence`, payload);
      const raw = response.data;
      return {
        id: String(raw.id || Date.now()),
        caseId,
        fileName: raw.fileName || payload.fileName,
        fileType: raw.fileType || payload.fileType,
        storageReference: raw.storageReference || payload.storageReference,
        uploadedBy: raw.uploadedByName || 'Inspector Vikram Roy',
        uploadedAt: raw.uploadedAt || new Date().toISOString(),
        hash: raw.hash || payload.hash,
        fileSizeBytes: 2450000
      };
    } catch (err) {
      console.warn('Backend register evidence failed, returning local state', err);
      return {
        id: `EVD-${Date.now().toString().slice(-4)}`,
        caseId,
        fileName: evidenceData.fileName || 'Evidence_Document.pdf',
        fileType: evidenceData.fileType || 'application/pdf',
        storageReference: `s3://cybertrace-evidence/2026/09/${evidenceData.fileName}`,
        uploadedBy: 'Inspector Vikram Roy',
        uploadedAt: new Date().toISOString(),
        hash: 'a7c9f821d3320b98214',
        fileSizeBytes: 2450000
      };
    }
  }
};
