import { apiClient } from './api';
import { Complaint } from '../types';
import { MOCK_COMPLAINTS } from './mockData';
import { authService } from './authService';

export const complaintService = {
  async getComplaints(): Promise<Complaint[]> {
    if (authService.isMockMode()) {
      await new Promise((res) => setTimeout(res, 300));
      return [...MOCK_COMPLAINTS];
    }
    try {
      const response = await apiClient.get<any>('/complaints');
      const rawList = Array.isArray(response.data) ? response.data : (response.data?.content || []);
      return rawList.map((raw: any) => ({
        id: String(raw.id || raw.complaintNumber || ''),
        complaintNumber: raw.complaintNumber || 'NCRP-UNKNOWN',
        reportedAt: raw.reportedAt || raw.createdAt || new Date().toISOString(),
        crimeCategory: raw.crimeCategory || 'ATM_WITHDRAWAL_FRAUD',
        fraudAmount: raw.fraudAmount || 0,
        state: raw.state || 'Delhi NCR',
        district: raw.district || 'New Delhi',
        policeStation: raw.policeStation || 'Police Station',
        location: {
          lat: raw.latitude ?? raw.location?.lat ?? 28.6315,
          lng: raw.longitude ?? raw.location?.lng ?? 77.2167
        },
        status: raw.status || 'NEW',
        createdAt: raw.createdAt || raw.reportedAt || new Date().toISOString()
      }));
    } catch {
      return [...MOCK_COMPLAINTS];
    }
  },

  async createComplaint(complaintData: Partial<Complaint>): Promise<Complaint> {
    if (authService.isMockMode()) {
      await new Promise((res) => setTimeout(res, 500));
      const newComplaint: Complaint = {
        id: `CMP-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
        complaintNumber: `NCRP-2026-${Math.floor(Math.random() * 90000 + 10000)}`,
        reportedAt: new Date().toISOString(),
        crimeCategory: complaintData.crimeCategory || 'ATM_WITHDRAWAL_FRAUD',
        fraudAmount: complaintData.fraudAmount || 50000,
        state: complaintData.state || 'Delhi NCR',
        district: complaintData.district || 'New Delhi',
        policeStation: complaintData.policeStation || 'Connaught Place PS',
        location: complaintData.location || { lat: 28.6315, lng: 77.2167 },
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      MOCK_COMPLAINTS.unshift(newComplaint);
      return newComplaint;
    }

    const response = await apiClient.post<Complaint>('/complaints', complaintData);
    return response.data;
  }
};
