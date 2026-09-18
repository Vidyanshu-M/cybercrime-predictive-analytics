import { apiClient } from './api';
import { Prediction, PredictionRunRequest, RiskZone, ATM } from '../types';
import { MOCK_PREDICTIONS, MOCK_RISK_ZONES, MOCK_ATMS } from './mockData';
import { authService } from './authService';

export const predictionService = {
  async getPredictions(): Promise<Prediction[]> {
    if (authService.isMockMode()) {
      await new Promise((res) => setTimeout(res, 300));
      return MOCK_PREDICTIONS;
    }
    const response = await apiClient.get<Prediction[]>('/predictions');
    return response.data;
  },

  async runPrediction(request: PredictionRunRequest): Promise<Prediction> {
    if (authService.isMockMode()) {
      await new Promise((res) => setTimeout(res, 800));
      
      const atm = MOCK_ATMS.find((a) => a.id === request.atmId || a.atmCode === request.atmId) || MOCK_ATMS[0];
      
      // Calculate dynamic risk score based on ATM
      const calculatedScore = Math.floor(Math.random() * 25) + 75; // 75 - 99 for demo
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
  },

  async getRiskZones(): Promise<RiskZone[]> {
    if (authService.isMockMode()) {
      await new Promise((res) => setTimeout(res, 300));
      return MOCK_RISK_ZONES;
    }
    const response = await apiClient.get<RiskZone[]>('/map/risk-zones');
    return response.data;
  },

  async getATMs(): Promise<ATM[]> {
    if (authService.isMockMode()) {
      return MOCK_ATMS;
    }
    const response = await apiClient.get<ATM[]>('/atms');
    return response.data;
  }
};
