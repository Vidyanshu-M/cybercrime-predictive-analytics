import { apiClient } from './api';
import { Alert, AlertStatus } from '../types';
import { MOCK_ALERTS } from './mockData';
import { authService } from './authService';

export const alertService = {
  async getAlerts(): Promise<Alert[]> {
    try {
      const response = await apiClient.get<any>('/alerts');
      const rawList = Array.isArray(response.data) ? response.data : (response.data?.content || []);
      return rawList.map((raw: any) => ({
        id: String(raw.id),
        predictionId: raw.predictionId ? String(raw.predictionId) : undefined,
        alertType: raw.alertType || 'ATM_HOTSPOT_PREDICTION',
        riskScore: raw.riskScore ?? 0,
        riskLevel: raw.riskLevel || 'HIGH',
        message: raw.message || 'Elevated Risk Alert',
        status: raw.status || 'NEW',
        createdAt: raw.createdAt || new Date().toISOString(),
        acknowledgedAt: raw.acknowledgedAt,
        assignedTo: raw.assignedOfficerName || raw.assignedTo,
        atmCode: raw.atmCode,
        atmId: raw.atmId || raw.atmCode,
        district: raw.district || (raw.message?.includes('Bandra') ? 'Mumbai Suburban' : raw.message?.includes('HITEC') ? 'Hyderabad' : 'New Delhi'),
        location: {
          lat: raw.latitude ?? raw.location?.lat ?? 28.6328,
          lng: raw.longitude ?? raw.location?.lng ?? 77.2197,
        },
        reasons: raw.reasons || []
      }));
    } catch (err) {
      console.warn('Backend alerts query error, falling back to tactical alerts dataset', err);
      return [...MOCK_ALERTS];
    }
  },

  async getAlertById(id: string): Promise<Alert> {
    try {
      const response = await apiClient.get<any>(`/alerts/${id}`);
      const raw = response.data;
      return {
        id: String(raw.id),
        predictionId: raw.predictionId ? String(raw.predictionId) : undefined,
        alertType: raw.alertType || 'ATM_HOTSPOT_PREDICTION',
        riskScore: raw.riskScore ?? 0,
        riskLevel: raw.riskLevel || 'HIGH',
        message: raw.message || 'Elevated Risk Alert',
        status: raw.status || 'NEW',
        createdAt: raw.createdAt || new Date().toISOString(),
        acknowledgedAt: raw.acknowledgedAt,
        assignedTo: raw.assignedOfficerName || raw.assignedTo,
        atmCode: raw.atmCode,
        atmId: raw.atmId || raw.atmCode,
        district: raw.district || (raw.message?.includes('Bandra') ? 'Mumbai Suburban' : raw.message?.includes('HITEC') ? 'Hyderabad' : 'New Delhi'),
        location: {
          lat: raw.latitude ?? raw.location?.lat ?? 28.6328,
          lng: raw.longitude ?? raw.location?.lng ?? 77.2197,
        },
        reasons: raw.reasons || []
      };
    } catch (err) {
      console.warn('Backend alert by ID query error, falling back to mock alert', err);
      const alert = MOCK_ALERTS.find((a) => a.id === id);
      if (!alert) throw new Error('Alert not found');
      return alert;
    }
  },

  async acknowledgeAlert(id: string): Promise<Alert> {
    if (authService.isMockMode()) {
      const alert = MOCK_ALERTS.find((a) => a.id === id);
      if (alert) {
        alert.status = 'ACKNOWLEDGED';
        alert.acknowledgedAt = new Date().toISOString();
      }
      return alert || MOCK_ALERTS[0];
    }
    const response = await apiClient.patch<any>(`/alerts/${id}/acknowledge`);
    const raw = response.data;
    return {
      id: String(raw.id),
      predictionId: raw.predictionId ? String(raw.predictionId) : undefined,
      alertType: raw.alertType || 'ATM_HOTSPOT_PREDICTION',
      riskScore: raw.riskScore ?? 0,
      riskLevel: raw.riskLevel || 'HIGH',
      message: raw.message || 'Elevated Risk Alert',
      status: raw.status || 'ACKNOWLEDGED',
      createdAt: raw.createdAt || new Date().toISOString(),
      acknowledgedAt: raw.acknowledgedAt || new Date().toISOString(),
      assignedTo: raw.assignedOfficerName || raw.assignedTo,
      atmCode: raw.atmCode,
      district: raw.district || 'New Delhi',
      location: {
        lat: raw.latitude ?? 28.6328,
        lng: raw.longitude ?? 77.2197,
      }
    };
  },

  async assignAlert(id: string, officerIdOrName: string): Promise<Alert> {
    if (authService.isMockMode()) {
      const alert = MOCK_ALERTS.find((a) => a.id === id);
      if (alert) {
        alert.status = 'ASSIGNED';
        alert.assignedTo = officerIdOrName;
      }
      return alert || MOCK_ALERTS[0];
    }
    // Check if valid UUID, otherwise pass demo officer UUID (Inspector Vikram Roy)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(officerIdOrName);
    const officerId = isUuid ? officerIdOrName : 'b0000000-0000-0000-0000-000000000002';
    const response = await apiClient.patch<any>(`/alerts/${id}/assign`, { officerId });
    const raw = response.data;
    return {
      id: String(raw.id),
      predictionId: raw.predictionId ? String(raw.predictionId) : undefined,
      alertType: raw.alertType || 'ATM_HOTSPOT_PREDICTION',
      riskScore: raw.riskScore ?? 0,
      riskLevel: raw.riskLevel || 'HIGH',
      message: raw.message || 'Elevated Risk Alert',
      status: raw.status || 'ASSIGNED',
      createdAt: raw.createdAt || new Date().toISOString(),
      acknowledgedAt: raw.acknowledgedAt,
      assignedTo: raw.assignedOfficerName || officerIdOrName,
      atmCode: raw.atmCode,
      district: raw.district || 'New Delhi',
      location: {
        lat: raw.latitude ?? 28.6328,
        lng: raw.longitude ?? 77.2197,
      }
    };
  }
};
