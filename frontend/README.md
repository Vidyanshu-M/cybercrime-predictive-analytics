# CyberTrace Frontend - Tactical Command & Officer Dashboard

> **Modern, Real-Time Web Application for Law Enforcement & Financial Fraud Analytics**  
> Built with React 18, Vite 6, TypeScript, TailwindCSS, Leaflet, and STOMP WebSockets.

---

## 1. Overview

The CyberTrace Frontend is an interactive command dashboard designed for state cyber cells, I4C officers, and bank fraud risk management (FRM) teams. It provides spatial-temporal visualization of ATM fraud risk, real-time live alert dispatch, comprehensive case investigation management, and deep analytics.

### Key Capabilities
- **Tactical Map View (`/map`)**:
  - Interactive Leaflet map with dark/light tactical styling.
  - 500+ ATM nodes with custom clustering and risk classification (CRITICAL, HIGH, MEDIUM, LOW).
  - PostGIS RiskZone polygon buffers around high-risk ATMs.
  - Interactive radius filtering, time-window selection, and live prediction triggering.
- **Officer Dashboard (`/dashboard`)**:
  - Real-time statistics, threat distribution charts, and recent fraud activity feed.
- **Alert Operations (`/alerts`, `/alerts/:id`)**:
  - Live STOMP WebSocket alert subscriptions (`/topic/alerts`).
  - Alert acknowledgment, severity badge filters, and officer assignment.
- **Case Management (`/cases`, `/cases/:id`)**:
  - Full investigation tracking, complaint linking, and digital evidence repository.
- **Analytics & Reporting (`/analytics`)**:
  - Historical temporal trends, crime category breakdown, and bank-wise risk matrices using Recharts.
- **Settings & Config (`/settings`)**:
  - Backend API connection status, STOMP endpoint toggles, and UI preferences.

---

## 2. Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 18.3** | Component architecture & state handling |
| **Vite 6** | Ultra-fast HMR and bundling |
| **TypeScript 5.7** | Type safety across API DTOs and UI states |
| **TailwindCSS 3.4** | Utility-first responsive styling with custom cyber-security palette |
| **Leaflet & React-Leaflet** | Interactive geospatial GIS mapping |
| **@stomp/stompjs** | Resilient WebSocket connection to Spring Boot STOMP broker |
| **Recharts 2.15** | Data visualization for threat trends and analytics |
| **Lucide React** | Consistent tactical icons |

---

## 3. Directory Structure

```
frontend/
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable UI widgets (Modal, Navbar, Sidebar, Badges, ThemeToggle)
│   ├── context/             # Theme and application contexts
│   ├── features/
│   │   └── map/             # ATMMap, RadiusFilter, RiskHeatmapLayer, ZonePolygonsLayer, MapControls
│   ├── layouts/             # MainLayout, AuthLayout
│   ├── pages/               # DashboardPage, RiskMapPage, AlertsPage, CasesPage, AnalyticsPage, SettingsPage, LoginPage
│   ├── services/            # Axios API clients, WebSocket STOMP service, predictionService
│   ├── types/               # TypeScript interfaces matching backend DTOs
│   ├── App.tsx              # React router configuration
│   ├── index.css            # Global CSS & Tailwind imports
│   └── main.tsx             # Application bootstrap
├── package.json             # Scripts and dependencies
├── tailwind.config.js       # Tailwind theme configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite proxy & server setup
```

---

## 4. Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Installation
```bash
npm install
```

### Environment Configuration
The frontend automatically proxies `/api` and `/ws` to the Spring Boot backend (`http://localhost:8080`) through `vite.config.ts`.

Create a `.env` file if custom overrides are needed:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080/ws
```

### Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Linting
```bash
# Type check and build
npm run build

# Type check without emitting
npm run lint

# Preview production build locally
npm run preview
```

---

## 5. Default Login Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **System Admin** | `admin@cybertrace.gov.in` | `password123` |
| **I4C / State Officer** | `officer@cybertrace.gov.in` | `password123` |
| **Data Analyst** | `analyst@cybertrace.gov.in` | `password123` |
