import { Alert } from '../types';
import { MOCK_ALERTS, MOCK_ATMS } from './mockData';

type AlertListener = (alert: Alert) => void;

class WebSocketService {
  private listeners: AlertListener[] = [];
  private simulationInterval: number | null = null;
  private isConnected: boolean = false;

  public connect(url: string = 'ws://localhost:8080/ws'): void {
    const isMock = localStorage.getItem('cybertrace_use_mock') !== 'false';

    if (isMock) {
      this.startMockSimulation();
      return;
    }

    try {
      const socket = new WebSocket(url);
      
      socket.onopen = () => {
        this.isConnected = true;
        console.log('WebSocket connected to backend server');
      };

      socket.onmessage = (event) => {
        try {
          const alertData: Alert = JSON.parse(event.data);
          this.notifyListeners(alertData);
        } catch (e) {
          console.error('Failed to parse WebSocket alert message', e);
        }
      };

      socket.onerror = (err) => {
        console.warn('WebSocket connection error, falling back to mock stream', err);
        this.startMockSimulation();
      };

      socket.onclose = () => {
        this.isConnected = false;
      };
    } catch {
      this.startMockSimulation();
    }
  }

  public subscribe(listener: AlertListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(alert: Alert): void {
    this.listeners.forEach((listener) => listener(alert));
  }

  private startMockSimulation(): void {
    if (this.simulationInterval) return;
    this.isConnected = true;

    // Periodically push simulated live cybercrime alerts every 45 seconds during demo
    this.simulationInterval = window.setInterval(() => {
      if (this.listeners.length === 0) return;

      const randomAtm = MOCK_ATMS[Math.floor(Math.random() * MOCK_ATMS.length)];
      const riskScore = Math.floor(Math.random() * 20) + 80;

      const simulatedAlert: Alert = {
        id: `ALT-LIVE-${Date.now().toString().slice(-4)}`,
        alertType: 'ATM_HOTSPOT_PREDICTION',
        riskScore,
        riskLevel: riskScore >= 90 ? 'CRITICAL' : 'HIGH',
        message: `LIVE ALERT: ${randomAtm.bankName} (${randomAtm.atmCode}) spatial risk spike in ${randomAtm.district}!`,
        status: 'NEW',
        createdAt: new Date().toISOString(),
        atmId: randomAtm.id,
        atmCode: randomAtm.atmCode,
        district: randomAtm.district,
        location: randomAtm.location,
        reasons: [
          `Rapid cash withdrawal surge detected at ${randomAtm.area}`,
          `Matching 1.0 km NCRP cyber fraud complaint cluster`
        ]
      };

      MOCK_ALERTS.unshift(simulatedAlert);
      this.notifyListeners(simulatedAlert);
    }, 45000);
  }

  public triggerManualDemoAlert(atmCode?: string): Alert {
    const targetAtm = MOCK_ATMS.find((a) => a.atmCode === atmCode) || MOCK_ATMS[0];
    const demoAlert: Alert = {
      id: `ALT-DEMO-${Date.now().toString().slice(-4)}`,
      alertType: 'ATM_HOTSPOT_PREDICTION',
      riskScore: 93,
      riskLevel: 'CRITICAL',
      message: `DEMO ALERT: High-Probability Cash Out Surge Predicted at ${targetAtm.bankName} (${targetAtm.atmCode})!`,
      status: 'NEW',
      createdAt: new Date().toISOString(),
      atmId: targetAtm.id,
      atmCode: targetAtm.atmCode,
      district: targetAtm.district,
      location: targetAtm.location,
      reasons: [
        `XGBoost Model Prediction Confidence: 94.2%`,
        `5 NCRP complaints lodged within 1.0 km radius in past 6 hrs`,
        `Withdrawal velocity burst (+410% over historical baseline)`
      ]
    };

    MOCK_ALERTS.unshift(demoAlert);
    this.notifyListeners(demoAlert);
    return demoAlert;
  }

  public disconnect(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.isConnected = false;
  }
}

export const websocketService = new WebSocketService();
