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
      const response = await apiClient.get<any>('/transactions', {
        params: {
          riskLabel: params?.riskOnly ? '1' : undefined,
          atmId: params?.atmId,
          size: 100
        }
      });
      const rawList = Array.isArray(response.data)
        ? response.data
        : (response.data?.content || []);

      return rawList.map((raw: any) => ({
        id: String(raw.id || raw.transactionReference || Math.random().toString(36).substring(7)),
        transactionReference: raw.transactionReference || 'TXN-UNKNOWN',
        transactionTime: raw.transactionTime || new Date().toISOString(),
        amount: Number(raw.amount || 0),
        transactionType: raw.transactionType || 'ATM_WITHDRAWAL',
        accountId: raw.tokenizedAccountRef || raw.accountId || 'ACC-****',
        atmId: raw.atmCode || raw.atmId || '',
        location: {
          lat: raw.latitude ?? raw.location?.lat ?? 28.6328,
          lng: raw.longitude ?? raw.location?.lng ?? 77.2197
        },
        riskLabel: raw.riskLabel === '1' || raw.riskLabel === 1 || raw.riskLabel === 'SUSPICIOUS' ? 1 : 0,
        complaintId: raw.complaintId
      }));
    } catch (err) {
      console.warn('Backend transactions unavailable, falling back to mock dataset', err);
      return MOCK_TRANSACTIONS;
    }
  },

  async getSuspiciousWithdrawals(): Promise<Transaction[]> {
    return this.getTransactions({ riskOnly: true });
  }
};
