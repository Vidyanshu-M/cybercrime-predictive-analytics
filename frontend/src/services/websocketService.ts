import { Client } from '@stomp/stompjs';
import { Alert } from '../types';
import { MOCK_ALERTS, MOCK_ATMS } from './mockData';

type AlertListener = (alert: Alert) => void;

class WebSocketService {
  private listeners: AlertListener[] = [];
  private simulationInterval: number | null = null;
  private isConnected: boolean = false;
  private stompClient: Client | null = null;

  public connect(url: string = 'ws://localhost:8080/ws'): void {
    const isMock = localStorage.getItem('cybertrace_use_mock') === 'true';

    if (isMock) {
      this.startMockSimulation();
      return;
    }

    try {
      if (this.stompClient && this.stompClient.active) {
        return;
      }

      this.stompClient = new Client({
        brokerURL: url,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => {
          console.debug('[STOMP]', str);
        },
        onConnect: () => {
          this.isConnected = true;
          console.log('STOMP WebSocket connected to Spring broker');

          this.stompClient?.subscribe('/topic/alerts', (message) => {
            try {
              const raw = JSON.parse(message.body);
              const alertData: Alert = {
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
                district: raw.district || 'New Delhi',
                location: {
                  lat: raw.latitude ?? raw.location?.lat ?? 28.6328,
                  lng: raw.longitude ?? raw.location?.lng ?? 77.2197,
                },
                reasons: raw.reasons || []
              };
              this.notifyListeners(alertData);
            } catch (e) {
              console.error('Failed to parse STOMP alert message', e);
            }
          });
        },
        onStompError: (frame) => {
          console.warn('Broker reported error: ' + frame.headers['message']);
          console.warn('Additional details: ' + frame.body);
        },
        onWebSocketClose: () => {
          this.isConnected = false;
        },
        onWebSocketError: (event) => {
          console.warn('STOMP WebSocket connection error', event);
        }
      });

      this.stompClient.activate();
    } catch (err) {
      console.warn('Failed to initialize STOMP client', err);
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
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    this.isConnected = false;
  }
}

export const websocketService = new WebSocketService();
