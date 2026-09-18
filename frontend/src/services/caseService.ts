import { apiClient } from './api';
import { Case, Evidence } from '../types';
import { MOCK_CASES, MOCK_COMPLAINTS, MOCK_TRANSACTIONS } from './mockData';
import { authService } from './authService';

export const caseService = {
  async getCases(): Promise<Case[]> {
    if (authService.isMockMode()) {
      await new Promise((res) => setTimeout(res, 300));
      return [...MOCK_CASES];
    }
    const response = await apiClient.get<Case[]>('/cases');
    return response.data;
  },

  async getCaseById(id: string): Promise<Case> {
    if (authService.isMockMode()) {
      const found = MOCK_CASES.find((c) => c.id === id || c.caseNumber === id);
      if (!found) return MOCK_CASES[0];
      return {
        ...found,
        linkedComplaints: MOCK_COMPLAINTS.slice(0, 3),
        linkedTransactions: MOCK_TRANSACTIONS.slice(0, 2),
      };
    }
    const response = await apiClient.get<Case>(`/cases/${id}`);
    return response.data;
  },

  async createCase(caseData: Partial<Case>): Promise<Case> {
    if (authService.isMockMode()) {
      await new Promise((res) => setTimeout(res, 500));
      const newCase: Case = {
        id: `CASE-2026-${Math.floor(Math.random() * 90 + 10)}`,
        caseNumber: `CAS-I4C-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
        title: caseData.title || 'New Cybercrime Investigation',
        priority: caseData.priority || 'HIGH',
        status: 'OPEN',
        assignedOfficer: caseData.assignedOfficer || 'None',
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

    const response = await apiClient.post<Case>('/cases', caseData);
    return response.data;
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
        uploadedBy: 'None',
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

    const response = await apiClient.post<Evidence>(`/cases/${caseId}/evidence`, evidenceData);
    return response.data;
  }
};
