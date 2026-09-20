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
    try {
      const response = await apiClient.get<any>('/dashboard/summary');
      const raw = response.data;
      return {
        totalComplaints: raw.totalComplaints ?? MOCK_DASHBOARD_SUMMARY.totalComplaints,
        activeHotspots: raw.criticalHotspots ?? MOCK_DASHBOARD_SUMMARY.activeHotspots,
        highRiskATMs: raw.highRiskAtms?.length ?? MOCK_DASHBOARD_SUMMARY.highRiskATMs,
        pendingAlerts: raw.activeAlerts ?? MOCK_DASHBOARD_SUMMARY.pendingAlerts,
        avgResponseTimeMinutes: MOCK_DASHBOARD_SUMMARY.avgResponseTimeMinutes,
        fraudAmountPrevented: raw.totalFraudAmount ? Number(raw.totalFraudAmount) : MOCK_DASHBOARD_SUMMARY.fraudAmountPrevented,
        riskDistribution: MOCK_DASHBOARD_SUMMARY.riskDistribution,
        recentAlerts: (raw.recentAlerts || []).map((alt: any) => ({
          id: String(alt.id),
          predictionId: alt.predictionId ? String(alt.predictionId) : undefined,
          alertType: alt.alertType || 'ATM_HOTSPOT_PREDICTION',
          riskScore: alt.riskScore ?? 0,
          riskLevel: alt.riskLevel || 'HIGH',
          message: alt.message || 'Elevated Risk Alert',
          status: alt.status || 'NEW',
          createdAt: alt.createdAt || new Date().toISOString(),
          acknowledgedAt: alt.acknowledgedAt,
          assignedTo: alt.assignedOfficerName || alt.assignedTo,
          atmCode: alt.atmCode,
          atmId: alt.atmCode,
          district: 'New Delhi',
          location: {
            lat: alt.latitude ?? 28.6328,
            lng: alt.longitude ?? 77.2197,
          }
        })),
        recentComplaints: MOCK_DASHBOARD_SUMMARY.recentComplaints,
        hourlyRiskTrend: MOCK_DASHBOARD_SUMMARY.hourlyRiskTrend,
        topDistrictRisks: MOCK_DASHBOARD_SUMMARY.topDistrictRisks
      };
    } catch {
      return MOCK_DASHBOARD_SUMMARY;
    }
  },

  async getMLModelMetrics(): Promise<MLModelMetrics> {
    if (authService.isMockMode()) {
      await new Promise((res) => setTimeout(res, 300));
      return MOCK_ML_METRICS;
    }
    try {
      const response = await apiClient.get<any>('/analytics/overview');
      const raw = response.data;
      const perf = raw?.modelPerformanceMetrics;

      if (perf) {
        return {
          modelVersion: perf.model || MOCK_ML_METRICS.modelVersion,
          precision: typeof perf.precision === 'number' ? perf.precision : MOCK_ML_METRICS.precision,
          recall: typeof perf.recall === 'number' ? perf.recall : MOCK_ML_METRICS.recall,
          f1Score: typeof perf.f1Score === 'number' ? perf.f1Score : MOCK_ML_METRICS.f1Score,
          rocAuc: typeof perf.rocAuc === 'number' ? perf.rocAuc : MOCK_ML_METRICS.rocAuc,
          prAuc: typeof perf.prAuc === 'number' ? perf.prAuc : MOCK_ML_METRICS.prAuc,
          trainedAt: MOCK_ML_METRICS.trainedAt,
          datasetSize: MOCK_ML_METRICS.datasetSize,
          featureImportance: MOCK_ML_METRICS.featureImportance
        };
      }
      return MOCK_ML_METRICS;
    } catch (err) {
      console.warn('Could not fetch ML metrics from backend, using baseline metrics:', err);
      return MOCK_ML_METRICS;
    }
  }
};
