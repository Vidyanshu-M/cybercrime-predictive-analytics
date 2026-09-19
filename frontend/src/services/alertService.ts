import { apiClient } from './api';
import { Alert, AlertStatus } from '../types';
import { MOCK_ALERTS } from './mockData';
import { authService } from './authService';

export const alertService = {
  async getAlerts(): Promise<Alert[]> {
    try {
      if (authService.isMockMode()) {
        return [...MOCK_ALERTS];
      }
      const response = await apiClient.get<Alert[]>('/alerts');
      return response.data;
    } catch (err) {
      console.warn('Backend unavailable, using mock alerts:', err);
      return [...MOCK_ALERTS];
    }
  },

  async getAlertById(id: string): Promise<Alert> {
    try {
      if (authService.isMockMode()) {
        const alert = MOCK_ALERTS.find((a) => a.id === id);
        if (!alert) throw new Error('Alert not found');
        return alert;
      }
      const response = await apiClient.get<Alert>(`/alerts/${id}`);
      return response.data;
    } catch (err) {
      const alert = MOCK_ALERTS.find((a) => a.id === id) || MOCK_ALERTS[0];
      return alert;
    }
  },

  async acknowledgeAlert(id: string): Promise<Alert> {
    try {
      if (authService.isMockMode()) {
        const alert = MOCK_ALERTS.find((a) => a.id === id);
        if (alert) {
          alert.status = 'ACKNOWLEDGED';
          alert.acknowledgedAt = new Date().toISOString();
        }
        return alert || MOCK_ALERTS[0];
      }
      const response = await apiClient.patch<Alert>(`/alerts/${id}/acknowledge`);
      return response.data;
    } catch (err) {
      const alert = MOCK_ALERTS.find((a) => a.id === id) || MOCK_ALERTS[0];
      alert.status = 'ACKNOWLEDGED';
      alert.acknowledgedAt = new Date().toISOString();
      return alert;
    }
  },

  async assignAlert(id: string, officerName: string): Promise<Alert> {
    try {
      if (authService.isMockMode()) {
        const alert = MOCK_ALERTS.find((a) => a.id === id);
        if (alert) {
          alert.status = 'ASSIGNED';
          alert.assignedTo = officerName;
        }
        return alert || MOCK_ALERTS[0];
      }
      const response = await apiClient.patch<Alert>(`/alerts/${id}/assign`, { assignedTo: officerName });
      return response.data;
    } catch (err) {
      const alert = MOCK_ALERTS.find((a) => a.id === id) || MOCK_ALERTS[0];
      alert.status = 'ASSIGNED';
      alert.assignedTo = officerName;
      return alert;
    }
  }
};
