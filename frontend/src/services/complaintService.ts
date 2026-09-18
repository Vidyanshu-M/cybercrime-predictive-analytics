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
    const response = await apiClient.get<Complaint[]>('/complaints');
    return response.data;
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
