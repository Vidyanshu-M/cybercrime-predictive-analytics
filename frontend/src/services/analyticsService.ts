import { apiClient } from './api';
import { DashboardSummary, MLModelMetrics } from '../types';
import { MOCK_DASHBOARD_SUMMARY, MOCK_ML_METRICS } from './mockData';
import { authService } from './authService';

export const analyticsService = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      if (authService.isMockMode()) {
        return MOCK_DASHBOARD_SUMMARY;
      }
      const response = await apiClient.get<DashboardSummary>('/dashboard/summary');
      return response.data;
    } catch (err) {
      console.warn('Backend unavailable, using mock dashboard summary:', err);
      return MOCK_DASHBOARD_SUMMARY;
    }
  },

  async getMLModelMetrics(): Promise<MLModelMetrics> {
    try {
      if (authService.isMockMode()) {
        return MOCK_ML_METRICS;
      }
      const response = await apiClient.get<MLModelMetrics>('/analytics/model-metrics');
      return response.data;
    } catch (err) {
      console.warn('Backend unavailable, using mock ML metrics:', err);
      return MOCK_ML_METRICS;
    }
  }
};
