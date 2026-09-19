import { apiClient } from './api';
import { Prediction, PredictionRunRequest, RiskZone, ATM } from '../types';
import { MOCK_PREDICTIONS, MOCK_RISK_ZONES, MOCK_ATMS } from './mockData';
import { authService } from './authService';

export const predictionService = {
  async getPredictions(): Promise<Prediction[]> {
    try {
      if (authService.isMockMode()) {
        return MOCK_PREDICTIONS;
      }
      const response = await apiClient.get<Prediction[]>('/predictions');
      return response.data;
    } catch (err) {
      console.warn('Backend unavailable, using mock predictions:', err);
      return MOCK_PREDICTIONS;
    }
  },

  async runPrediction(request: PredictionRunRequest): Promise<Prediction> {
    try {
      if (authService.isMockMode()) {
        const atm = MOCK_ATMS.find((a) => a.id === request.atmId || a.atmCode === request.atmId) || MOCK_ATMS[0];
        const calculatedScore = Math.floor(Math.random() * 25) + 75;
        const calculatedProb = calculatedScore / 100;
        const now = new Date();
        const endTime = new Date(now.getTime() + (request.predictionWindowMinutes || 180) * 60000);

        const newPrediction: Prediction = {
          id: `PRED-${Date.now().toString().slice(-4)}`,
          atmId: atm.id,
          atmCode: atm.atmCode,
          predictionTime: now.toISOString(),
          probability: calculatedProb,
          riskScore: calculatedScore,
          riskLevel: calculatedScore >= 80 ? 'CRITICAL' : calculatedScore >= 60 ? 'HIGH' : 'MEDIUM',
          modelVersion: 'xgb-v1',
          confidence: 0.93,
          predictionWindow: {
            start: now.toISOString(),
            end: endTime.toISOString(),
          },
          reasons: [
            `Elevated withdrawal velocity detected at ${atm.bankName} (${atm.atmCode})`,
            `3 active complaints reported within 1.5 km in past 6 hours`,
            `Spatial pattern match for ${atm.district} high-risk window`
          ]
        };

        MOCK_PREDICTIONS.unshift(newPrediction);
        return newPrediction;
      }

      const response = await apiClient.post<Prediction>('/predictions/run', request);
      return response.data;
    } catch (err) {
      console.warn('Backend prediction endpoint unavailable, running local mock inference:', err);
      const atm = MOCK_ATMS.find((a) => a.id === request.atmId || a.atmCode === request.atmId) || MOCK_ATMS[0];
      const now = new Date();
      return {
        id: `PRED-${Date.now().toString().slice(-4)}`,
        atmId: atm.id,
        atmCode: atm.atmCode,
        predictionTime: now.toISOString(),
        probability: 0.89,
        riskScore: 89,
        riskLevel: 'CRITICAL',
        modelVersion: 'xgb-v1',
        confidence: 0.94,
        predictionWindow: {
          start: now.toISOString(),
          end: new Date(now.getTime() + 10800000).toISOString()
        },
        reasons: [
          `Elevated withdrawal velocity detected at ${atm.bankName}`,
          `NCRP complaint density spike in 1km proximity`
        ]
      };
    }
  },

  async getRiskZones(): Promise<RiskZone[]> {
    try {
      if (authService.isMockMode()) {
        return MOCK_RISK_ZONES;
      }
      const response = await apiClient.get<RiskZone[]>('/map/risk-zones');
      return response.data;
    } catch (err) {
      console.warn('Backend unavailable, using mock risk zones:', err);
      return MOCK_RISK_ZONES;
    }
  },

  async getATMs(): Promise<ATM[]> {
    try {
      if (authService.isMockMode()) {
        return MOCK_ATMS;
      }
      const response = await apiClient.get<ATM[]>('/atms');
      return response.data;
    } catch (err) {
      console.warn('Backend unavailable, using mock ATMs:', err);
      return MOCK_ATMS;
    }
  }
};
