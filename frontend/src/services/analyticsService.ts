import { apiClient } from './api';
import { DashboardSummary, MLModelMetrics } from '../types';
import { MOCK_DASHBOARD_SUMMARY, MOCK_ML_METRICS } from './mockData';
import { authService } from './authService';

export const analyticsService = {
  async getDashboardSummary(): Promise<DashboardSummary> {
    if (authService.isMockMode()) {
      await new Promise((res) => setTimeout(res, 300));
      return MOCK_DASHBOARD_SUMMARY;
    }
    const response = await apiClient.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },

  async getMLModelMetrics(): Promise<MLModelMetrics> {
    if (authService.isMockMode()) {
      await new Promise((res) => setTimeout(res, 300));
      return MOCK_ML_METRICS;
    }
    const response = await apiClient.get<MLModelMetrics>('/analytics/model-metrics');
    return response.data;
  }
};
