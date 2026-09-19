import { apiClient } from './api';
import { Transaction } from '../types';
import { MOCK_TRANSACTIONS } from './mockData';
import { authService } from './authService';

export interface TransactionFilterParams {
  riskOnly?: boolean;
  atmId?: string;
  district?: string;
  minAmount?: number;
  timeWindowHours?: number;
}

export const transactionService = {
  async getTransactions(params?: TransactionFilterParams): Promise<Transaction[]> {
    if (authService.isMockMode()) {
      await new Promise((res) => setTimeout(res, 150));
      let filtered = [...MOCK_TRANSACTIONS];

      if (params?.riskOnly) {
        filtered = filtered.filter((t) => t.riskLabel === 1);
      }
      if (params?.atmId) {
        filtered = filtered.filter((t) => t.atmId === params.atmId);
      }
      if (params?.minAmount) {
        filtered = filtered.filter((t) => t.amount >= params.minAmount!);
      }

      return filtered;
    }

    try {
      const response = await apiClient.get<Transaction[]>('/transactions', {
        params: {
          riskLabel: params?.riskOnly ? '1' : undefined,
          atmId: params?.atmId,
          size: 100
        }
      });
      return response.data;
    } catch (err) {
      console.warn('Backend transactions unavailable, falling back to mock dataset', err);
      return MOCK_TRANSACTIONS;
    }
  },

  async getSuspiciousWithdrawals(): Promise<Transaction[]> {
    return this.getTransactions({ riskOnly: true });
  }
};
