# Cybercrime Predictive Analytics (CyberTrace)

> **Geospatial Cybercrime Intelligence & ATM Fraud Burst Early-Warning Platform**  
> Built for Law Enforcement Agencies (I4C, State Cyber Cells) and Financial Institutions (Bank FRM Teams).

[![ML Model: xgb-v1](https://img.shields.io/badge/Model-XGBoost%20xgb--v1-blue.svg)](ml-service/models/final/model_metadata.json)
[![Architecture: Frozen Full Stack](https://img.shields.io/badge/Architecture-End--to--End%20Verified-brightgreen.svg)](docs/DEMO_RUNBOOK.md)
[![PostGIS: 3.6](https://img.shields.io/badge/PostGIS-3.6-orange.svg)](#)
[![Spring Boot: 3.3.0](https://img.shields.io/badge/Spring%20Boot-3.3.0-green.svg)](#)
[![React: 18.3](https://img.shields.io/badge/React-18.3-61dafb.svg)](#)

---

## 1. System Overview

Cybercrime mule networks rapidly coordinate illicit cash withdrawals across ATM corridors immediately following phishing, vishing, and SIM-swap fraud. **CyberTrace** bridges the intelligence gap between victim complaints and physical cash-outs by predicting imminent withdrawal surges **3 hours in advance** using spatial-temporal machine learning.

When an elevated threat is predicted ($\text{Risk Score} \ge 60$), the platform automatically:
1. Generates a **PostGIS polygon buffer** ($\approx 800\text{ m}$ surveillance corridor) around the high-risk ATM.
2. Dispatches real-time tactical alerts via **Spring STOMP WebSockets** to the Officer Command Dashboard without page refresh.
3. Facilitates an end-to-end investigation workflow (**Acknowledge Alert $\rightarrow$ Assign Officer $\rightarrow$ Case Linking**).

---

## 2. Full-Stack Architecture

```
                      +---------------------------------------+
                      |       React 18 + Vite Frontend        |
                      |        http://localhost:3000          |
                      |   Tactical Command & Officer Hub      |
                      +-------------------+-------------------+
                                          |
                        REST (/api)       |   STOMP WebSocket (/ws)
                                          |   /topic/alerts
                                          v
                      +-------------------+-------------------+
                      |        Spring Boot 3.3.0 Core         |
                      |        http://localhost:8080          |
                      |   MlFeatureService | AlertService    |
                      |   PredictionService| MapService       |
                      +---------+-------------------+---------+
                                |                   |
                 JPA / Spatial  |                   | HTTP REST
                 Queries (21)   |                   | POST /predict
                                v                   v
        +-----------------------+----+   +----------+-----------------------+
        |  PostgreSQL 16 + PostGIS   |   |   Python FastAPI ML Engine       |
        |   localhost:5432           |   |   http://127.0.0.1:8000          |
        |   Database: cybercrime_db  |   |   Model: xgb-v1 (Frozen)         |
        |   - 17 Relational Tables   |   |   - 21 Features Engine           |
        |   - ST_Buffer Spatial Risk |   |   - 180-Minute Prediction Horizon|
        +----------------------------+   +----------------------------------+
```

---

## 3. Technology Stack

- **Machine Learning**: Python 3.10+, XGBoost (`xgb-v1`), Scikit-learn, Joblib, FastAPI, Uvicorn, Pydantic.
- **Backend Core**: Java 17, Spring Boot 3.3.0, Spring Data JPA, Hibernate Spatial, Flyway, Spring Security, JWT, Spring WebSocket (STOMP).
- **Spatial Database**: PostgreSQL 16.1, PostGIS 3.6 (`USE_GEOS=1 USE_PROJ=1 USE_STATS=1`).
- **Frontend**: React 18, TypeScript 5.7, Vite 6, TailwindCSS, Leaflet, React-Leaflet, `@stomp/stompjs`, Lucide React.

---

## 4. Machine Learning Model Evaluation

Evaluated strictly on the **synthetic/anonymized temporal holdout test dataset** ($N = 4,500$ instances, 188 positive fraud bursts, 4.18% base rate, date range `2026-07-25` to `2026-08-31`) with zero data leakage:

| Metric | Score | Benchmark Description |
| :--- | :---: | :--- |
| **ROC-AUC** | **99.77%** | Global discriminative capability across all risk thresholds. |
| **PR-AUC** | **95.30%** | Precision-recall area under heavy class imbalance. |
| **Accuracy** | **98.89%** | Total classification accuracy across all time windows. |
| **F1 Score** | **86.77%** | Harmonic mean of precision and recall at 0.50 threshold. |
| **Precision** | **86.32%** | True positive accuracy (minimizes false alarms for law enforcement). |
| **Recall** | **87.23%** | Detection rate of imminent fraudulent cash-out bursts. |

*Note: Evaluated under controlled benchmark conditions on the project's temporal test split. Decision-support framework designed for patrol dispatch prioritization.*  
*Model Artifact: `ml-service/models/final/xgboost_fraud_predictor.joblib`*  
*Full Metrics Metadata: `ml-service/models/final/final_test_metrics.json`*

---

## 5. Quickstart & Orchestration

The repository includes unified PowerShell automation scripts for idempotent startup and teardown:

### 1. Launch All Services
```powershell
powershell -ExecutionPolicy Bypass -File .\start-all.ps1
```
*Automatically detects running instances, launches missing services in the background, and runs the health check.*

### 2. Verify System Health
```powershell
powershell -ExecutionPolicy Bypass -File .\health-check.ps1
```
*Probes PostgreSQL (5432), FastAPI (8000), Spring Boot (8080), and Vite (3000).*

### 3. Graceful Teardown
```powershell
powershell -ExecutionPolicy Bypass -File .\stop-all.ps1
```

---

## 6. Access Endpoints & Documentation

| Tier | URL | Purpose |
| :--- | :--- | :--- |
| **Officer Dashboard** | [http://localhost:3000](http://localhost:3000) | Tactical command center, live prediction runner, GIS map. |
| **Spring Boot Backend** | [http://localhost:8080/api](http://localhost:8080/api) | REST API core. |
| **Swagger UI** | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) | Interactive API documentation. |
| **FastAPI ML Docs** | [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) | OpenAPI documentation for `/predict` and `/health`. |
| **Frontend Docs** | [frontend/README.md](frontend/README.md) | React 18, Vite, Leaflet, and UI component documentation. |
| **ML Service Docs** | [ml-service/README.md](ml-service/README.md) | XGBoost model, feature vectors, and API contract. |
| **Demo Runbook** | [docs/DEMO_RUNBOOK.md](docs/DEMO_RUNBOOK.md) | Click-by-click 3–5 min presentation script. |

---

## 7. Default Authentication Credentials

Seed accounts pre-configured in the database:

| Role | Email | Password | Department |
| :--- | :--- | :--- | :--- |
| **Admin Officer** | `admin@cybertrace.gov.in` | `password123` | Cyber Operations Command |
| **I4C Rapid Response** | `officer@cybertrace.gov.in` | `password123` | I4C Rapid Response |
| **Data Analyst** | `analyst@cybertrace.gov.in` | `password123` | Predictive Analytics Wing |

---

## 8. Manual Step-by-Step Startup

If you prefer starting each service individually rather than using `start-all.ps1`:

### Step 1: PostgreSQL 16 with PostGIS
Ensure PostgreSQL is active on port `5432` with database `cybercrime_db`:
```bash
pg_ctl -D "path/to/data" start
```

### Step 2: FastAPI ML Service
```bash
cd ml-service
# Activate virtual environment
.\.venv\Scripts\activate  # On Windows
# Run FastAPI server
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
Verify: `http://127.0.0.1:8000/health`

### Step 3: Spring Boot Backend
```bash
# In the repository root
./mvnw spring-boot:run
```
Flyway automatically runs all database migrations (`V1` through `V6`).  
Verify: `http://localhost:8080/api/atms`

### Step 4: Vite React Frontend
```bash
cd frontend
npm install
npm run dev
```
Verify: `http://localhost:3000`

---

## 9. Demo Scenarios

See [docs/DEMO_RUNBOOK.md](docs/DEMO_RUNBOOK.md) for detailed presentation instructions:
1. **Scenario A (Fraud Burst - ATM1023)**:
   - Target: `ATM1023` (Connaught Place Outer Circle, New Delhi)
   - Result: Probability **99.82%**, Risk Score **100/100 (CRITICAL)**.
   - Outcome: Generated PostGIS RiskZone polygon buffer on map, real-time STOMP alert broadcast, acknowledged and assigned to `Inspector Vikram Roy`.
2. **Scenario B (Baseline Safe - ATM1025)**:
   - Target: `ATM1025` (Koramangala 5th Block, Bengaluru Urban)
   - Result: Probability **0.37%**, Risk Score **0/100 (LOW)**.
   - Outcome: No alert or RiskZone generated, proving high threshold precision.